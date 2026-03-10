'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { BuscaResponse, ResultadoBusca, RotaConexaoBusca, TipoDia } from '@/types';
import { ArrowLeftRight, Coins, Bus, Search, Clock, Route, ArrowRight, Timer, Sparkles } from 'lucide-react';

interface Parada {
  id: number;
  nome: string;
  cidade: string;
}

const SEARCH_STATE_STORAGE_KEY = 'porto-search-state-v1';

function toMin(hhmm: string): number {
  const [hh, mm] = hhmm.split(':').map(Number);
  return hh * 60 + mm;
}

function toHHMM(totalMin: number): string {
  const minutesInDay = 24 * 60;
  const safe = ((totalMin % minutesInDay) + minutesInDay) % minutesInDay;
  const hh = Math.floor(safe / 60);
  const mm = safe % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function getEasterDate(year: number): Date {
  // Anonymous Gregorian algorithm.
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-based
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isBrazilNationalHoliday(date: Date): boolean {
  const year = date.getFullYear();

  const fixed = new Set([
    `${year}-01-01`, // Confraternizacao Universal
    `${year}-04-21`, // Tiradentes
    `${year}-05-01`, // Dia do Trabalho
    `${year}-09-07`, // Independencia
    `${year}-10-12`, // Nossa Senhora Aparecida
    `${year}-11-02`, // Finados
    `${year}-11-15`, // Proclamacao da Republica
    `${year}-11-20`, // Dia da Consciencia Negra (nacional)
    `${year}-12-25`, // Natal
  ]);

  const easter = getEasterDate(year);
  const movable = new Set([
    dateKey(addDays(easter, -48)), // Carnaval (segunda)
    dateKey(addDays(easter, -47)), // Carnaval (terca)
    dateKey(addDays(easter, -2)), // Sexta-feira Santa
    dateKey(easter), // Pascoa
    dateKey(addDays(easter, 60)), // Corpus Christi
  ]);

  const key = dateKey(date);
  return fixed.has(key) || movable.has(key);
}

function getTodayTipoDia(baseDate?: Date): TipoDia {
  const date = baseDate ?? new Date();
  if (isBrazilNationalHoliday(date)) return 'FERIADO';
  const day = date.getDay();
  if (day === 0) return 'DOMINGO';
  if (day === 6) return 'SABADO';
  return 'UTIL';
}

export default function ScheduleSearch() {
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [tipoDia, setTipoDia] = useState<TipoDia>(() => getTodayTipoDia(new Date()));
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
  const [conexoes, setConexoes] = useState<RotaConexaoBusca[]>([]);
  const [destinosPermitidos, setDestinosPermitidos] = useState<string[]>([]);
  const [loadingDestinos, setLoadingDestinos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [agora, setAgora] = useState<Date>(new Date());
  const [shouldAutoSearch, setShouldAutoSearch] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setAgora(new Date());
    }, 60_000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/public/paradas')
      .then((res) => res.json())
      .then((data) => setParadas(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(SEARCH_STATE_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        origem?: string;
        destino?: string;
        tipoDia?: TipoDia;
      };

      if (parsed.tipoDia && ['UTIL', 'SABADO', 'DOMINGO', 'FERIADO'].includes(parsed.tipoDia)) {
        setTipoDia(parsed.tipoDia);
      }
      if (typeof parsed.origem === 'string') {
        setOrigem(parsed.origem);
      }
      if (typeof parsed.destino === 'string') {
        setDestino(parsed.destino);
      }

      if (parsed.origem && parsed.destino) {
        setShouldAutoSearch(true);
      }
    } catch {
      // Ignore invalid persisted payload.
    }
  }, []);

  // Get unique cities
  const cidades = [...new Set(paradas.map((p) => p.cidade))].sort();

  useEffect(() => {
    if (!origem) {
      setDestinosPermitidos([]);
      setDestino('');
      return;
    }

    setLoadingDestinos(true);
    fetch(`/api/public/destinos?origem=${encodeURIComponent(origem)}&tipo=${tipoDia}`)
      .then((res) => res.json())
      .then((data) => {
        const destinos = Array.isArray(data.destinos) ? data.destinos : [];
        setDestinosPermitidos(destinos);
      })
      .catch(() => {
        setDestinosPermitidos([]);
      })
      .finally(() => setLoadingDestinos(false));
  }, [origem, tipoDia]);

  useEffect(() => {
    if (destino && !destinosPermitidos.includes(destino)) {
      setDestino('');
    }
  }, [destinosPermitidos, destino]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        SEARCH_STATE_STORAGE_KEY,
        JSON.stringify({ origem, destino, tipoDia })
      );
    } catch {
      // Non-blocking for browsers with disabled storage.
    }
  }, [origem, destino, tipoDia]);

  const buscar = useCallback(async () => {
    if (!origem || !destino) return;
    setLoading(true);
    setSearched(true);
    setError('');
    try {
      const res = await fetch(
        `/api/public/busca?origem=${encodeURIComponent(origem)}&destino=${encodeURIComponent(destino)}&tipo=${tipoDia}`
      );
      const data = (await res.json()) as BuscaResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao buscar horarios');
      }
      setResultados(Array.isArray(data.resultados) ? data.resultados : []);
      setConexoes(Array.isArray(data.conexoes) ? data.conexoes : []);
    } catch (error) {
      console.error('Erro na busca:', error);
      setResultados([]);
      setConexoes([]);
      setError(error instanceof Error ? error.message : 'Erro ao buscar horarios');
    } finally {
      setLoading(false);
    }
  }, [origem, destino, tipoDia]);

  useEffect(() => {
    if (!shouldAutoSearch) return;
    if (loadingDestinos || loading || searched) return;
    if (!origem || !destino) return;
    if (!destinosPermitidos.includes(destino)) return;

    setShouldAutoSearch(false);
    void buscar();
  }, [
    shouldAutoSearch,
    loadingDestinos,
    loading,
    searched,
    origem,
    destino,
    destinosPermitidos,
    buscar,
  ]);

  const trocar = () => {
    const tmp = origem;
    setOrigem(destino);
    setDestino(tmp);
    setResultados([]);
    setConexoes([]);
    setSearched(false);
    setError('');
  };

  const dias: { label: string; value: TipoDia }[] = [
    { label: 'Dias Úteis', value: 'UTIL' },
    { label: 'Sábado', value: 'SABADO' },
    { label: 'Domingo', value: 'DOMINGO' },
    { label: 'Feriado', value: 'FERIADO' },
  ];

  const nowMin = useMemo(() => agora.getHours() * 60 + agora.getMinutes(), [agora]);
  const nowLabel = useMemo(
    () => agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    [agora]
  );
  const liveMode = tipoDia === getTodayTipoDia();

  const getConnectionTag = (index: number, esperaMin: number) => {
    if (index === 0) return 'Melhor equilibrio';
    if (esperaMin >= 60) return 'Espera alta';
    if (esperaMin <= 20) return 'Conexao rapida';
    return 'Alternativa';
  };

  return (
    <div>
      {/* Search Card */}
      <div className="search-card">
        <div className="search-card__live">
          <span className="search-card__live-clock">
            <Timer size={14} /> Agora: {nowLabel}
          </span>
          <span className={`search-card__live-mode ${liveMode ? 'search-card__live-mode--on' : ''}`}>
            {liveMode ? 'Leitura em tempo real ativa' : 'Dia selecionado diferente de hoje'}
          </span>
        </div>

        <div className="search-card__fields">
          <div className="form-group">
            <label className="form-group__label" htmlFor="origem">
              De onde você sai?
            </label>
            <select
              id="origem"
              className="form-group__select"
              value={origem}
              onChange={(e) => {
                setOrigem(e.target.value);
                if (e.target.value === destino) setDestino('');
              }}
            >
              <option value="">Selecione a cidade</option>
              {cidades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            className="search-card__swap"
            onClick={trocar}
            title="Trocar ida ↔ volta"
            type="button"
          >
            <ArrowLeftRight size={20} />
          </button>

          <div className="form-group">
            <label className="form-group__label" htmlFor="destino">
              Para onde você vai?
            </label>
            <select
              id="destino"
              className="form-group__select"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              disabled={!origem || loadingDestinos}
            >
              <option value="">
                {!origem
                  ? 'Escolha a origem primeiro'
                  : loadingDestinos
                    ? 'Carregando destinos...'
                    : destinosPermitidos.length === 0
                      ? 'Sem destinos disponiveis para este dia'
                      : 'Selecione o destino'}
              </option>
              {destinosPermitidos.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {origem && !loadingDestinos && destinosPermitidos.length === 0 && (
              <p className="search-card__hint search-card__hint--warn">
                Nao ha trajetos saindo de {origem} para {dias.find((d) => d.value === tipoDia)?.label.toLowerCase()}.
              </p>
            )}
          </div>
        </div>

        <div className="search-card__day-tabs">
          {dias.map((d) => (
            <button
              key={d.value}
              className={`search-card__day-tab ${
                tipoDia === d.value ? 'search-card__day-tab--active' : ''
              }`}
              onClick={() => setTipoDia(d.value)}
              type="button"
            >
              {d.label}
            </button>
          ))}
        </div>

        <button
          className="btn btn--primary btn--full"
          onClick={buscar}
          disabled={!origem || !destino || loading || !destinosPermitidos.includes(destino)}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
              <span className="spinner" style={{ width: 18, height: 18 }} />
              Buscando...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
              <Search size={18} /> Ver Horários
            </span>
          )}
        </button>
      </div>

      {/* Results */}
      {searched && (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 1rem' }}>
          {loading ? (
            <div className="loading-overlay">
              <span className="spinner" />
              Carregando horários...
            </div>
          ) : (resultados.length > 0 || conexoes.length > 0) ? (
            <>
            {error && (
              <div className="results" style={{ marginTop: '1.5rem' }}>
                <div className="results__empty">
                  <p>{error}</p>
                </div>
              </div>
            )}

            {resultados.length > 0 && resultados.map((r) => {
              const origemOffset = r.paradas.find((p) => p.parada_cidade === origem)?.tempo_minutos ?? 0;
              const horariosOrdenados = [...r.horarios].sort((a, b) => {
                const aMin = toMin(a.hora_saida) + origemOffset;
                const bMin = toMin(b.hora_saida) + origemOffset;
                return aMin - bMin;
              });

              const nextHorario = liveMode
                ? horariosOrdenados.find((h) => toMin(h.hora_saida) + origemOffset >= nowMin)
                : null;

              const nextBoardingMin = nextHorario
                ? toMin(nextHorario.hora_saida) + origemOffset
                : null;

              return (
                <div key={r.linha.id} className="results" style={{ marginTop: '1.5rem' }}>
                  <div className="results__header">
                    <div>
                      <div className="results__title">
                        {r.linha.nome}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--cinza-600)', marginTop: '0.25rem' }}>
                        {typeof r.tempo_estimado === 'number' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={14} /> {r.tempo_estimado} min
                          </span>
                        )}
                        {r.tarifa && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            {' · '} <Coins size={14} /> R$ {r.tarifa.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {liveMode && nextHorario && nextBoardingMin != null && (
                        <div className="results__next-info">
                          <Sparkles size={14} />
                          Proximo embarque em {toHHMM(nextBoardingMin)} ({Math.max(0, nextBoardingMin - nowMin)} min)
                        </div>
                      )}
                    </div>
                    <span className="badge badge--verde">{r.linha.codigo}</span>
                  </div>
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th>Saída</th>
                        <th>Chegada estimada</th>
                        <th>Observação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {horariosOrdenados.map((h) => {
                        let chegada = '';
                        const saidaEmbarqueMin = toMin(h.hora_saida) + origemOffset;
                        const saidaExibida = toHHMM(saidaEmbarqueMin);
                        if (typeof r.tempo_estimado === 'number') {
                          const totalMin = saidaEmbarqueMin + r.tempo_estimado;
                          chegada = toHHMM(totalMin);
                        }

                        const status = !liveMode
                          ? 'programado'
                          : nextBoardingMin != null && saidaEmbarqueMin === nextBoardingMin
                            ? 'proximo'
                            : saidaEmbarqueMin < nowMin
                              ? 'passou'
                              : 'futuro';

                        return (
                          <tr key={h.id} className={`schedule-row schedule-row--${status}`}>
                            <td>
                              <span className="schedule-table__time">{saidaExibida}</span>
                            </td>
                            <td>{chegada || '—'}</td>
                            <td>
                              {status === 'passou' && <span className="schedule-status-tag">Ja passou</span>}
                              {status === 'proximo' && <span className="schedule-status-tag schedule-status-tag--next">Proximo</span>}
                              {status === 'futuro' && <span className="schedule-status-tag schedule-status-tag--future">A caminho</span>}
                              {h.observacao ? (
                                <span className="schedule-table__obs">{h.observacao}</span>
                              ) : (
                                '—'
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}

            {conexoes.length > 0 && (
              <div className="results" style={{ marginTop: '1.5rem' }}>
                <div className="results__header">
                  <div className="results__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Route size={18} /> Rotas com conexao
                  </div>
                  <span className="badge badge--dourado">{conexoes.length} opcao(oes)</span>
                </div>

                <div className="connection-list">
                  {conexoes.map((rota, index) => (
                    <article key={rota.id} className="connection-card">
                      <div className="connection-card__top">
                        <div className="connection-card__title-wrap">
                          <div className="connection-card__title-line">
                            <strong>{rota.trechos[0].origem}</strong> <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /> <strong>{rota.trechos[1].destino}</strong>
                          </div>
                          <div className="connection-card__periodo">
                            Saida {rota.saida_total} · Chegada {rota.chegada_total}
                          </div>
                        </div>
                        <div className="connection-card__tag">
                          {getConnectionTag(index, rota.tempo_espera_min)}
                        </div>
                      </div>

                      <div className="connection-card__meta-grid">
                        <div className="connection-metric">
                          <span className="connection-metric__label">Tempo total</span>
                          <span className="connection-metric__value"><Clock size={14} /> {rota.duracao_total_min} min</span>
                        </div>
                        <div className="connection-metric">
                          <span className="connection-metric__label">Conexao</span>
                          <span className="connection-metric__value">Em {rota.conexao_em}</span>
                        </div>
                        <div className="connection-metric">
                          <span className="connection-metric__label">Espera</span>
                          <span className="connection-metric__value">{rota.tempo_espera_min} min</span>
                        </div>
                        <div className="connection-metric">
                          <span className="connection-metric__label">Tarifa estimada</span>
                          <span className="connection-metric__value">
                            {rota.tarifa_total != null ? <><Coins size={14} /> R$ {rota.tarifa_total.toFixed(2)}</> : 'Consulte no embarque'}
                          </span>
                        </div>
                      </div>
                      <div className="connection-card__legs">
                        {rota.trechos.map((trecho, idx) => (
                          <div key={`${rota.id}-${idx}`} className="connection-leg">
                            <div className="connection-leg__badge">Trecho {idx + 1}</div>
                            <div className="connection-leg__line">{trecho.linha.codigo} - {trecho.linha.nome}</div>
                            <div className="connection-leg__time">
                              {trecho.origem} {trecho.saida} <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /> {trecho.destino} {trecho.chegada}
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
            </>
          ) : (
            <div className="results" style={{ marginTop: '1.5rem' }}>
              <div className="results__empty">
                <div className="results__empty-icon"><Bus size={48} color="var(--cinza-400)" /></div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                  Nenhum horario encontrado
                </p>
                <p>
                  Nao ha opcao de viagem de <strong>{origem}</strong> para{' '}
                  <strong>{destino}</strong> para{' '}
                  {dias.find((d) => d.value === tipoDia)?.label?.toLowerCase()}.
                </p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  Tente outro dia ou verifique as linhas disponíveis.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
