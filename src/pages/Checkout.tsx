import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { RULES } from '../config/rules';
import { formatarBRL, formatarHora, somenteDigitos } from '../lib/format';
import {
  descontoDePontos,
  descontoDoCupom,
  limiteDePontos,
  precoUnitario,
  validarCupom,
} from '../lib/pricing';
import { CUPONS, getProduto } from '../mocks';
import type { AdicionalDoPedido, Cupom, MetodoPagamento } from '../types';

function gerarHorarios() {
  const base = new Date(Date.now() + RULES.antecedenciaMinimaMin * 60000);
  base.setSeconds(0, 0);
  const resto = base.getMinutes() % RULES.slotMinutos;
  if (resto !== 0) base.setMinutes(base.getMinutes() + (RULES.slotMinutos - resto));
  return Array.from({ length: 10 }, (_, indice) => {
    const horario = new Date(base.getTime() + indice * RULES.slotMinutos * 60000);
    return { valor: horario.toISOString(), rotulo: formatarHora(horario.toISOString()) };
  });
}

export function Checkout() {
  const {
    carrinho,
    unidade,
    subtotal,
    usuario,
    cuponsUsados,
    toasts,
    criarPedido,
    notificar,
    fecharToast,
    canalSite,
  } = useApp();
  const navigate = useNavigate();

  const [horarios] = useState(gerarHorarios);
  const [horario, setHorario] = useState(horarios[0]?.valor ?? '');
  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [telefone, setTelefone] = useState(usuario?.telefone ?? '');
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [metodo, setMetodo] = useState<MetodoPagamento>('pix');
  const [cupomCodigo, setCupomCodigo] = useState('');
  const [cupom, setCupom] = useState<Cupom | null>(null);
  const [cupomErro, setCupomErro] = useState('');
  const [pontos, setPontos] = useState(0);
  const [erros, setErros] = useState<Record<string, string>>({});

  const totalPontosMax = usuario ? limiteDePontos(subtotal, usuario.pontos) : 0;
  const descontoCupom = cupom ? descontoDoCupom(cupom, subtotal) : 0;
  const descontoPontos = descontoDePontos(pontos);
  const total = Math.max(0, subtotal - descontoCupom - descontoPontos);
  const quantidade = carrinho.itens.reduce((soma, item) => soma + item.quantidade, 0);

  if (carrinho.itens.length === 0) {
    return (
      <div className="container page">
        <EmptyState
          icone="cart"
          titulo="Nada para finalizar"
          descricao="Seu carrinho está vazio. Escolha uma unidade e monte um pedido."
        >
          <Link to="/cardapio" className="btn btn-primary">
            Ver cardápio
          </Link>
        </EmptyState>
      </div>
    );
  }

  function tentarCupom(codigo: string) {
    const disponiveis = [...CUPONS, ...(usuario?.cupons ?? [])];
    const resultado = validarCupom(codigo, subtotal, cuponsUsados, disponiveis);
    if (!resultado.ok) {
      setCupom(null);
      setCupomErro(resultado.erro ?? 'Não foi possível aplicar este cupom.');
      return;
    }
    setCupom(resultado.cupom ?? null);
    setCupomErro('');
    notificar(`Cupom ${resultado.cupom?.codigo} aplicado.`, 'sucesso');
  }

  function removerCupom() {
    setCupom(null);
    setCupomCodigo('');
    setCupomErro('');
  }

  function finalizarPedido(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const novosErros: Record<string, string> = {};

    if (!unidade) {
      novosErros.unidade = 'Escolha uma unidade antes de finalizar.';
    } else if (!unidade.aberta) {
      novosErros.unidade = 'A unidade selecionada está fechada.';
    }
    if (nome.trim().length < 2) novosErros.nome = 'Informe seu nome completo.';
    const digitosTelefone = somenteDigitos(telefone);
    if (digitosTelefone.length < 10 || digitosTelefone.length > 11) {
      novosErros.telefone = 'Informe um telefone com DDD (10 ou 11 dígitos).';
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      novosErros.email = 'Informe um e-mail válido para o comprovante.';
    }
    if (!horario) novosErros.horario = 'Escolha um horário de retirada.';
    if (pontos > totalPontosMax) {
      novosErros.pontos = 'A quantidade de pontos ultrapassa o limite deste pedido.';
    }

    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) {
      toasts.forEach((toast) => fecharToast(toast.id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const itens = carrinho.itens.flatMap((item) => {
      const produto = getProduto(item.produtoId);
      if (!produto) return [];
      const adicionais: AdicionalDoPedido[] = item.adicionais.flatMap((id) => {
        const adicional = produto.adicionais.find((candidato) => candidato.id === id);
        return adicional
          ? [{ id: adicional.id, nome: adicional.nome, preco: adicional.preco }]
          : [];
      });
      return [
        {
          produtoId: produto.id,
          nome: produto.nome,
          quantidade: item.quantidade,
          adicionais,
          observacao: item.observacao,
          precoUnitario: precoUnitario(produto, item.adicionais),
        },
      ];
    });

    const pedido = criarPedido({
      unidadeId: unidade!.id,
      canal: canalSite,
      clienteId: usuario?.id,
      clienteNome: nome,
      clienteTelefone: telefone,
      clienteEmail: email,
      itens,
      cupom: cupom ?? undefined,
      pontosUsados: pontos,
      metodo,
      retiradaEm: horario,
    });

    navigate(`/pagamento/${pedido.codigo}`);
  }

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Checkout</span>
          <h1>Quase pronto</h1>
          <p>
            Confirme seus dados e escolha o horário. O pagamento é uma simulação local, sem
            cobrança real.
          </p>
        </div>
        <Link to="/carrinho" className="btn btn-ghost btn-small">
          <Icon nome="arrow-left" tamanho={16} /> Voltar ao carrinho
        </Link>
      </div>

      {Object.keys(erros).length > 0 && (
        <div className="alert alert-error" role="alert">
          <Icon nome="x" tamanho={18} />
          <div>
            <strong>Não foi possível continuar</strong>
            <ul className="alert-list">
              {Object.entries(erros).map(([campo, mensagem]) => (
                <li key={campo}>{mensagem}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form className="checkout-layout" onSubmit={finalizarPedido} noValidate>
        <div className="checkout-main">
          <section className="panel" aria-labelledby="dados-title">
            <h2 id="dados-title">Seus dados</h2>
            <p className="panel-sub">
              Usamos apenas nome, telefone e e-mail para preparar e liberar a retirada.
            </p>
            <div className="field">
              <label htmlFor="checkout-nome">Nome completo *</label>
              <input
                id="checkout-nome"
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
                aria-invalid={Boolean(erros.nome)}
                autoComplete="name"
              />
              {erros.nome && <span className="field-error">{erros.nome}</span>}
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="checkout-telefone">Telefone com DDD *</label>
                <input
                  id="checkout-telefone"
                  value={telefone}
                  onChange={(evento) => setTelefone(evento.target.value)}
                  aria-invalid={Boolean(erros.telefone)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(81) 99999-0000"
                />
                {erros.telefone && <span className="field-error">{erros.telefone}</span>}
              </div>
              <div className="field">
                <label htmlFor="checkout-email">E-mail *</label>
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(evento) => setEmail(evento.target.value)}
                  aria-invalid={Boolean(erros.email)}
                  autoComplete="email"
                  placeholder="voce@email.com"
                />
                {erros.email && <span className="field-error">{erros.email}</span>}
              </div>
            </div>
          </section>

          <section className="panel" aria-labelledby="retirada-title">
            <h2 id="retirada-title">Retirada</h2>
            <div className="pickup-unit">
              <div>
                <strong>{unidade?.nome ?? 'Nenhuma unidade selecionada'}</strong>
                <span>{unidade?.endereco}</span>
                <small>{unidade?.horario}</small>
              </div>
              <Link to="/unidades" className="btn btn-ghost btn-small">
                Trocar unidade
              </Link>
            </div>
            {erros.unidade && <span className="field-error">{erros.unidade}</span>}
            <div className="field">
              <label htmlFor="checkout-horario">Horário de retirada *</label>
              <select
                id="checkout-horario"
                value={horario}
                onChange={(evento) => setHorario(evento.target.value)}
                aria-invalid={Boolean(erros.horario)}
              >
                {horarios.map((opcao) => (
                  <option key={opcao.valor} value={opcao.valor}>
                    Hoje, às {opcao.rotulo}
                  </option>
                ))}
              </select>
              {erros.horario && <span className="field-error">{erros.horario}</span>}
              <small className="field-hint">
                Intervalos de {RULES.slotMinutos} minutos, com antecedência mínima de{' '}
                {RULES.antecedenciaMinimaMin} minutos.
              </small>
            </div>
          </section>

          <section className="panel" aria-labelledby="pagamento-title">
            <h2 id="pagamento-title">Pagamento</h2>
            <p className="panel-sub">
              O pagamento é uma simulação local. Não há cobrança real nem comunicação com um
              serviço externo.
            </p>
            <div className="payment-methods" role="radiogroup" aria-label="Forma de pagamento">
              <label className={`payment-method ${metodo === 'pix' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="metodo-pagamento"
                  value="pix"
                  checked={metodo === 'pix'}
                  onChange={() => setMetodo('pix')}
                />
                <span>
                  <strong>Pix</strong>
                  <small>Aprovação rápida no ambiente de teste.</small>
                </span>
              </label>
              <label className={`payment-method ${metodo === 'cartao' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="metodo-pagamento"
                  value="cartao"
                  checked={metodo === 'cartao'}
                  onChange={() => setMetodo('cartao')}
                />
                <span>
                  <strong>Cartão de crédito</strong>
                  <small>Dados fictícios. Nada é armazenado.</small>
                </span>
              </label>
            </div>
          </section>

          <section className="panel" aria-labelledby="descontos-title">
            <h2 id="descontos-title">Cupom e pontos</h2>
            <div className="field">
              <label htmlFor="checkout-cupom">Cupom de desconto</label>
              <div className="inline-field">
                <input
                  id="checkout-cupom"
                  value={cupomCodigo}
                  onChange={(evento) => setCupomCodigo(evento.target.value.toUpperCase())}
                  placeholder="Ex.: RAIZES10"
                  disabled={Boolean(cupom)}
                />
                {cupom ? (
                  <button type="button" className="btn btn-secondary" onClick={removerCupom}>
                    Remover
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => tentarCupom(cupomCodigo)}
                  >
                    Aplicar
                  </button>
                )}
              </div>
              {cupomErro && (
                <span className="field-error" role="alert">
                  {cupomErro}
                </span>
              )}
              {cupom && (
                <p className="coupon-applied">
                  <Icon nome="check" tamanho={16} /> {cupom.codigo} aplicado ·{' '}
                  {formatarBRL(descontoCupom)} de desconto
                </p>
              )}
            </div>

            {usuario && usuario.cupons.length > 0 && (
              <div className="coupon-chips">
                <span className="coupon-chips-label">Seus cupons de resgate:</span>
                {usuario.cupons
                  .filter((item) => !cuponsUsados.includes(item.codigo))
                  .map((item) => (
                    <button
                      key={item.codigo}
                      type="button"
                      className="coupon-chip"
                      onClick={() => {
                        setCupomCodigo(item.codigo);
                        tentarCupom(item.codigo);
                      }}
                    >
                      <Icon nome="ticket" tamanho={14} /> {item.codigo}
                    </button>
                  ))}
              </div>
            )}

            {usuario ? (
              <div className="points-box">
                <div>
                  <strong>Clube Raízes</strong>
                  <p>
                    Saldo: {usuario.pontos} pontos · máximo neste pedido: {totalPontosMax} pontos.
                  </p>
                </div>
                <div className="points-controls">
                  <label className="sr-only" htmlFor="checkout-pontos">
                    Pontos a usar
                  </label>
                  <input
                    id="checkout-pontos"
                    type="number"
                    min={0}
                    max={totalPontosMax}
                    value={pontos}
                    onChange={(evento) => {
                      const valor = Number(evento.target.value);
                      setPontos(
                        Number.isFinite(valor)
                          ? Math.max(0, Math.floor(Math.min(valor, totalPontosMax)))
                          : 0,
                      );
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={() => setPontos(totalPontosMax)}
                  >
                    Usar máximo
                  </button>
                </div>
                {pontos > 0 && (
                  <small className="points-discount">
                    Desconto de {formatarBRL(descontoPontos)} com {pontos} pontos.
                  </small>
                )}
                {erros.pontos && <span className="field-error">{erros.pontos}</span>}
              </div>
            ) : (
              <div className="points-box points-box-guest">
                <div>
                  <strong>Quer usar pontos?</strong>
                  <p>Entre na sua conta para resgatar descontos neste pedido.</p>
                </div>
                <Link to="/entrar" className="btn btn-secondary btn-small">
                  Entrar
                </Link>
              </div>
            )}
          </section>

          <section className="panel" aria-labelledby="lgpd-title">
            <h2 id="lgpd-title">Privacidade</h2>
            <p>
              Os dados do pedido ficam neste navegador. O pagamento é simulado e nenhuma
              informação é enviada a um gateway ou serviço de pagamento externo. Consulte a{' '}
              <a href="/privacidade" target="_blank" rel="noreferrer">
                Política de Privacidade
              </a>
              .
            </p>
            <p className="panel-footnote">
              Você pode exportar ou excluir seus dados a qualquer momento em “Perfil &gt; Meus
              dados”.
            </p>
          </section>
        </div>

        <aside className="checkout-summary" aria-label="Resumo do pedido">
          <h2>Seu pedido</h2>
          <p className="checkout-summary-unit">
            <Icon nome="store" tamanho={16} /> {unidade?.nome ?? 'Unidade não selecionada'}
          </p>
          <ul className="checkout-items">
            {carrinho.itens.map((item) => {
              const produto = getProduto(item.produtoId);
              if (!produto) return null;
              return (
                <li key={item.chave}>
                  <span className="checkout-item-qty">{item.quantidade}x</span>
                  <span className="checkout-item-name">{produto.nome}</span>
                  <strong>
                    {formatarBRL(precoUnitario(produto, item.adicionais) * item.quantidade)}
                  </strong>
                </li>
              );
            })}
          </ul>
          <dl className="summary-list">
            <div>
              <dt>Subtotal ({quantidade} itens)</dt>
              <dd>{formatarBRL(subtotal)}</dd>
            </div>
            {descontoCupom > 0 && (
              <div>
                <dt>Cupom {cupom?.codigo}</dt>
                <dd>- {formatarBRL(descontoCupom)}</dd>
              </div>
            )}
            {descontoPontos > 0 && (
              <div>
                <dt>Pontos ({pontos})</dt>
                <dd>- {formatarBRL(descontoPontos)}</dd>
              </div>
            )}
            <div className="summary-total">
              <dt>Total</dt>
              <dd>{formatarBRL(total)}</dd>
            </div>
          </dl>
          <button type="submit" className="btn btn-primary btn-block">
            Ir para o pagamento <Icon nome="arrow-right" tamanho={18} />
          </button>
          <p className="summary-lgpd">
            <Icon nome="lock" tamanho={14} /> Ambiente de teste. Nenhum pagamento real.
          </p>
        </aside>
      </form>
    </div>
  );
}
