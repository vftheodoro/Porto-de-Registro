import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import type { Metadata } from 'next';
import { RODOVIARIAS_VALE_RIBEIRA } from '@/lib/rodoviarias-data';
import { MapPin, Phone, ExternalLink, Navigation } from 'lucide-react';
import Image from 'next/image';
import { getBrasaoMunicipio } from '@/lib/municipios';

export const metadata: Metadata = {
  title: 'Rodoviarias do Vale do Ribeira | Porto de Registro',
  description:
    'Consulte rodoviarias por cidade e abra a localizacao direto no Google Maps.',
};

export const revalidate = 60;

export default function RodoviariasPage() {
  return (
    <>
      <Header />

      <section className="section rodoviarias-page">
        <div className="container">
          <div className="rodoviarias-hero">
            <h1 className="section__title">Rodoviarias do Vale do Ribeira</h1>
            <p className="section__subtitle">
              Escolha o municipio e abra a localizacao da rodoviaria direto no Google Maps.
            </p>
          </div>

          <div className="rodoviarias-grid">
            {RODOVIARIAS_VALE_RIBEIRA.map((rod) => (
              <article key={rod.cidade} className="rod-card">
                <div className="rod-card__header">
                  {getBrasaoMunicipio(rod.cidade) ? (
                    <Image
                      src={getBrasaoMunicipio(rod.cidade) as string}
                      alt={`Brasao de ${rod.cidade}`}
                      width={52}
                      height={52}
                      className="rod-card__brasao"
                    />
                  ) : (
                    <div className="rod-card__brasao-placeholder">
                      {rod.cidade.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="rod-card__title">{rod.cidade}</h2>
                    <p className="rod-card__city">{rod.nome}</p>
                  </div>
                </div>

                <div className="rod-card__body">
                  <div className="rod-card__line">
                    <MapPin size={16} />
                    <span>{rod.endereco}</span>
                  </div>
                  <div className="rod-card__line">
                    <Phone size={16} />
                    <span>{rod.telefone}</span>
                  </div>

                  <div className="rod-card__actions">
                    <a href={rod.maps_url} target="_blank" rel="noopener noreferrer" className="rod-card__map-btn">
                      <Navigation size={15} />
                      Ver localizacao no Google Maps
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
