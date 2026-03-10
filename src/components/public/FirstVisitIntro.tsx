'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { withBasePath } from '@/lib/asset-path';

const INTRO_STORAGE_KEY = 'porto_intro_seen_v1';
const INTRO_DURATION_MS = 2600;

export default function FirstVisitIntro() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    try {
      const hasSeenIntro = window.localStorage.getItem(INTRO_STORAGE_KEY) === '1';
      if (hasSeenIntro) return;

      window.localStorage.setItem(INTRO_STORAGE_KEY, '1');
      setIsVisible(true);

      timer = setTimeout(() => {
        setIsVisible(false);
      }, INTRO_DURATION_MS);
    } catch {
      // If storage is unavailable, still show once for the current load.
      setIsVisible(true);
      timer = setTimeout(() => {
        setIsVisible(false);
      }, INTRO_DURATION_MS);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="intro-splash" aria-hidden="true">
      <div className="intro-splash__logo-wrap">
        <Image
          src={withBasePath('/images/logos/logo_porto_branca.png')}
          alt="Porto de Registro"
          width={320}
          height={130}
          className="intro-splash__logo"
          priority
        />
      </div>
      <p className="intro-splash__credit">Desenvolvido por Victor Theodoro.</p>
    </div>
  );
}
