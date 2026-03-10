'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Database, Linha, LinhaParada, Horario, Tarifa, TipoDia } from '@/types';
import { Save, ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react';

const TIPOS_DIA: { value: TipoDia; label: string }[] = [
  { value: 'UTIL', label: 'Dias úteis' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
  { value: 'FERIADO', label: 'Feriado' },
];

export default function AdminLinhaEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [db, setDb] = useState<Database | null>(null);
  const [linha, setLinha] = useState<Linha | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/data', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setDb(data);
        const l = data.linhas?.find((x: Linha) => x.id === id);
        setLinha(l ? { ...l } : null);
      })
      .catch(() => setMessage({ type: 'err', text: 'Erro ao carregar dados' }))
      .finally(() => setLoading(false));
  }, [id]);

  function updateLinha(updates: Partial<Linha>) {
    setLinha((l) => (l ? { ...l, ...updates } : null));
  }

  function updateParadas(paradas: LinhaParada[]) {
    updateLinha({ paradas });
  }
  function updateHorarios(horarios: Horario[]) {
    updateLinha({ horarios });
  }
  function updateTarifas(tarifas: Tarifa[]) {
    updateLinha({ tarifas });
  }

  async function handleSave() {
    if (!db || !linha) return;
    setSaving(true);
    setMessage(null);
    const linhas = db.linhas.map((l) => (l.id === linha.id ? linha : l));
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...db, linhas }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar');
      setMessage({ type: 'ok', text: data.saved ? 'Salvo em data.json.' : data.message || 'Baixe o JSON e faça commit em produção.' });
    } catch (e) {
      setMessage({ type: 'err', text: e instanceof Error ? e.message : 'Erro ao salvar' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Carregando…</p>;
  if (!db || !linha) return <p>Linha não encontrada.</p>;

  const paradas = db.paradas ?? [];

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-header__title">Editar linha: {linha.codigo}</h1>
        <div className="admin-header__actions">
          <Link href="/admin/linhas" className="btn btn--secondary">
            <ArrowLeft size={18} style={{ marginRight: 6 }} />
            Voltar
          </Link>
          <button type="button" className="btn btn--primary" onClick={handleSave} disabled={saving}>
            <Save size={18} style={{ marginRight: 6 }} />
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </div>

      {message && (
        <div className="admin-login__error" style={message.type === 'ok' ? { background: 'var(--verde-50)', color: 'var(--verde-800)' } : undefined} role="alert">
          <AlertCircle size={16} />
          {message.text}
        </div>
      )}

      <div className="admin-form" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Dados da linha</h2>
        <div className="admin-form__grid">
          <div>
            <label>Código</label>
            <input
              type="text"
              value={linha.codigo}
              onChange={(e) => updateLinha({ codigo: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <div>
            <label>Nome</label>
            <input
              type="text"
              value={linha.nome}
              onChange={(e) => updateLinha({ nome: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <div>
            <label>Slug (URL)</label>
            <input
              type="text"
              value={linha.slug}
              onChange={(e) => updateLinha({ slug: e.target.value })}
              placeholder="registro-cajati"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
            <input
              type="checkbox"
              id="linha-ativa"
              checked={linha.ativa}
              onChange={(e) => updateLinha({ ativa: e.target.checked })}
            />
            <label htmlFor="linha-ativa">Linha ativa</label>
          </div>
          <div className="admin-form__full">
            <label>Descrição</label>
            <input
              type="text"
              value={linha.descricao ?? ''}
              onChange={(e) => updateLinha({ descricao: e.target.value || undefined })}
              placeholder="Opcional"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
        </div>
      </div>

      {/* Paradas */}
      <div className="admin-form" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Paradas da rota (ordem)</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ordem</th>
              <th>Parada</th>
              <th>Tempo (min)</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {(linha.paradas ?? []).sort((a, b) => a.ordem - b.ordem).map((lp, idx) => (
              <tr key={idx}>
                <td>
                  <input
                    type="number"
                    min={1}
                    value={lp.ordem}
                    onChange={(e) => {
                      const arr = [...(linha.paradas ?? [])];
                      arr[idx] = { ...arr[idx], ordem: parseInt(e.target.value, 10) || 1 };
                      updateParadas(arr);
                    }}
                    style={{ width: 60, padding: '0.25rem' }}
                  />
                </td>
                <td>
                  <select
                    value={lp.parada_id}
                    onChange={(e) => {
                      const arr = [...(linha.paradas ?? [])];
                      arr[idx] = { ...arr[idx], parada_id: Number(e.target.value) };
                      updateParadas(arr);
                    }}
                    style={{ width: '100%', padding: '0.25rem' }}
                  >
                    {paradas.map((p) => (
                      <option key={p.id} value={p.id}>{p.nome} ({p.cidade})</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={lp.tempo_minutos}
                    onChange={(e) => {
                      const arr = [...(linha.paradas ?? [])];
                      arr[idx] = { ...arr[idx], tempo_minutos: parseInt(e.target.value, 10) || 0 };
                      updateParadas(arr);
                    }}
                    style={{ width: 80, padding: '0.25rem' }}
                  />
                </td>
                <td>
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => updateParadas((linha.paradas ?? []).filter((_, i) => i !== idx))}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="btn btn--secondary btn--sm" style={{ marginTop: '0.5rem' }} onClick={() => updateParadas([...(linha.paradas ?? []), { parada_id: paradas[0]?.id ?? 0, ordem: (linha.paradas?.length ?? 0) + 1, tempo_minutos: 0 }])}>
          <Plus size={14} style={{ marginRight: 4 }} /> Adicionar parada
        </button>
      </div>

      {/* Horários */}
      <div className="admin-form" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Horários de saída</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Hora (HH:MM)</th>
              <th>Tipo dia</th>
              <th>Observação</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {(linha.horarios ?? []).map((h, idx) => (
              <tr key={h.id ?? idx}>
                <td>
                  <input
                    type="text"
                    value={h.hora_saida}
                    onChange={(e) => {
                      const arr = [...(linha.horarios ?? [])];
                      arr[idx] = { ...arr[idx], hora_saida: e.target.value };
                      updateHorarios(arr);
                    }}
                    placeholder="06:00"
                    style={{ width: 80, padding: '0.25rem' }}
                  />
                </td>
                <td>
                  <select
                    value={h.tipo}
                    onChange={(e) => {
                      const arr = [...(linha.horarios ?? [])];
                      arr[idx] = { ...arr[idx], tipo: e.target.value as TipoDia };
                      updateHorarios(arr);
                    }}
                    style={{ padding: '0.25rem' }}
                  >
                    {TIPOS_DIA.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={h.observacao ?? ''}
                    onChange={(e) => {
                      const arr = [...(linha.horarios ?? [])];
                      arr[idx] = { ...arr[idx], observacao: e.target.value || undefined };
                      updateHorarios(arr);
                    }}
                    placeholder="Opcional"
                    style={{ width: '100%', padding: '0.25rem' }}
                  />
                </td>
                <td>
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => updateHorarios((linha.horarios ?? []).filter((_, i) => i !== idx))}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          style={{ marginTop: '0.5rem' }}
          onClick={() => {
            const maxId = Math.max(0, ...(linha.horarios ?? []).map((h) => h.id || 0));
            updateHorarios([...(linha.horarios ?? []), { id: maxId + 1, hora_saida: '06:00', tipo: 'UTIL', observacao: '' }]);
          }}
        >
          <Plus size={14} style={{ marginRight: 4 }} /> Adicionar horário
        </button>
      </div>

      {/* Tarifas */}
      <div className="admin-form">
        <h2 style={{ marginBottom: '1rem' }}>Tarifas (trechos)</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Origem</th>
              <th>Destino</th>
              <th>Valor (R$)</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {(linha.tarifas ?? []).map((t, idx) => (
              <tr key={idx}>
                <td>
                  <select
                    value={t.origem_id}
                    onChange={(e) => {
                      const arr = [...(linha.tarifas ?? [])];
                      arr[idx] = { ...arr[idx], origem_id: Number(e.target.value) };
                      updateTarifas(arr);
                    }}
                    style={{ width: '100%', padding: '0.25rem' }}
                  >
                    {paradas.map((p) => (
                      <option key={p.id} value={p.id}>{p.nome} ({p.cidade})</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={t.destino_id}
                    onChange={(e) => {
                      const arr = [...(linha.tarifas ?? [])];
                      arr[idx] = { ...arr[idx], destino_id: Number(e.target.value) };
                      updateTarifas(arr);
                    }}
                    style={{ width: '100%', padding: '0.25rem' }}
                  >
                    {paradas.map((p) => (
                      <option key={p.id} value={p.id}>{p.nome} ({p.cidade})</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    step={0.01}
                    min={0}
                    value={t.valor}
                    onChange={(e) => {
                      const arr = [...(linha.tarifas ?? [])];
                      arr[idx] = { ...arr[idx], valor: parseFloat(e.target.value) || 0 };
                      updateTarifas(arr);
                    }}
                    style={{ width: 80, padding: '0.25rem' }}
                  />
                </td>
                <td>
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => updateTarifas((linha.tarifas ?? []).filter((_, i) => i !== idx))}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          style={{ marginTop: '0.5rem' }}
          onClick={() => updateTarifas([...(linha.tarifas ?? []), { origem_id: paradas[0]?.id ?? 0, destino_id: paradas[1]?.id ?? 0, valor: 0 }])}
        >
          <Plus size={14} style={{ marginRight: 4 }} /> Adicionar tarifa
        </button>
      </div>
    </>
  );
}
