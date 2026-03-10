'use client';

import { useState, useEffect } from 'react';
import type { Database, Parada } from '@/types';
import { MapPin, Plus, Pencil, Trash2, Save, AlertCircle } from 'lucide-react';

export default function AdminParadasPage() {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<Partial<Parada>>({ nome: '', cidade: '' });

  useEffect(() => {
    fetch('/api/admin/data', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setDb(data);
      })
      .catch(() => setMessage({ type: 'err', text: 'Erro ao carregar dados' }))
      .finally(() => setLoading(false));
  }, []);

  function openEdit(parada?: Parada) {
    if (parada) {
      setEditingId(parada.id);
      setForm(parada);
    } else {
      setEditingId('new');
      const nextId = Math.max(0, ...(db?.paradas?.map((p) => p.id) ?? [])) + 1;
      setForm({ id: nextId, nome: '', cidade: '' });
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ nome: '', cidade: '' });
  }

  function handleSaveEdit() {
    if (!db) return;
    const paradas = [...(db.paradas ?? [])];
    if (editingId === 'new' && form.id != null) {
      paradas.push(form as Parada);
    } else if (typeof editingId === 'number') {
      const i = paradas.findIndex((p) => p.id === editingId);
      if (i >= 0) paradas[i] = { ...paradas[i], ...form } as Parada;
    }
    setDb({ ...db, paradas });
    setEditingId(null);
    setForm({ nome: '', cidade: '' });
  }

  function handleDelete(id: number) {
    if (!db || !confirm('Excluir esta parada? Pode quebrar referências em linhas e tarifas.')) return;
    setDb({ ...db, paradas: db.paradas.filter((p) => p.id !== id) });
  }

  async function handleSaveAll() {
    if (!db) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(db),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar');
      setMessage({ type: 'ok', text: data.saved ? 'Dados salvos em data.json.' : data.message || 'Salvo (baixe o JSON e faça commit em produção).' });
    } catch (e) {
      setMessage({ type: 'err', text: e instanceof Error ? e.message : 'Erro ao salvar' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Carregando…</p>;
  if (!db) return <p>Não foi possível carregar os dados.</p>;

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-header__title">Paradas</h1>
        <div className="admin-header__actions">
          <button type="button" className="btn btn--primary" onClick={() => openEdit()}>
            <Plus size={18} style={{ marginRight: 6 }} />
            Nova parada
          </button>
          <button type="button" className="btn btn--primary" onClick={handleSaveAll} disabled={saving}>
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

      {(editingId === 'new' || typeof editingId === 'number') && (
        <div className="admin-form" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>{editingId === 'new' ? 'Nova parada' : 'Editar parada'}</h2>
          <div className="admin-form__grid">
            <div>
              <label>Nome</label>
              <input
                type="text"
                value={form.nome ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Terminal Rodoviário"
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              />
            </div>
            <div>
              <label>Cidade</label>
              <input
                type="text"
                value={form.cidade ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
                placeholder="Ex: Registro"
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              />
            </div>
          </div>
          <div className="admin-form__actions">
            <button type="button" className="btn btn--secondary" onClick={cancelEdit}>Cancelar</button>
            <button type="button" className="btn btn--primary" onClick={handleSaveEdit}>Aplicar</button>
          </div>
        </div>
      )}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Cidade</th>
              <th style={{ width: 120 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {(db.paradas ?? []).map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nome}</td>
                <td>{p.cidade}</td>
                <td>
                  <div className="data-table__actions">
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => openEdit(p)} title="Editar">
                      <Pencil size={14} />
                    </button>
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => handleDelete(p.id)} title="Excluir">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!db.paradas || db.paradas.length === 0) && (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--cinza-500)' }}>Nenhuma parada cadastrada.</p>
        )}
      </div>
    </>
  );
}
