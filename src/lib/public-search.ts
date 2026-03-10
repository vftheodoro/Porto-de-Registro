import type {
  Database,
  Linha,
  LinhaParadaComDetalhes,
  ResultadoBusca,
  RotaConexaoBusca,
  TipoDia,
} from '@/types';

const MIN_TRANSFER_MIN = 5;

type LinhaResumo = Pick<Linha, 'id' | 'codigo' | 'nome' | 'slug' | 'descricao' | 'ativa'>;

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

interface TrechoPlanejado {
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

function getReachableCitiesFrom(contexts: LinhaContext[], origemCidade: string): string[] {
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
      const segundoValido = trecho2.find((t2) => t2.saida_min >= t1.chegada_min + MIN_TRANSFER_MIN);
      if (segundoValido) {
        return true;
      }
    }
  }

  return false;
}

function planejarConexoes(
  db: Database,
  origemCidade: string,
  destinoCidade: string,
  tipo: TipoDia,
  limit = 10
): RotaConexaoBusca[] {
  const contexts = buildLinhaContexts(db, tipo);
  const rotas: Array<RotaConexaoBusca & { _sortTarifa: number; _sortSaida: string }> = [];
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
          trechos: [
            {
              linha: t1.linha,
              origem: t1.origem,
              destino: t1.destino,
              saida: t1.saida,
              chegada: t1.chegada,
              duracao_min: t1.duracao_min,
              tarifa: t1.tarifa,
            },
            {
              linha: t2.linha,
              origem: t2.origem,
              destino: t2.destino,
              saida: t2.saida,
              chegada: t2.chegada,
              duracao_min: t2.duracao_min,
              tarifa: t2.tarifa,
            },
          ],
          _sortTarifa: tarifaTotal ?? Number.POSITIVE_INFINITY,
          _sortSaida: t1.saida,
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
      if (a._sortTarifa !== b._sortTarifa) {
        return a._sortTarifa - b._sortTarifa;
      }
      return a._sortSaida.localeCompare(b._sortSaida);
    })
    .filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    })
    .slice(0, limit)
    .map(({ _sortTarifa: _dropTarifa, _sortSaida: _dropSaida, ...rest }) => rest);
}

export function listarDestinosAlcancaveis(db: Database, origemCidade: string, tipo: TipoDia): string[] {
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
    const temConexao = temDireto ? false : hasTimedConnection(contexts, origemCidade, cidade);

    if (temDireto || temConexao) {
      destinos.push(cidade);
    }
  }

  return destinos.sort((a, b) => a.localeCompare(b));
}

export function getParadasPublicas(db: Database): Array<{ cidade: string; id: number; nome: string }> {
  const linhasAtivas = db.linhas.filter((l) => l.ativa);
  const paradasIdsUsadas = new Set<number>();

  for (const linha of linhasAtivas) {
    for (const lp of linha.paradas) {
      paradasIdsUsadas.add(lp.parada_id);
    }
  }

  const paradasResultado = db.paradas
    .filter((p) => paradasIdsUsadas.has(p.id))
    .map((p) => ({ cidade: p.cidade, id: p.id, nome: p.nome }))
    .sort((a, b) => a.cidade.localeCompare(b.cidade));

  const cidadesUnicas: Array<{ cidade: string; id: number; nome: string }> = [];
  const cidadesVistas = new Set<string>();

  for (const p of paradasResultado) {
    if (!cidadesVistas.has(p.cidade)) {
      cidadesVistas.add(p.cidade);
      cidadesUnicas.push(p);
    }
  }

  return cidadesUnicas;
}

export function buscarRotas(
  db: Database,
  origemCidade: string,
  destinoCidade: string,
  tipo: TipoDia
): { resultados: ResultadoBusca[]; conexoes: RotaConexaoBusca[] } {
  const resultadosRankeados: Array<{
    resultado: ResultadoBusca;
    origemOrdem: number;
    tempoEstimado: number;
  }> = [];

  for (const linha of db.linhas.filter((l) => l.ativa)) {
    let paradaOrigemInfo: LinhaParadaComDetalhes | undefined;
    let paradaDestinoInfo: LinhaParadaComDetalhes | undefined;

    const paradasComDetalhes = linha.paradas
      .map((lp) => {
        const p = db.paradas.find((pd) => pd.id === lp.parada_id);
        return {
          ...lp,
          parada_nome: p?.nome || '',
          parada_cidade: p?.cidade || '',
        };
      })
      .sort((a, b) => a.ordem - b.ordem);

    for (const p of paradasComDetalhes) {
      if (p.parada_cidade === origemCidade && !paradaOrigemInfo) paradaOrigemInfo = p;
      if (p.parada_cidade === destinoCidade && !paradaDestinoInfo) paradaDestinoInfo = p;
    }

    if (paradaOrigemInfo && paradaDestinoInfo && paradaOrigemInfo.ordem < paradaDestinoInfo.ordem) {
      const horariosAtivosParaTipo = linha.horarios.filter((h) => h.tipo === tipo);

      const tarifaObj = linha.tarifas.find(
        (t) =>
          t.origem_id === paradaOrigemInfo?.parada_id &&
          t.destino_id === paradaDestinoInfo?.parada_id
      );

      const tempoEstimado = paradaDestinoInfo.tempo_minutos - paradaOrigemInfo.tempo_minutos;

      resultadosRankeados.push({
        resultado: {
          linha: {
            id: linha.id,
            codigo: linha.codigo,
            nome: linha.nome,
            slug: linha.slug,
            descricao: linha.descricao,
            ativa: linha.ativa,
          },
          horarios: horariosAtivosParaTipo.sort((a, b) => a.hora_saida.localeCompare(b.hora_saida)),
          paradas: paradasComDetalhes,
          tarifa: tarifaObj ? tarifaObj.valor : null,
          tempo_estimado: tempoEstimado,
        },
        origemOrdem: paradaOrigemInfo.ordem,
        tempoEstimado,
      });
    }
  }

  const temLinhaComOrigemInicial = resultadosRankeados.some((item) => item.origemOrdem === 1);

  const baseResultados = temLinhaComOrigemInicial
    ? resultadosRankeados.filter((item) => item.origemOrdem === 1)
    : resultadosRankeados;

  const resultados = baseResultados
    .sort((a, b) => {
      if (a.origemOrdem !== b.origemOrdem) {
        return a.origemOrdem - b.origemOrdem;
      }
      return a.tempoEstimado - b.tempoEstimado;
    })
    .map((item) => item.resultado);

  const conexoes = resultados.length > 0 ? [] : planejarConexoes(db, origemCidade, destinoCidade, tipo);

  return { resultados, conexoes };
}
