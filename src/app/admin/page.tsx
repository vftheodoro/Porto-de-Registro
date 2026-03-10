import Link from 'next/link';
import { getDb } from '@/lib/db';
import { Megaphone, MapPin, Bus } from 'lucide-react';
import DownloadJsonButton from '@/components/admin/DownloadJsonButton';

export default async function AdminDashboardPage() {
  const db = getDb();
  const avisosAtivos = db.avisos.filter((a) => a.ativo).length;
  const linhasAtivas = db.linhas.filter((l) => l.ativa).length;

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-header__title">Dashboard</h1>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--verde-600)' }}>
            <Megaphone size={28} />
          </div>
          <div className="stat-card__value">{db.avisos.length}</div>
          <div className="stat-card__label">Avisos ({avisosAtivos} ativos)</div>
          <Link href="/admin/avisos" className="btn btn--secondary btn--sm" style={{ marginTop: '0.5rem' }}>
            Gerenciar
          </Link>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--verde-600)' }}>
            <MapPin size={28} />
          </div>
          <div className="stat-card__value">{db.paradas.length}</div>
          <div className="stat-card__label">Paradas</div>
          <Link href="/admin/paradas" className="btn btn--secondary btn--sm" style={{ marginTop: '0.5rem' }}>
            Gerenciar
          </Link>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--verde-600)' }}>
            <Bus size={28} />
          </div>
          <div className="stat-card__value">{linhasAtivas}</div>
          <div className="stat-card__label">Linhas ativas ({db.linhas.length} total)</div>
          <Link href="/admin/linhas" className="btn btn--secondary btn--sm" style={{ marginTop: '0.5rem' }}>
            Gerenciar
          </Link>
        </div>
      </div>
      <div className="admin-form" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Dados (data.json)</h2>
        <p style={{ color: 'var(--cinza-600)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Em desenvolvimento as alterações são salvas direto no arquivo. Em produção (Vercel), use o botão abaixo para baixar o JSON atualizado e faça commit no GitHub.
        </p>
        <DownloadJsonButton />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
          <Link href="/" className="btn btn--secondary btn--sm">Ver site publico</Link>
          <Link href="/horarios" className="btn btn--secondary btn--sm">Validar busca de horarios</Link>
          <Link href="/rodoviarias" className="btn btn--secondary btn--sm">Validar links de rodoviarias</Link>
        </div>
      </div>
    </>
  );
}
