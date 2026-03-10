import type { Aviso } from '@/types';

const PESOS_AVISO: Record<string, number> = {
  URGENTE: 1,
  FERIADO: 2,
  INFORMATIVO: 3,
};

function normalizar(valor: string): string {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isAvisoNovoHorario(aviso: Aviso): boolean {
  const texto = normalizar(`${aviso.titulo} ${aviso.conteudo}`);
  return texto.includes('novo horario') || texto.includes('novos horarios') || texto.includes('tabelas de horarios');
}

function isInformativoCartoes(aviso: Aviso): boolean {
  const texto = normalizar(`${aviso.titulo} ${aviso.conteudo}`);
  return (
    texto.includes('cartao') ||
    texto.includes('declaracao escolar') ||
    texto.includes('declaracoes escolares') ||
    texto.includes('idoso') ||
    texto.includes('vale-transporte') ||
    texto.includes('vale transporte') ||
    texto.includes('tdmax')
  );
}

export function ordenarAvisosAtivos(avisos: Aviso[]): Aviso[] {
  return avisos
    .filter((a) => a.ativo)
    .sort((a, b) => (PESOS_AVISO[a.tipo] || 99) - (PESOS_AVISO[b.tipo] || 99));
}

export function classificarAvisosPublicos(avisos: Aviso[]) {
  const base = ordenarAvisosAtivos(avisos).filter((a) => !isAvisoNovoHorario(a));

  const informativosCartoes = base.filter(isInformativoCartoes).map((a) => ({
    ...a,
    tipo: 'INFORMATIVO' as const,
  }));

  const notificacoes = base.filter(
    (a) => !isInformativoCartoes(a) && (a.tipo === 'URGENTE' || a.tipo === 'FERIADO')
  );

  return { notificacoes, informativosCartoes };
}
