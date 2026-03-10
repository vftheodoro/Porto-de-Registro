'use client';

import { useState } from 'react';
import type { Linha, Horario, LinhaParadaComDetalhes, TarifaComDetalhes, TipoDia } from '@/types';
import { Clock, MapPin, Coins, FileDown, Route, Timer, ArrowRightLeft } from 'lucide-react';

interface Props {
  linha: Linha;
  paradas: LinhaParadaComDetalhes[];
  horarios: Horario[];
  tarifas: TarifaComDetalhes[];
  linhaVolta: Linha | null;
  paradasVolta: LinhaParadaComDetalhes[];
  horariosVolta: Horario[];
  tarifasVolta: TarifaComDetalhes[];
}

export default function LinhaDetailClient({
  linha,
  paradas,
  horarios,
  tarifas,
  linhaVolta,
  paradasVolta,
  horariosVolta,
  tarifasVolta,
}: Props) {
  const [tipoDia, setTipoDia] = useState<TipoDia>('UTIL');
  const [activeTab, setActiveTab] = useState<'horarios' | 'paradas' | 'tarifas'>('horarios');

  const horariosFiltrados = horarios.filter((h) => h.tipo === tipoDia);
  const horariosVoltaFiltrados = horariosVolta.filter((h) => h.tipo === tipoDia);
  const observacoesIda = horariosFiltrados.filter((h) => Boolean(h.observacao?.trim()));
  const observacoesVolta = horariosVoltaFiltrados.filter((h) => Boolean(h.observacao?.trim()));

  const origem = paradas[0];
  const destino = paradas[paradas.length - 1];
  const tempoTotal = destino ? destino.tempo_minutos : 0;
  const menorTarifa = tarifas.length > 0 ? Math.min(...tarifas.map((t) => t.valor)) : null;
  const maiorTarifa = tarifas.length > 0 ? Math.max(...tarifas.map((t) => t.valor)) : null;

  const chegadaEstimativa = (horaSaida: string, tempoMin: number) => {
    const [hh, mm] = horaSaida.split(':').map(Number);
    const total = hh * 60 + mm + tempoMin;
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  const dias: { label: string; value: TipoDia }[] = [
    { label: 'Dias Úteis', value: 'UTIL' },
    { label: 'Sábado', value: 'SABADO' },
    { label: 'Domingo', value: 'DOMINGO' },
    { label: 'Feriado', value: 'FERIADO' },
  ];

  const tabs = [
    { id: 'horarios' as const, label: <><Clock size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> Horários</>, count: horarios.length },
    { id: 'paradas' as const, label: <><MapPin size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> Paradas</>, count: paradas.length },
    { id: 'tarifas' as const, label: <><Coins size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> Tarifas</>, count: tarifas.length },
  ];

  const downloadPDF = async () => {
    try {
      const res = await fetch(`/api/public/pdf?linha_id=${linha.id}&tipo=${tipoDia}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `horarios-${linha.slug}-${tipoDia.toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    }
  };

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="linhas-overview" role="list" aria-label="Resumo da linha" style={{ marginBottom: '1.5rem' }}>
          <article className="linhas-overview__item" role="listitem">
            <div className="linhas-overview__icon"><Route size={18} /></div>
            <div>
              <p className="linhas-overview__label">Trecho principal</p>
              <strong className="linhas-overview__value" style={{ fontSize: '1rem' }}>
                {origem?.parada_cidade || 'Origem'} → {destino?.parada_cidade || 'Destino'}
              </strong>
            </div>
          </article>
          <article className="linhas-overview__item" role="listitem">
            <div className="linhas-overview__icon"><Timer size={18} /></div>
            <div>
              <p className="linhas-overview__label">Tempo estimado</p>
              <strong className="linhas-overview__value">{tempoTotal} min</strong>
            </div>
          </article>
          <article className="linhas-overview__item" role="listitem">
            <div className="linhas-overview__icon"><Coins size={18} /></div>
            <div>
              <p className="linhas-overview__label">Faixa de tarifa</p>
              <strong className="linhas-overview__value" style={{ fontSize: '1rem' }}>
                {menorTarifa !== null && maiorTarifa !== null
                  ? `R$ ${menorTarifa.toFixed(2)} a R$ ${maiorTarifa.toFixed(2)}`
                  : 'Nao disponivel'}
              </strong>
            </div>
          </article>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`search-card__day-tab ${activeTab === tab.id ? 'search-card__day-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ fontSize: '1rem', padding: '0.5rem 1.25rem' }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Horários Tab */}
        {activeTab === 'horarios' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div className="search-card__day-tabs" style={{ margin: 0 }}>
                {dias.map((d) => (
                  <button
                    key={d.value}
                    className={`search-card__day-tab ${tipoDia === d.value ? 'search-card__day-tab--active' : ''}`}
                    onClick={() => setTipoDia(d.value)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <button className="btn btn--secondary btn--sm" onClick={downloadPDF}>
                <FileDown size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Baixar PDF
              </button>
            </div>

            <div className="line-schedules-grid" style={{ marginTop: '1.25rem' }}>
              <div className="results line-schedule-panel">
                <div className="results__header">
                  <div className="results__title">Ida: {linha.nome}</div>
                  <span className="badge badge--verde">{linha.codigo}</span>
                </div>
                {horariosFiltrados.length > 0 ? (
                  <>
                    <table className="schedule-table" style={{ marginTop: 0 }}>
                      <thead>
                        <tr>
                          <th>Saída</th>
                          <th>Chegada estimada</th>
                        </tr>
                      </thead>
                      <tbody>
                        {horariosFiltrados.map((h) => (
                          <tr key={h.id}>
                            <td>
                              <span className="schedule-table__time">{h.hora_saida}</span>
                              {h.observacao?.trim() ? (
                                <span className="schedule-table__note-indicator" title="Este horário possui observação importante">
                                  Obs
                                </span>
                              ) : null}
                            </td>
                            <td>{chegadaEstimativa(h.hora_saida, tempoTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {observacoesIda.length > 0 && (
                      <div className="schedule-notes" aria-live="polite">
                        <p className="schedule-notes__title">Observações relevantes (ida)</p>
                        <ul className="schedule-notes__list">
                          {observacoesIda.map((h) => (
                            <li key={`obs-ida-${h.id}`}>
                              <strong>{h.hora_saida}</strong> - {h.observacao}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="results__empty" style={{ padding: '1.25rem' }}>
                    <p>Nenhum horário de ida para {dias.find(d => d.value === tipoDia)?.label?.toLowerCase()}.</p>
                  </div>
                )}
              </div>

              {linhaVolta && (
                <div className="results line-schedule-panel">
                  <div className="results__header">
                    <div className="results__title" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ArrowRightLeft size={16} /> Volta: {linhaVolta.nome}
                    </div>
                    <span className="badge badge--verde">{linhaVolta.codigo}</span>
                  </div>
                  {horariosVoltaFiltrados.length > 0 ? (
                    <>
                      <table className="schedule-table" style={{ marginTop: 0 }}>
                        <thead>
                          <tr>
                            <th>Saída</th>
                            <th>Chegada estimada</th>
                          </tr>
                        </thead>
                        <tbody>
                          {horariosVoltaFiltrados.map((h) => (
                            <tr key={h.id}>
                              <td>
                                <span className="schedule-table__time">{h.hora_saida}</span>
                                {h.observacao?.trim() ? (
                                  <span className="schedule-table__note-indicator" title="Este horário possui observação importante">
                                    Obs
                                  </span>
                                ) : null}
                              </td>
                              <td>
                                {paradasVolta.length > 0
                                  ? chegadaEstimativa(h.hora_saida, paradasVolta[paradasVolta.length - 1].tempo_minutos)
                                  : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {observacoesVolta.length > 0 && (
                        <div className="schedule-notes" aria-live="polite">
                          <p className="schedule-notes__title">Observações relevantes (volta)</p>
                          <ul className="schedule-notes__list">
                            {observacoesVolta.map((h) => (
                              <li key={`obs-volta-${h.id}`}>
                                <strong>{h.hora_saida}</strong> - {h.observacao}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="results__empty" style={{ padding: '1.25rem' }}>
                      <p>Nenhum horário de volta para este tipo de dia.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </>
        )}

        {/* Paradas Tab */}
        {activeTab === 'paradas' && (
          <div className="stops-timeline">
            {paradas.map((parada, index) => (
              <div key={parada.parada_id} className="stop-item">
                <div className="stop-item__dot">
                  {index === 0 || index === paradas.length - 1 ? (
                    <span style={{ color: 'white', fontSize: '0.7rem' }}>
                      {index === 0 ? '▶' : '■'}
                    </span>
                  ) : null}
                </div>
                <div className="stop-item__info">
                  <div className="stop-item__name">{parada.parada_nome}</div>
                  <div className="stop-item__city">{parada.parada_cidade}</div>
                </div>
                <div className="stop-item__time">
                  {parada.tempo_minutos > 0 ? `+${parada.tempo_minutos} min` : 'Partida'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tarifas Tab */}
        {activeTab === 'tarifas' && (
          <>
            <div className="results">
              {tarifas.length > 0 ? (
                <table className="fare-table">
                  <thead>
                    <tr>
                      <th>Origem</th>
                      <th>Destino</th>
                      <th>Tarifa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tarifas.map((t) => (
                      <tr key={`${t.origem_id}-${t.destino_id}`}>
                        <td>{t.origem_nome}</td>
                        <td>{t.destino_nome}</td>
                        <td>
                          <span className="fare-table__value">
                            R$ {t.valor.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="results__empty">
                  <p>Informações de tarifa ainda não disponíveis para esta linha.</p>
                </div>
              )}
            </div>

            {linhaVolta && tarifasVolta.length > 0 && (
              <div className="results" style={{ marginTop: '1.25rem' }}>
                <div className="results__header">
                  <div className="results__title">Tarifas da volta: {linhaVolta.nome}</div>
                  <span className="badge badge--verde">{linhaVolta.codigo}</span>
                </div>
                <table className="fare-table">
                  <thead>
                    <tr>
                      <th>Origem</th>
                      <th>Destino</th>
                      <th>Tarifa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tarifasVolta.map((t) => (
                      <tr key={`${t.origem_id}-${t.destino_id}`}>
                        <td>{t.origem_nome}</td>
                        <td>{t.destino_nome}</td>
                        <td>
                          <span className="fare-table__value">R$ {t.valor.toFixed(2)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
