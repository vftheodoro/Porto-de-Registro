import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import type { Metadata } from 'next';
import { RODOVIARIAS_VALE_RIBEIRA } from '@/lib/rodoviarias-data';
import { MapPin, Phone, Clock3, ShieldCheck, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rodoviarias do Vale do Ribeira | Porto de Registro',
  description:
    'Consulte endereco, telefone e orientacoes das rodoviarias atendidas pela Porto de Registro.',
};

export const revalidate = 60;

const confiancaLabel = {
  alto: 'Dados com boa confianca',
  medio: 'Dados com confianca moderada',
  baixo: 'Dados pendentes de confirmacao',
} as const;

export default function RodoviariasPage() {
  return (
    <>
      <Header />

      <section className="section rodoviarias-page">
        <div className="container">
          <div className="section__header">
            <h1 className="section__title">Rodoviarias do Vale do Ribeira</h1>
            <p className="section__subtitle">
              Base de consulta para o passageiro: endereco, contato e orientacoes uteis.
              Clique em cada cidade para ver os detalhes e fontes.
            </p>
          </div>

          <div className="rodoviarias-grid">
            {RODOVIARIAS_VALE_RIBEIRA.map((rod) => (
              <details key={rod.cidade} className="rod-card">
                <summary className="rod-card__summary">
                  <div>
                    <h2 className="rod-card__title">{rod.nome}</h2>
                    <p className="rod-card__city">{rod.cidade} - SP</p>
                  </div>
                  <span className={`rod-card__badge rod-card__badge--${rod.nivel_confianca}`}>
                    {confiancaLabel[rod.nivel_confianca]}
                  </span>
                </summary>

                <div className="rod-card__body">
                  <div className="rod-card__line">
                    <MapPin size={16} />
                    <span>{rod.endereco}</span>
                  </div>
                  <div className="rod-card__line">
                    <Phone size={16} />
                    <span>{rod.telefone}</span>
                  </div>
                  <div className="rod-card__line">
                    <Clock3 size={16} />
                    <span>{rod.funcionamento}</span>
                  </div>
                  <div className="rod-card__line">
                    <ShieldCheck size={16} />
                    <span>{rod.observacoes}</span>
                  </div>

                  <div className="rod-card__sources">
                    <h3>Fontes consultadas</h3>
                    <ul>
                      {rod.fontes.map((f) => (
                        <li key={f.url}>
                          <a href={f.url} target="_blank" rel="noopener noreferrer">
                            {f.label} <ExternalLink size={14} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
