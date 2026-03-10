'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ResultadoBusca, TipoDia } from '@/types';
import { ArrowLeftRight, Coins, Bus, Search, Clock } from 'lucide-react';

interface Parada {
  id: number;
  nome: string;
  cidade: string;
}

export default function ScheduleSearch() {
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [tipoDia, setTipoDia] = useState<TipoDia>('UTIL');
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetch('/api/public/paradas')
      .then((res) => res.json())
      .then((data) => setParadas(data))
      .catch(console.error);
  }, []);

  // Get unique cities
  const cidades = [...new Set(paradas.map((p) => p.cidade))].sort();

  // Filter destination cities based on selected origin
  const cidadesDestino = cidades.filter((c) => c !== origem);

  const buscar = useCallback(async () => {
    if (!origem || !destino) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/public/busca?origem=${encodeURIComponent(origem)}&destino=${encodeURIComponent(destino)}&tipo=${tipoDia}`
      );
      const data = await res.json();
      setResultados(data.resultados || []);
    } catch (error) {
      console.error('Erro na busca:', error);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  }, [origem, destino, tipoDia]);

  const trocar = () => {
    const tmp = origem;
    setOrigem(destino);
    setDestino(tmp);
  };

  const dias: { label: string; value: TipoDia }[] = [
    { label: 'Dias Úteis', value: 'UTIL' },
    { label: 'Sábado', value: 'SABADO' },
    { label: 'Domingo', value: 'DOMINGO' },
    { label: 'Feriado', value: 'FERIADO' },
  ];

  return (
    <div>
      {/* Search Card */}
      <div className="search-card">
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
            >
              <option value="">Selecione o destino</option>
              {cidadesDestino.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
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
          disabled={!origem || !destino || loading}
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
          ) : resultados.length > 0 ? (
            resultados.map((r) => (
              <div key={r.linha.id} className="results" style={{ marginTop: '1.5rem' }}>
                <div className="results__header">
                  <div>
                    <div className="results__title">
                      {r.linha.nome}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--cinza-600)', marginTop: '0.25rem' }}>
                      {r.tempo_estimado && (
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
                    {r.horarios.map((h) => {
                      // Calculate estimated arrival
                      let chegada = '';
                      if (r.tempo_estimado) {
                        const [hh, mm] = h.hora_saida.split(':').map(Number);
                        const totalMin = hh * 60 + mm + r.tempo_estimado;
                        chegada = `${String(Math.floor(totalMin / 60) % 24).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
                      }
                      return (
                        <tr key={h.id}>
                          <td>
                            <span className="schedule-table__time">{h.hora_saida}</span>
                          </td>
                          <td>{chegada || '—'}</td>
                          <td>
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
            ))
          ) : (
            <div className="results" style={{ marginTop: '1.5rem' }}>
              <div className="results__empty">
                <div className="results__empty-icon"><Bus size={48} color="var(--cinza-400)" /></div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                  Nenhum horário encontrado
                </p>
                <p>
                  Não há ônibus direto de <strong>{origem}</strong> para{' '}
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
