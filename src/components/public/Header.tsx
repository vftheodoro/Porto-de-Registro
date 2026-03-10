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
    { href: '/atendimento', label: 'Atendimento' },
    { href: '/linhas', label: 'Linhas' },
    { href: '/tarifas', label: 'Tarifas' },
    { href: '/sobre', label: 'Sobre' },
  ].filter((link) => link.href !== '/rodoviarias');

  return (
    <header className="header">
      <div className="header__inner">
        <Link href="/" className="header__logo" aria-label="Porto de Registro - Página inicial">
          <Image
            src="/images/logos/logo_porto_branca.png"
            alt="Símbolo Porto de Registro"
            width={42}
            height={42}
            className="header__logo-mark"
            priority
          />
            <Image
              src="/images/logos/logo_escrita_branca_pr.png"
              alt="Porto de Registro"
              width={86}
              height={22}
              className="header__logo-wordmark"
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
