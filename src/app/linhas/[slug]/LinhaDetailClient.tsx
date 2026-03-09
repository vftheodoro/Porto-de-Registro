'use client';

import { useState } from 'react';
import type { Linha, Horario, LinhaParadaComDetalhes, TarifaComDetalhes, TipoDia } from '@/types';
import { Clock, MapPin, Coins, Bus } from 'lucide-react';

interface Props {
  linha: Linha;
  paradas: LinhaParadaComDetalhes[];
  horarios: Horario[];
  tarifas: TarifaComDetalhes[];
}

export default function LinhaDetailClient({ linha, paradas, horarios, tarifas }: Props) {
  const [tipoDia, setTipoDia] = useState<TipoDia>('UTIL');
  const [activeTab, setActiveTab] = useState<'horarios' | 'paradas' | 'tarifas'>('horarios');

  const horariosFiltrados = horarios.filter((h) => h.tipo === tipoDia);

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
                📄 Baixar PDF
              </button>
            </div>

            {horariosFiltrados.length > 0 ? (
              <div className="results">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Saída</th>
                      <th>Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horariosFiltrados.map((h) => (
                      <tr key={h.id}>
                        <td>
                          <span className="schedule-table__time">{h.hora_saida}</span>
                        </td>
                        <td>
                          {h.observacao ? (
                            <span className="schedule-table__obs">{h.observacao}</span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="results">
                <div className="results__empty">
                  <div className="results__empty-icon"><Bus size={48} color="var(--cinza-400)" /></div>
                  <p>Nenhum horário disponível para {dias.find(d => d.value === tipoDia)?.label?.toLowerCase()}.</p>
                </div>
              </div>
            )}
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
        )}
      </div>
    </section>
  );
}
