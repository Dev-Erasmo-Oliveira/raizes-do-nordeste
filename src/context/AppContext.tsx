import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEMO, RULES } from '../config/rules';
import { CUPONS, PRODUTOS, RECOMPENSAS, getProduto, getUnidade, disponivelNaUnidade } from '../mocks';
import {
  arredondar,
  chaveDoItem,
  descontoDePontos,
  descontoDoCupom,
  gerarCodigoPedido,
  subtotalCarrinho,
  quantidadeNoCarrinho,
} from '../lib/pricing';
import { adicionarDias } from '../lib/format';
import { usePersistedState } from '../lib/storage';
import type {
  Canal,
  CanalSite,
  Carrinho,
  Consentimento,
  Cupom,
  ItemCarrinho,
  ItemPedido,
  MetodoPagamento,
  PapelOperacao,
  Pedido,
  StatusPedido,
  TipoToast,
  Toast,
  Usuario,
} from '../types';

export interface DadosPedido {
  unidadeId: string;
  canal: Canal;
  clienteId?: string;
  clienteNome: string;
  clienteTelefone?: string;
  clienteEmail?: string;
  itens: ItemPedido[];
  cupom?: Cupom;
  pontosUsados: number;
  metodo: MetodoPagamento;
  retiradaEm: string;
}

interface AppContextValue {
  usuarios: Usuario[];
  usuario: Usuario | null;
  sessaoId: string | null;
  consentimento: Consentimento | null;
  unidadeId: string | null;
  unidade: ReturnType<typeof getUnidade>;
  carrinho: Carrinho;
  pedidos: Pedido[];
  cuponsUsados: string[];
  canalSite: CanalSite;
  papel: PapelOperacao;
  toasts: Toast[];
  subtotal: number;
  quantidadeCarrinho: number;
  entrar: (email: string, senha: string) => { ok: boolean; erro?: string };
  cadastrar: (dados: {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    marketing: boolean;
  }) => { ok: boolean; erro?: string; campo?: string };
  sair: () => void;
  atualizarPerfil: (dados: { nome: string; telefone: string }) => void;
  atualizarMarketing: (ativo: boolean) => void;
  excluirConta: () => void;
  registrarConsentimento: (dados: Omit<Consentimento, 'versao' | 'data'>) => void;
  selecionarUnidade: (id: string) => void;
  adicionarAoCarrinho: (
    produtoId: string,
    adicionais: string[],
    quantidade: number,
    observacao: string,
  ) => boolean;
  atualizarQuantidade: (chave: string, quantidade: number) => void;
  removerItem: (chave: string) => void;
  limparCarrinho: () => void;
  criarPedido: (dados: DadosPedido, opcoes?: { limparCarrinho?: boolean }) => Pedido;
  aprovarPagamento: (codigo: string) => void;
  recusarPagamento: (codigo: string) => void;
  expirarPagamento: (codigo: string) => void;
  reiniciarPagamento: (codigo: string) => void;
  avancarStatus: (codigo: string) => void;
  cancelarPedido: (codigo: string) => void;
  resgatarRecompensa: (id: string) => Cupom | null;
  notificar: (mensagem: string, tipo?: TipoToast) => void;
  fecharToast: (id: string) => void;
  definirCanalSite: (canal: CanalSite) => void;
  definirPapel: (papel: PapelOperacao) => void;
  restaurarDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function criarUsuarioDemo(): Usuario {
  const agora = new Date().toISOString();
  return {
    id: 'u-demo',
    nome: 'Cliente Demo',
    email: DEMO.email,
    telefone: '(81) 99999-0000',
    senha: DEMO.senha,
    pontos: 120,
    extrato: [
      {
        id: 'ex-demo',
        tipo: 'ganho',
        pontos: 120,
        descricao: 'Pontos de boas-vindas',
        data: agora,
      },
    ],
    consentimentos: { termosEm: agora, marketing: false },
    cupons: [],
    criadoEm: agora,
  };
}

function agoraISO(): string {
  return new Date().toISOString();
}

function idUnico(prefixo: string): string {
  return `${prefixo}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = usePersistedState<Usuario[]>('raizes:usuarios', () => [
    criarUsuarioDemo(),
  ]);
  const [sessaoId, setSessaoId] = usePersistedState<string | null>('raizes:sessao', null);
  const [consentimento, setConsentimento] = usePersistedState<Consentimento | null>(
    'raizes:consentimento',
    null,
  );
  const [unidadeId, setUnidadeId] = usePersistedState<string | null>('raizes:unidade', null);
  const [carrinho, setCarrinho] = usePersistedState<Carrinho>('raizes:carrinho', {
    unidadeId: null,
    itens: [],
  });
  const [pedidos, setPedidos] = usePersistedState<Pedido[]>('raizes:pedidos', []);
  const [cuponsUsados, setCuponsUsados] = usePersistedState<string[]>('raizes:cupons-usados', []);
  const [canalSite, setCanalSite] = usePersistedState<CanalSite>('raizes:canal', 'web');
  const [papel, setPapel] = usePersistedState<PapelOperacao>('raizes:papel', 'atendente');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const usuario = useMemo(
    () => usuarios.find((item) => item.id === sessaoId) ?? null,
    [usuarios, sessaoId],
  );
  const unidade = useMemo(() => getUnidade(unidadeId), [unidadeId]);
  const subtotal = useMemo(() => subtotalCarrinho(carrinho.itens, PRODUTOS), [carrinho.itens]);
  const quantidadeCarrinho = useMemo(() => quantidadeNoCarrinho(carrinho), [carrinho]);

  function notificar(mensagem: string, tipo: TipoToast = 'info') {
    const id = idUnico('toast');
    setToasts((atuais) => [...atuais, { id, mensagem, tipo }]);
    window.setTimeout(() => {
      setToasts((atuais) => atuais.filter((toast) => toast.id !== id));
    }, 4200);
  }

  function fecharToast(id: string) {
    setToasts((atuais) => atuais.filter((toast) => toast.id !== id));
  }

  function entrar(email: string, senha: string) {
    const normalizado = email.trim().toLowerCase();
    const encontrado = usuarios.find((item) => item.email.toLowerCase() === normalizado);
    if (!encontrado || encontrado.senha !== senha) {
      return { ok: false, erro: 'E-mail ou senha incorretos. Confira os dados e tente novamente.' };
    }
    setSessaoId(encontrado.id);
    notificar(`Bem-vindo(a), ${encontrado.nome.split(' ')[0]}!`, 'sucesso');
    return { ok: true };
  }

  function cadastrar(dados: {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    marketing: boolean;
  }) {
    const email = dados.email.trim().toLowerCase();
    if (usuarios.some((item) => item.email.toLowerCase() === email)) {
      return { ok: false, erro: 'Este e-mail já está cadastrado.', campo: 'email' };
    }
    const agora = agoraISO();
    const novo: Usuario = {
      id: idUnico('u'),
      nome: dados.nome.trim(),
      email,
      telefone: dados.telefone.trim(),
      senha: dados.senha,
      pontos: 0,
      extrato: [],
      consentimentos: { termosEm: agora, marketing: dados.marketing },
      cupons: [],
      criadoEm: agora,
    };
    setUsuarios((atuais) => [...atuais, novo]);
    setSessaoId(novo.id);
    setConsentimento((atual) => ({
      necessario: true,
      analytics: atual?.analytics ?? false,
      marketing: dados.marketing,
      versao: RULES.versaoTermos,
      data: agora,
    }));
    notificar('Conta criada com sucesso. Bom te ver por aqui!', 'sucesso');
    return { ok: true };
  }

  function sair() {
    setSessaoId(null);
    notificar('Você saiu da sua conta.', 'info');
  }

  function atualizarPerfil(dados: { nome: string; telefone: string }) {
    if (!usuario) return;
    setUsuarios((atuais) =>
      atuais.map((item) =>
        item.id === usuario.id
          ? { ...item, nome: dados.nome.trim(), telefone: dados.telefone.trim() }
          : item,
      ),
    );
    notificar('Dados atualizados.', 'sucesso');
  }

  function atualizarMarketing(ativo: boolean) {
    const agora = agoraISO();
    if (usuario) {
      setUsuarios((atuais) =>
        atuais.map((item) =>
          item.id === usuario.id
            ? { ...item, consentimentos: { ...item.consentimentos, marketing: ativo } }
            : item,
        ),
      );
    }
    setConsentimento((atual) => ({
      necessario: true,
      analytics: atual?.analytics ?? false,
      marketing: ativo,
      versao: RULES.versaoTermos,
      data: agora,
    }));
    notificar(
      ativo
        ? 'Você autorizou o recebimento de novidades e promoções.'
        : 'Consentimento de marketing revogado.',
      'sucesso',
    );
  }

  function excluirConta() {
    if (!usuario) return;
    const email = usuario.email.toLowerCase();
    setUsuarios((atuais) => atuais.filter((item) => item.id !== usuario.id));
    setPedidos((atuais) =>
      atuais.filter(
        (pedido) =>
          pedido.clienteId !== usuario.id && pedido.clienteEmail?.toLowerCase() !== email,
      ),
    );
    setSessaoId(null);
    setCarrinho({ unidadeId, itens: [] });
    notificar('Sua conta, seus pedidos e seus pontos foram excluídos.', 'sucesso');
  }

  function registrarConsentimento(dados: Omit<Consentimento, 'versao' | 'data'>) {
    const agora = agoraISO();
    setConsentimento({ ...dados, versao: RULES.versaoTermos, data: agora });
    if (usuario) {
      setUsuarios((atuais) =>
        atuais.map((item) =>
          item.id === usuario.id
            ? { ...item, consentimentos: { ...item.consentimentos, marketing: dados.marketing } }
            : item,
        ),
      );
    }
  }

  function selecionarUnidade(id: string) {
    const vaiLimpar = carrinho.itens.length > 0 && carrinho.unidadeId !== id;
    setUnidadeId(id);
    setCarrinho({ unidadeId: id, itens: vaiLimpar ? [] : carrinho.itens });
    if (vaiLimpar) {
      notificar(
        'Unidade alterada. O carrinho foi esvaziado para não misturar cardápios.',
        'info',
      );
    }
  }

  function adicionarAoCarrinho(
    produtoId: string,
    adicionais: string[],
    quantidade: number,
    observacao: string,
  ) {
    const produto = getProduto(produtoId);
    if (!produto) return false;
    if (!unidadeId) {
      notificar('Escolha uma unidade antes de adicionar itens.', 'erro');
      return false;
    }
    const unidadeAtual = getUnidade(unidadeId);
    if (!unidadeAtual?.aberta) {
      notificar('Esta unidade está fechada. Escolha outra unidade para pedir.', 'erro');
      return false;
    }
    if (!disponivelNaUnidade(produto, unidadeId)) {
      notificar('Este item não está disponível nesta unidade.', 'erro');
      return false;
    }
    const quantidadeSegura = Math.max(1, Math.min(quantidade, RULES.maxItensPorProduto));
    const chave = chaveDoItem(produtoId, adicionais, observacao);

    setCarrinho((atual) => {
      const base: Carrinho =
        atual.unidadeId === unidadeId ? atual : { unidadeId, itens: [] };
      const existente = base.itens.find((item) => item.chave === chave);
      if (existente) {
        return {
          ...base,
          itens: base.itens.map((item) =>
            item.chave === chave
              ? {
                  ...item,
                  quantidade: Math.min(
                    item.quantidade + quantidadeSegura,
                    RULES.maxItensPorProduto,
                  ),
                }
              : item,
          ),
        };
      }
      const novoItem: ItemCarrinho = {
        chave,
        produtoId,
        adicionais,
        quantidade: quantidadeSegura,
        observacao: observacao.trim(),
      };
      return { ...base, itens: [...base.itens, novoItem] };
    });
    notificar('Item adicionado ao carrinho.', 'sucesso');
    return true;
  }

  function atualizarQuantidade(chave: string, quantidade: number) {
    const segura = Math.max(1, Math.min(quantidade, RULES.maxItensPorProduto));
    setCarrinho((atual) => ({
      ...atual,
      itens: atual.itens.map((item) =>
        item.chave === chave ? { ...item, quantidade: segura } : item,
      ),
    }));
  }

  function removerItem(chave: string) {
    setCarrinho((atual) => ({
      ...atual,
      itens: atual.itens.filter((item) => item.chave !== chave),
    }));
    notificar('Item removido do carrinho.', 'info');
  }

  function limparCarrinho() {
    setCarrinho({ unidadeId, itens: [] });
  }

  function criarPedido(
    dados: DadosPedido,
    opcoes?: { limparCarrinho?: boolean },
  ): Pedido {
    const subtotalPedido = arredondar(
      dados.itens.reduce((total, item) => total + item.precoUnitario * item.quantidade, 0),
    );
    const descontoCupom = dados.cupom ? descontoDoCupom(dados.cupom, subtotalPedido) : 0;
    const descontoPontos = descontoDePontos(dados.pontosUsados);
    const total = arredondar(Math.max(0, subtotalPedido - descontoCupom - descontoPontos));
    const agora = agoraISO();
    const pedido: Pedido = {
      id: idUnico('ped'),
      codigo: gerarCodigoPedido(pedidos.map((item) => item.codigo)),
      unidadeId: dados.unidadeId,
      clienteId: dados.clienteId,
      clienteNome: dados.clienteNome.trim(),
      clienteTelefone: dados.clienteTelefone?.trim(),
      clienteEmail: dados.clienteEmail?.trim().toLowerCase(),
      canal: dados.canal,
      itens: dados.itens,
      subtotal: subtotalPedido,
      descontoCupom,
      descontoPontos,
      total,
      cupomCodigo: dados.cupom?.codigo,
      pontosUsados: dados.pontosUsados,
      pontosGanhos: dados.clienteId ? Math.floor(total * RULES.pontosPorReal) : 0,
      pontosCreditados: false,
      status: 'AGUARDANDO_PAGAMENTO',
      pagamento: {
        metodo: dados.metodo,
        status: 'INICIANDO',
        transacaoId: idUnico('tx').toUpperCase(),
        tentativas: 0,
        atualizadoEm: agora,
      },
      criadoEm: agora,
      retiradaEm: dados.retiradaEm,
    };
    setPedidos((atuais) => [pedido, ...atuais]);
    if (opcoes?.limparCarrinho !== false) {
      setCarrinho({ unidadeId, itens: [] });
    }
    return pedido;
  }

  function aprovarPagamento(codigo: string) {
    const pedido = pedidos.find((item) => item.codigo === codigo);
    if (!pedido) return;
    const agora = agoraISO();

    setPedidos((atuais) =>
      atuais.map((item) =>
        item.codigo === codigo
          ? {
              ...item,
              status: 'RECEBIDO',
              pontosCreditados: Boolean(item.clienteId),
              pagamento: {
                ...item.pagamento,
                status: 'APROVADO',
                tentativas: item.pagamento.tentativas + 1,
                atualizadoEm: agora,
              },
            }
          : item,
      ),
    );

    if (pedido.clienteId && !pedido.pontosCreditados) {
      setUsuarios((atuais) =>
        atuais.map((item) => {
          if (item.id !== pedido.clienteId) return item;
          const saldo = Math.max(0, item.pontos - pedido.pontosUsados + pedido.pontosGanhos);
          const novosLancamentos = [];
          if (pedido.pontosGanhos > 0) {
            novosLancamentos.push({
              id: idUnico('ex'),
              tipo: 'ganho' as const,
              pontos: pedido.pontosGanhos,
              descricao: `Pedido ${pedido.codigo}`,
              data: agora,
            });
          }
          if (pedido.pontosUsados > 0) {
            novosLancamentos.push({
              id: idUnico('ex'),
              tipo: 'resgate' as const,
              pontos: pedido.pontosUsados,
              descricao: `Resgate no pedido ${pedido.codigo}`,
              data: agora,
            });
          }
          return { ...item, pontos: saldo, extrato: [...novosLancamentos, ...item.extrato] };
        }),
      );
    }

    if (pedido.cupomCodigo) {
      setCuponsUsados((atuais) =>
        atuais.includes(pedido.cupomCodigo as string)
          ? atuais
          : [...atuais, pedido.cupomCodigo as string],
      );
    }
  }

  function recusarPagamento(codigo: string) {
    const agora = agoraISO();
    setPedidos((atuais) =>
      atuais.map((item) =>
        item.codigo === codigo
          ? {
              ...item,
              status: 'PAGAMENTO_RECUSADO',
              pagamento: {
                ...item.pagamento,
                status: 'RECUSADO',
                tentativas: item.pagamento.tentativas + 1,
                atualizadoEm: agora,
              },
            }
          : item,
      ),
    );
  }

  function expirarPagamento(codigo: string) {
    const agora = agoraISO();
    setPedidos((atuais) =>
      atuais.map((item) =>
        item.codigo === codigo
          ? {
              ...item,
              pagamento: { ...item.pagamento, status: 'EXPIRADO', atualizadoEm: agora },
            }
          : item,
      ),
    );
  }

  function reiniciarPagamento(codigo: string) {
    const agora = agoraISO();
    setPedidos((atuais) =>
      atuais.map((item) =>
        item.codigo === codigo
          ? {
              ...item,
              status: 'AGUARDANDO_PAGAMENTO',
              pagamento: { ...item.pagamento, status: 'INICIANDO', atualizadoEm: agora },
            }
          : item,
      ),
    );
  }

  function avancarStatus(codigo: string) {
    const proximo: Partial<Record<StatusPedido, StatusPedido>> = {
      RECEBIDO: 'EM_PREPARO',
      EM_PREPARO: 'PRONTO',
      PRONTO: 'RETIRADO',
    };
    setPedidos((atuais) =>
      atuais.map((item) => {
        if (item.codigo !== codigo) return item;
        const destino = proximo[item.status];
        return destino ? { ...item, status: destino } : item;
      }),
    );
  }

  function cancelarPedido(codigo: string) {
    const pedido = pedidos.find((item) => item.codigo === codigo);
    if (!pedido || pedido.status === 'RETIRADO' || pedido.status === 'CANCELADO') return;
    const agora = agoraISO();
    setPedidos((atuais) =>
      atuais.map((item) =>
        item.codigo === codigo ? { ...item, status: 'CANCELADO' } : item,
      ),
    );
    if (pedido.clienteId && pedido.pontosCreditados) {
      setUsuarios((atuais) =>
        atuais.map((item) => {
          if (item.id !== pedido.clienteId) return item;
          const saldo = Math.max(0, item.pontos - pedido.pontosGanhos + pedido.pontosUsados);
          return {
            ...item,
            pontos: saldo,
            extrato: [
              {
                id: idUnico('ex'),
                tipo: 'estorno' as const,
                pontos: pedido.pontosUsados - pedido.pontosGanhos,
                descricao: `Cancelamento do pedido ${pedido.codigo}`,
                data: agora,
              },
              ...item.extrato,
            ],
          };
        }),
      );
    }
    notificar(`Pedido ${codigo} cancelado.`, 'info');
  }

  function resgatarRecompensa(id: string): Cupom | null {
    if (!usuario) {
      notificar('Entre na sua conta para resgatar recompensas.', 'erro');
      return null;
    }
    const recompensa = RECOMPENSAS.find((item) => item.id === id);
    if (!recompensa) return null;
    if (usuario.pontos < recompensa.custoPontos) {
      notificar('Pontos insuficientes para esta recompensa.', 'erro');
      return null;
    }
    const codigo = `RESG-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const cupom: Cupom = {
      codigo,
      tipo: recompensa.tipo,
      valor: recompensa.valor,
      minimo: recompensa.minimo,
      validade: adicionarDias(new Date(), RULES.validadeResgateDias),
      usoUnico: true,
      descricao: recompensa.nome,
    };
    const agora = agoraISO();
    setUsuarios((atuais) =>
      atuais.map((item) =>
        item.id === usuario.id
          ? {
              ...item,
              pontos: item.pontos - recompensa.custoPontos,
              cupons: [...item.cupons, cupom],
              extrato: [
                {
                  id: idUnico('ex'),
                  tipo: 'resgate',
                  pontos: recompensa.custoPontos,
                  descricao: `Resgate: ${recompensa.nome}`,
                  data: agora,
                },
                ...item.extrato,
              ],
            }
          : item,
      ),
    );
    notificar(`Recompensa resgatada! Cupom ${codigo} liberado.`, 'sucesso');
    return cupom;
  }

  function definirCanalSite(canal: CanalSite) {
    setCanalSite(canal);
  }

  function definirPapel(novoPapel: PapelOperacao) {
    setPapel(novoPapel);
  }

  function restaurarDemo() {
    Object.keys(window.localStorage)
      .filter((chave) => chave.startsWith('raizes:'))
      .forEach((chave) => window.localStorage.removeItem(chave));
    window.location.href = '/';
  }

  const valor: AppContextValue = {
    usuarios,
    usuario,
    sessaoId,
    consentimento,
    unidadeId,
    unidade,
    carrinho,
    pedidos,
    cuponsUsados,
    canalSite,
    papel,
    toasts,
    subtotal,
    quantidadeCarrinho,
    entrar,
    cadastrar,
    sair,
    atualizarPerfil,
    atualizarMarketing,
    excluirConta,
    registrarConsentimento,
    selecionarUnidade,
    adicionarAoCarrinho,
    atualizarQuantidade,
    removerItem,
    limparCarrinho,
    criarPedido,
    aprovarPagamento,
    recusarPagamento,
    expirarPagamento,
    reiniciarPagamento,
    avancarStatus,
    cancelarPedido,
    resgatarRecompensa,
    notificar,
    fecharToast,
    definirCanalSite,
    definirPapel,
    restaurarDemo,
  };

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const contexto = useContext(AppContext);
  if (!contexto) throw new Error('useApp deve ser usado dentro de AppProvider.');
  return contexto;
}
