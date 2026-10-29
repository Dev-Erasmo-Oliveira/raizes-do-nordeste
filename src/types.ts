export type Canal = 'web' | 'app' | 'totem';
export type CanalSite = 'web' | 'app';
export type PapelOperacao = 'atendente' | 'cozinha' | 'gerente';
export type MetodoPagamento = 'pix' | 'cartao';
export type StatusPagamento =
  | 'INICIANDO'
  | 'PROCESSANDO'
  | 'APROVADO'
  | 'RECUSADO'
  | 'EXPIRADO'
  | 'CANCELADO';

export type StatusPedido =
  | 'AGUARDANDO_PAGAMENTO'
  | 'RECEBIDO'
  | 'EM_PREPARO'
  | 'PRONTO'
  | 'RETIRADO'
  | 'CANCELADO'
  | 'PAGAMENTO_RECUSADO';

export type TipoCupom = 'fixo' | 'percentual';
export type TipoToast = 'sucesso' | 'erro' | 'info';

export interface Unidade {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  horario: string;
  aberta: boolean;
}

export interface Categoria {
  id: string;
  nome: string;
  ordem: number;
}

export interface Adicional {
  id: string;
  nome: string;
  preco: number;
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  precoAntigo?: number;
  categoriaId: string;
  tags: string[];
  adicionais: Adicional[];
  addonMin: number;
  addonMax: number;
  disponivelPorUnidade: Record<string, boolean>;
  destaque?: boolean;
  selo?: string;
}

export interface ItemCarrinho {
  chave: string;
  produtoId: string;
  adicionais: string[];
  quantidade: number;
  observacao: string;
}

export interface Carrinho {
  unidadeId: string | null;
  itens: ItemCarrinho[];
}

export interface AdicionalDoPedido {
  id: string;
  nome: string;
  preco: number;
}

export interface ItemPedido {
  produtoId: string;
  nome: string;
  quantidade: number;
  adicionais: AdicionalDoPedido[];
  observacao: string;
  precoUnitario: number;
}

export interface Pagamento {
  metodo: MetodoPagamento;
  status: StatusPagamento;
  transacaoId: string;
  tentativas: number;
  atualizadoEm: string;
}

export interface Consentimento {
  necessario: boolean;
  analytics: boolean;
  marketing: boolean;
  versao: string;
  data: string;
}

export interface ConsentimentoPedido {
  aceitoEm: string;
  versao: string;
}

export interface Cupom {
  codigo: string;
  tipo: TipoCupom;
  valor: number;
  minimo: number;
  validade: string;
  usoUnico: boolean;
  descricao?: string;
}

export interface Recompensa {
  id: string;
  nome: string;
  descricao: string;
  custoPontos: number;
  tipo: TipoCupom;
  valor: number;
  minimo: number;
}

export interface Pedido {
  id: string;
  codigo: string;
  unidadeId: string;
  clienteId?: string;
  clienteNome: string;
  clienteTelefone?: string;
  clienteEmail?: string;
  canal: Canal;
  itens: ItemPedido[];
  subtotal: number;
  descontoCupom: number;
  descontoPontos: number;
  total: number;
  cupomCodigo?: string;
  pontosUsados: number;
  pontosGanhos: number;
  pontosCreditados: boolean;
  status: StatusPedido;
  pagamento: Pagamento;
  criadoEm: string;
  retiradaEm: string;
  consentimento?: ConsentimentoPedido;
}

export interface ExtratoPonto {
  id: string;
  tipo: 'ganho' | 'resgate' | 'estorno';
  pontos: number;
  descricao: string;
  data: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  pontos: number;
  extrato: ExtratoPonto[];
  consentimentos: {
    termosEm: string;
    marketing: boolean;
  };
  cupons: Cupom[];
  criadoEm: string;
}

export interface Toast {
  id: string;
  mensagem: string;
  tipo: TipoToast;
}
