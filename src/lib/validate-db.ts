import type { Database, TipoAviso, TipoDia } from '@/types';

const TIPOS_DIA = new Set<TipoDia>(['UTIL', 'SABADO', 'DOMINGO', 'FERIADO']);
const TIPOS_AVISO = new Set<TipoAviso>(['URGENTE', 'INFORMATIVO', 'FERIADO']);
const HORA_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function asString(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}

function asFiniteNumber(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

export function validateDatabasePayload(payload: unknown): { ok: true; db: Database } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!isObj(payload)) {
    return { ok: false, errors: ['Payload precisa ser um objeto JSON.'] };
  }

  const paradasRaw = payload.paradas;
  const linhasRaw = payload.linhas;
  const avisosRaw = payload.avisos;

  if (!Array.isArray(paradasRaw)) errors.push('Campo paradas deve ser array.');
  if (!Array.isArray(linhasRaw)) errors.push('Campo linhas deve ser array.');
  if (!Array.isArray(avisosRaw)) errors.push('Campo avisos deve ser array.');
  if (errors.length > 0) return { ok: false, errors };

  const paradas = paradasRaw as unknown[];
  const linhas = linhasRaw as unknown[];
  const avisos = avisosRaw as unknown[];

  const paradaIds = new Set<number>();
  for (const [i, p] of paradas.entries()) {
    if (!isObj(p)) {
      errors.push(`paradas[${i}] invalida.`);
      continue;
    }
    const id = asFiniteNumber(p.id);
    const nome = asString(p.nome);
    const cidade = asString(p.cidade);
    if (id == null || !Number.isInteger(id) || id <= 0) errors.push(`paradas[${i}].id invalido.`);
    if (!nome || nome.trim().length < 2) errors.push(`paradas[${i}].nome invalido.`);
    if (!cidade || cidade.trim().length < 2) errors.push(`paradas[${i}].cidade invalida.`);
    if (id != null) {
      if (paradaIds.has(id)) errors.push(`ID de parada duplicado: ${id}.`);
      paradaIds.add(id);
    }
  }

  const lineCodes = new Set<string>();
  const lineSlugs = new Set<string>();

  for (const [i, l] of linhas.entries()) {
    if (!isObj(l)) {
      errors.push(`linhas[${i}] invalida.`);
      continue;
    }
    const id = asFiniteNumber(l.id);
    const codigo = asString(l.codigo);
    const nome = asString(l.nome);
    const slug = asString(l.slug);
    const ativa = typeof l.ativa === 'boolean' ? l.ativa : null;
    const lParadas = l.paradas;
    const lHorarios = l.horarios;
    const lTarifas = l.tarifas;

    if (id == null || !Number.isInteger(id) || id <= 0) errors.push(`linhas[${i}].id invalido.`);
    if (!codigo || codigo.trim().length < 2) errors.push(`linhas[${i}].codigo invalido.`);
    if (!nome || nome.trim().length < 3) errors.push(`linhas[${i}].nome invalido.`);
    if (!slug || slug.trim().length < 3) errors.push(`linhas[${i}].slug invalido.`);
    if (ativa == null) errors.push(`linhas[${i}].ativa deve ser boolean.`);

    if (codigo) {
      if (lineCodes.has(codigo)) errors.push(`Codigo de linha duplicado: ${codigo}.`);
      lineCodes.add(codigo);
    }
    if (slug) {
      if (lineSlugs.has(slug)) errors.push(`Slug de linha duplicado: ${slug}.`);
      lineSlugs.add(slug);
    }

    if (!Array.isArray(lParadas) || lParadas.length < 2) {
      errors.push(`linhas[${i}].paradas deve ter no minimo 2 itens.`);
    } else {
      for (const [j, lp] of lParadas.entries()) {
        if (!isObj(lp)) {
          errors.push(`linhas[${i}].paradas[${j}] invalida.`);
          continue;
        }
        const paradaId = asFiniteNumber(lp.parada_id);
        const ordem = asFiniteNumber(lp.ordem);
        const tempo = asFiniteNumber(lp.tempo_minutos);
        if (paradaId == null || !Number.isInteger(paradaId) || !paradaIds.has(paradaId)) {
          errors.push(`linhas[${i}].paradas[${j}].parada_id invalido.`);
        }
        if (ordem == null || !Number.isInteger(ordem) || ordem <= 0) {
          errors.push(`linhas[${i}].paradas[${j}].ordem invalida.`);
        }
        if (tempo == null || tempo < 0) {
          errors.push(`linhas[${i}].paradas[${j}].tempo_minutos invalido.`);
        }
      }
    }

    if (!Array.isArray(lHorarios) || lHorarios.length === 0) {
      errors.push(`linhas[${i}].horarios deve ter no minimo 1 item.`);
    } else {
      for (const [j, h] of lHorarios.entries()) {
        if (!isObj(h)) {
          errors.push(`linhas[${i}].horarios[${j}] invalido.`);
          continue;
        }
        const hid = asFiniteNumber(h.id);
        const hora = asString(h.hora_saida);
        const tipo = asString(h.tipo);
        if (hid == null || !Number.isInteger(hid) || hid <= 0) errors.push(`linhas[${i}].horarios[${j}].id invalido.`);
        if (!hora || !HORA_RE.test(hora)) errors.push(`linhas[${i}].horarios[${j}].hora_saida invalida.`);
        if (!tipo || !TIPOS_DIA.has(tipo as TipoDia)) errors.push(`linhas[${i}].horarios[${j}].tipo invalido.`);
      }
    }

    if (!Array.isArray(lTarifas)) {
      errors.push(`linhas[${i}].tarifas deve ser array.`);
    } else {
      for (const [j, t] of lTarifas.entries()) {
        if (!isObj(t)) {
          errors.push(`linhas[${i}].tarifas[${j}] invalida.`);
          continue;
        }
        const origem = asFiniteNumber(t.origem_id);
        const destino = asFiniteNumber(t.destino_id);
        const valor = asFiniteNumber(t.valor);
        if (origem == null || !Number.isInteger(origem) || !paradaIds.has(origem)) errors.push(`linhas[${i}].tarifas[${j}].origem_id invalido.`);
        if (destino == null || !Number.isInteger(destino) || !paradaIds.has(destino)) errors.push(`linhas[${i}].tarifas[${j}].destino_id invalido.`);
        if (valor == null || valor < 0) errors.push(`linhas[${i}].tarifas[${j}].valor invalido.`);
      }
    }
  }

  for (const [i, a] of avisos.entries()) {
    if (!isObj(a)) {
      errors.push(`avisos[${i}] invalido.`);
      continue;
    }
    const id = asFiniteNumber(a.id);
    const titulo = asString(a.titulo);
    const conteudo = asString(a.conteudo);
    const tipo = asString(a.tipo);
    const ativo = typeof a.ativo === 'boolean' ? a.ativo : null;

    if (id == null || !Number.isInteger(id) || id <= 0) errors.push(`avisos[${i}].id invalido.`);
    if (!titulo || titulo.trim().length < 3) errors.push(`avisos[${i}].titulo invalido.`);
    if (!conteudo || conteudo.trim().length < 3) errors.push(`avisos[${i}].conteudo invalido.`);
    if (!tipo || !TIPOS_AVISO.has(tipo as TipoAviso)) errors.push(`avisos[${i}].tipo invalido.`);
    if (ativo == null) errors.push(`avisos[${i}].ativo deve ser boolean.`);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, db: payload as unknown as Database };
}
