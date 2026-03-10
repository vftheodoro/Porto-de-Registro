import type { Database, Linha, TipoDia } from '@/types';

const MIN_TRANSFER_MIN = 5;

type LinhaResumo = Pick<Linha, 'id' | 'codigo' | 'nome' | 'slug' | 'descricao' | 'ativa'>;

export interface TrechoPlanejado {
  linha: LinhaResumo;
  origem: string;
  destino: string;
  saida: string;
  chegada: string;
  duracao_min: number;
  tarifa: number | null;
  saida_min: number;
  chegada_min: number;
}

export interface RotaComConexao {
  id: string;
  conexao_em: string;
  saida_total: string;
  chegada_total: string;
  duracao_total_min: number;
  tempo_espera_min: number;
  tarifa_total: number | null;
  trechos: [TrechoPlanejado, TrechoPlanejado];
}

interface StopInfo {
  parada_id: number;
  cidade: string;
  ordem: number;
  tempo_minutos: number;
}

interface LinhaContext {
  linha: Linha;
  stops: StopInfo[];
  horariosDia: string[];
}

function toMin(hhmm: string): number {
  const [hh, mm] = hhmm.split(':').map(Number);
  return hh * 60 + mm;
}

function toHHMM(totalMin: number): string {
  const dayMin = ((totalMin % 1440) + 1440) % 1440;
  const hh = Math.floor(dayMin / 60);
  const mm = dayMin % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function buildLinhaContexts(db: Database, tipo: TipoDia): LinhaContext[] {
  return db.linhas
    .filter((linha) => linha.ativa)
    .map((linha) => {
      const stops = linha.paradas
        .map((lp) => {
          const base = db.paradas.find((p) => p.id === lp.parada_id);
          return {
            parada_id: lp.parada_id,
            ordem: lp.ordem,
            tempo_minutos: lp.tempo_minutos,
            cidade: base?.cidade || '',
          };
        })
        .filter((s) => !!s.cidade)
        .sort((a, b) => a.ordem - b.ordem);

      const horariosDia = linha.horarios
        .filter((h) => h.tipo === tipo)
        .map((h) => h.hora_saida)
        .sort((a, b) => a.localeCompare(b));

      return { linha, stops, horariosDia };
    })
    .filter((ctx) => ctx.stops.length >= 2 && ctx.horariosDia.length > 0);
}

function getFirstStopByCity(stops: StopInfo[], city: string): StopInfo | undefined {
  return stops.find((s) => s.cidade === city);
}

function getFare(linha: Linha, origemStopId: number, destinoStopId: number): number | null {
  const tarifa = linha.tarifas.find(
    (t) => t.origem_id === origemStopId && t.destino_id === destinoStopId
  );
  return tarifa ? tarifa.valor : null;
}

function createLeg(
  ctx: LinhaContext,
  origemStop: StopInfo,
  destinoStop: StopInfo,
  partidaLinha: string
): TrechoPlanejado {
  const baseStartMin = toMin(partidaLinha);
  const saidaMin = baseStartMin + origemStop.tempo_minutos;
  const chegadaMin = baseStartMin + destinoStop.tempo_minutos;

  return {
    linha: {
      id: ctx.linha.id,
      codigo: ctx.linha.codigo,
      nome: ctx.linha.nome,
      slug: ctx.linha.slug,
      descricao: ctx.linha.descricao,
      ativa: ctx.linha.ativa,
    },
    origem: origemStop.cidade,
    destino: destinoStop.cidade,
    saida: toHHMM(saidaMin),
    chegada: toHHMM(chegadaMin),
    saida_min: saidaMin,
    chegada_min: chegadaMin,
    duracao_min: destinoStop.tempo_minutos - origemStop.tempo_minutos,
    tarifa: getFare(ctx.linha, origemStop.parada_id, destinoStop.parada_id),
  };
}

function getLegsBetween(
  contexts: LinhaContext[],
  origemCidade: string,
  destinoCidade: string
): TrechoPlanejado[] {
  const legs: TrechoPlanejado[] = [];

  for (const ctx of contexts) {
    const origemStop = getFirstStopByCity(ctx.stops, origemCidade);
    const destinoStop = getFirstStopByCity(ctx.stops, destinoCidade);

    if (!origemStop || !destinoStop || origemStop.ordem >= destinoStop.ordem) {
      continue;
    }

    for (const partidaLinha of ctx.horariosDia) {
      legs.push(createLeg(ctx, origemStop, destinoStop, partidaLinha));
    }
  }

  return legs.sort((a, b) => a.saida_min - b.saida_min);
}

function getReachableCitiesFrom(
  contexts: LinhaContext[],
  origemCidade: string
): string[] {
  const reachable = new Set<string>();

  for (const ctx of contexts) {
    const origemStop = getFirstStopByCity(ctx.stops, origemCidade);
    if (!origemStop) continue;

    for (const stop of ctx.stops) {
      if (stop.ordem > origemStop.ordem && stop.cidade !== origemCidade) {
        reachable.add(stop.cidade);
      }
    }
  }

  return Array.from(reachable);
}

function hasTimedConnection(
  contexts: LinhaContext[],
  origemCidade: string,
  destinoCidade: string
): boolean {
  const firstHopCities = getReachableCitiesFrom(contexts, origemCidade).filter(
    (cidade) => cidade !== destinoCidade
  );

  for (const conexaoCidade of firstHopCities) {
    const trecho1 = getLegsBetween(contexts, origemCidade, conexaoCidade);
    const trecho2 = getLegsBetween(contexts, conexaoCidade, destinoCidade);

    if (trecho1.length === 0 || trecho2.length === 0) continue;

    for (const t1 of trecho1) {
      const segundoValido = trecho2.find(
        (t2) => t2.saida_min >= t1.chegada_min + MIN_TRANSFER_MIN
      );
      if (segundoValido) {
        return true;
      }
    }
  }

  return false;
}

export function planejarConexoes(
  db: Database,
  origemCidade: string,
  destinoCidade: string,
  tipo: TipoDia,
  limit = 10
): RotaComConexao[] {
  const contexts = buildLinhaContexts(db, tipo);
  const rotas: RotaComConexao[] = [];
  const firstHopCities = getReachableCitiesFrom(contexts, origemCidade).filter(
    (cidade) => cidade !== destinoCidade
  );

  for (const conexaoCidade of firstHopCities) {
    const primeiroTrecho = getLegsBetween(contexts, origemCidade, conexaoCidade);
    const segundoTrecho = getLegsBetween(contexts, conexaoCidade, destinoCidade);

    if (primeiroTrecho.length === 0 || segundoTrecho.length === 0) continue;

    for (const t1 of primeiroTrecho) {
      for (const t2 of segundoTrecho) {
        if (t2.saida_min < t1.chegada_min + MIN_TRANSFER_MIN) continue;

        const tarifaTotal =
          t1.tarifa == null || t2.tarifa == null ? null : t1.tarifa + t2.tarifa;

        rotas.push({
          id: `${t1.linha.id}-${t1.saida}-${conexaoCidade}-${t2.linha.id}-${t2.saida}`,
          conexao_em: conexaoCidade,
          saida_total: t1.saida,
          chegada_total: t2.chegada,
          duracao_total_min: t2.chegada_min - t1.saida_min,
          tempo_espera_min: t2.saida_min - t1.chegada_min,
          tarifa_total: tarifaTotal,
          trechos: [t1, t2],
        });
      }
    }
  }

  const seen = new Set<string>();
  return rotas
    .sort((a, b) => {
      if (a.duracao_total_min !== b.duracao_total_min) {
        return a.duracao_total_min - b.duracao_total_min;
      }
      if (a.tempo_espera_min !== b.tempo_espera_min) {
        return a.tempo_espera_min - b.tempo_espera_min;
      }
      const tarifaA = a.tarifa_total ?? Number.POSITIVE_INFINITY;
      const tarifaB = b.tarifa_total ?? Number.POSITIVE_INFINITY;
      if (tarifaA !== tarifaB) {
        return tarifaA - tarifaB;
      }
      return a.saida_total.localeCompare(b.saida_total);
    })
    .filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    })
    .slice(0, limit);
}

export function listarDestinosAlcancaveis(
  db: Database,
  origemCidade: string,
  tipo: TipoDia
): string[] {
  const contexts = buildLinhaContexts(db, tipo);
  const cidadesNoDia = new Set<string>();

  for (const ctx of contexts) {
    for (const stop of ctx.stops) {
      if (stop.cidade !== origemCidade) {
        cidadesNoDia.add(stop.cidade);
      }
    }
  }

  const destinos: string[] = [];
  for (const cidade of Array.from(cidadesNoDia)) {
    const temDireto = getLegsBetween(contexts, origemCidade, cidade).length > 0;
    const temConexao = temDireto
      ? false
      : hasTimedConnection(contexts, origemCidade, cidade);

    if (temDireto || temConexao) {
      destinos.push(cidade);
    }
  }

  return destinos.sort((a, b) => a.localeCompare(b));
}
