'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import Image from 'next/image';

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'Início' },
    { href: '/horarios', label: 'Horários' },
    { href: '/rodoviarias', label: 'Rodoviárias' },
    { href: '/atendimento', label: 'Atendimento' },
    { href: '/linhas', label: 'Linhas' },
    { href: '/tarifas', label: 'Tarifas' },
    { href: '/sobre', label: 'Sobre' },
  ];

  return (
    <header className="header">
      <div className="header__inner">
        <Link href="/" className="header__logo" style={{ display: 'flex', alignItems: 'center' }}>
          <Image 
            src="/images/logos/logo_escrita_branca_pr.png" 
            alt="Porto de Registro" 
            width={140} 
            height={60} 
            style={{ objectFit: 'contain' }} 
            priority
          />
        </Link>

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`header__nav-link ${
                pathname === link.href ? 'header__nav-link--active' : ''
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          className="header__menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
