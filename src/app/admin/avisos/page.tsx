'use client';

import { useState, useEffect } from 'react';
import type { Database, Aviso, TipoAviso } from '@/types';
import { Megaphone, Plus, Pencil, Trash2, Save, AlertCircle } from 'lucide-react';

export default function AdminAvisosPage() {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<Partial<Aviso>>({ titulo: '', conteudo: '', tipo: 'INFORMATIVO', ativo: true });

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

  function openEdit(aviso?: Aviso) {
    if (aviso) {
      setEditingId(aviso.id);
      setForm(aviso);
    } else {
      setEditingId('new');
      const nextId = Math.max(0, ...(db?.avisos?.map((a) => a.id) ?? [])) + 1;
      setForm({ id: nextId, titulo: '', conteudo: '', tipo: 'INFORMATIVO', ativo: true });
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ titulo: '', conteudo: '', tipo: 'INFORMATIVO', ativo: true });
  }

  function handleSaveEdit() {
    if (!db) return;
    const avisos = [...(db.avisos ?? [])];
    if (editingId === 'new' && form.id != null) {
      avisos.push(form as Aviso);
    } else if (typeof editingId === 'number') {
      const i = avisos.findIndex((a) => a.id === editingId);
      if (i >= 0) avisos[i] = { ...avisos[i], ...form } as Aviso;
    }
    setDb({ ...db, avisos });
    setEditingId(null);
    setForm({ titulo: '', conteudo: '', tipo: 'INFORMATIVO', ativo: true });
  }

  function handleDelete(id: number) {
    if (!db || !confirm('Excluir este aviso?')) return;
    setDb({ ...db, avisos: db.avisos.filter((a) => a.id !== id) });
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

  const tipos: { value: TipoAviso; label: string }[] = [
    { value: 'URGENTE', label: 'Urgente' },
    { value: 'INFORMATIVO', label: 'Informativo' },
    { value: 'FERIADO', label: 'Feriado' },
  ];

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-header__title">Avisos</h1>
        <div className="admin-header__actions">
          <button type="button" className="btn btn--primary" onClick={() => openEdit()}>
            <Plus size={18} style={{ marginRight: 6 }} />
            Novo aviso
          </button>
          <button type="button" className="btn btn--primary" onClick={handleSaveAll} disabled={saving}>
            <Save size={18} style={{ marginRight: 6 }} />
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </div>

      {message && (
        <div className={message.type === 'ok' ? 'admin-login__error' : 'admin-login__error'} style={message.type === 'ok' ? { background: 'var(--verde-50)', color: 'var(--verde-800)' } : undefined} role="alert">
          <AlertCircle size={16} />
          {message.text}
        </div>
      )}

      {(editingId === 'new' || typeof editingId === 'number') && (
        <div className="admin-form" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>{editingId === 'new' ? 'Novo aviso' : 'Editar aviso'}</h2>
          <div className="admin-form__grid">
            <div className="admin-form__full">
              <label>Título</label>
              <input
                type="text"
                value={form.titulo ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                placeholder="Título do aviso"
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              />
            </div>
            <div className="admin-form__full">
              <label>Conteúdo</label>
              <textarea
                value={form.conteudo ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, conteudo: e.target.value }))}
                placeholder="Texto do aviso"
                rows={3}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', resize: 'vertical' }}
              />
            </div>
            <div>
              <label>Tipo</label>
              <select
                value={form.tipo ?? 'INFORMATIVO'}
                onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoAviso }))}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              >
                {tipos.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
              <input
                type="checkbox"
                id="aviso-ativo"
                checked={form.ativo ?? true}
                onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
              />
              <label htmlFor="aviso-ativo">Ativo (exibir no site)</label>
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
              <th>Título</th>
              <th>Tipo</th>
              <th>Ativo</th>
              <th style={{ width: 120 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {(db.avisos ?? []).map((a) => (
              <tr key={a.id}>
                <td>{a.titulo}</td>
                <td>{a.tipo}</td>
                <td>{a.ativo ? 'Sim' : 'Não'}</td>
                <td>
                  <div className="data-table__actions">
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => openEdit(a)} title="Editar">
                      <Pencil size={14} />
                    </button>
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => handleDelete(a.id)} title="Excluir">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!db.avisos || db.avisos.length === 0) && (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--cinza-500)' }}>Nenhum aviso cadastrado.</p>
        )}
      </div>
    </>
  );
}
