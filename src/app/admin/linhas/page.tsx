'use client';

import { useState, useEffect } from 'react';
import type { Database } from '@/types';
import Link from 'next/link';
import { Pencil, AlertCircle } from 'lucide-react';
import DownloadJsonButton from '@/components/admin/DownloadJsonButton';

export default function AdminLinhasPage() {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

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

  if (loading) return <p>Carregando…</p>;
  if (!db) return <p>Não foi possível carregar os dados.</p>;

  const linhas = db.linhas ?? [];

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-header__title">Linhas</h1>
        <div className="admin-header__actions">
          <DownloadJsonButton />
        </div>
      </div>

      {message && (
        <div className="admin-login__error" style={message.type === 'ok' ? { background: 'var(--verde-50)', color: 'var(--verde-800)' } : undefined} role="alert">
          <AlertCircle size={16} />
          {message.text}
        </div>
      )}

      <p style={{ color: 'var(--cinza-600)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        Clique em Editar para alterar paradas, horários e tarifas da linha. Depois use &quot;Salvar alterações&quot; na página de edição ou baixe o data.json e faça commit.
      </p>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Ativa</th>
              <th>Paradas</th>
              <th>Horários</th>
              <th style={{ width: 100 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.id}>
                <td><strong>{l.codigo}</strong></td>
                <td>{l.nome}</td>
                <td>{l.ativa ? 'Sim' : 'Não'}</td>
                <td>{l.paradas?.length ?? 0}</td>
                <td>{l.horarios?.length ?? 0}</td>
                <td>
                  <Link href={`/admin/linhas/${l.id}`} className="btn btn--secondary btn--sm">
                    <Pencil size={14} style={{ marginRight: 4 }} />
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {linhas.length === 0 && (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--cinza-500)' }}>Nenhuma linha cadastrada.</p>
        )}
      </div>
    </>
  );
}
