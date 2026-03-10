'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Megaphone, MapPin, Bus, LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/admin/login';

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-sidebar__brand">
          <span className="admin-sidebar__brand-icon">PR</span>
          <span className="admin-sidebar__brand-text">Admin</span>
        </Link>
        <nav>
          <div className="admin-sidebar__section">Dados do site</div>
          <Link
            href="/admin"
            className={`admin-sidebar__link ${pathname === '/admin' ? 'admin-sidebar__link--active' : ''}`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link
            href="/admin/avisos"
            className={`admin-sidebar__link ${pathname.startsWith('/admin/avisos') ? 'admin-sidebar__link--active' : ''}`}
          >
            <Megaphone size={18} />
            Avisos
          </Link>
          <Link
            href="/admin/paradas"
            className={`admin-sidebar__link ${pathname.startsWith('/admin/paradas') ? 'admin-sidebar__link--active' : ''}`}
          >
            <MapPin size={18} />
            Paradas
          </Link>
          <Link
            href="/admin/linhas"
            className={`admin-sidebar__link ${pathname.startsWith('/admin/linhas') ? 'admin-sidebar__link--active' : ''}`}
          >
            <Bus size={18} />
            Linhas
          </Link>
        </nav>
        <div style={{ marginTop: 'auto', padding: '1rem 1.5rem' }}>
          <button
            type="button"
            onClick={handleLogout}
            className="admin-sidebar__link"
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}
