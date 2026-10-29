const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dataHora = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const dataCurta = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const hora = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
});

export function formatarBRL(valor: number): string {
  return moeda.format(Number.isFinite(valor) ? valor : 0);
}

export function formatarDataHora(iso: string): string {
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? '—' : dataHora.format(data);
}

export function formatarData(iso: string): string {
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? '—' : dataCurta.format(data);
}

export function formatarHora(iso: string): string {
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? '—' : hora.format(data);
}

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

export function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function mascararEmail(email: string): string {
  const [usuario, dominio] = email.split('@');
  if (!usuario || !dominio) return email;
  const visivel = usuario.slice(0, 2);
  return `${visivel}${'*'.repeat(Math.max(usuario.length - 2, 2))}@${dominio}`;
}

export function mascararTelefone(telefone: string): string {
  const digitos = somenteDigitos(telefone);
  if (digitos.length < 6) return telefone;
  return `(${digitos.slice(0, 2)}) *****-${digitos.slice(-4)}`;
}

export function adicionarDias(data: Date, dias: number): string {
  const nova = new Date(data);
  nova.setDate(nova.getDate() + dias);
  return nova.toISOString().slice(0, 10);
}
