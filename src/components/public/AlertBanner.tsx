'use client';

import { useState } from 'react';
import type { Aviso } from '@/types';
import { AlertTriangle, Info, Calendar } from 'lucide-react';

interface AlertBannerProps {
  avisos: Aviso[];
}

export default function AlertBanner({ avisos }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<number[]>([]);

  const avisosVisiveis = avisos.filter((a) => !dismissed.includes(a.id));

  if (avisosVisiveis.length === 0) return null;

  const icons: Record<string, React.ReactNode> = {
    URGENTE: <AlertTriangle size={18} />,
    INFORMATIVO: <Info size={18} />,
    FERIADO: <Calendar size={18} />,
  };

  return (
    <div>
      {avisosVisiveis.map((aviso) => (
        <div
          key={aviso.id}
          className={`alert-banner alert-banner--${aviso.tipo.toLowerCase()}`}
          role="alert"
        >
          <span className="alert-banner__icon">{icons[aviso.tipo]}</span>
          <div className="alert-banner__content">
            <span className="alert-banner__title">{aviso.titulo}</span>
            {' — '}
            {aviso.conteudo}
          </div>
          <button
            className="alert-banner__dismiss"
            onClick={() => setDismissed([...dismissed, aviso.id])}
            aria-label="Fechar aviso"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
