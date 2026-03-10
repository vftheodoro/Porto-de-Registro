'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, AlertCircle } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Erro ao entrar');
        return;
      }
      router.push(from);
      router.refresh();
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__header">
          <Lock size={32} />
          <h1>Acesso restrito</h1>
          <p>Área administrativa. Apenas pessoal autorizado.</p>
        </div>
        <form onSubmit={handleSubmit} className="admin-login__form">
          <label htmlFor="admin-password">Senha</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha de administrador"
            required
            autoFocus
            autoComplete="current-password"
          />
          {error && (
            <div className="admin-login__error" role="alert">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn btn--primary btn--full">
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <p className="admin-login__back">
          <Link href="/">← Voltar ao site</Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="admin-login"><div className="admin-login__card"><p>Carregando…</p></div></div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
