import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import ScheduleSearch from '@/components/public/ScheduleSearch';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buscar Horários | Porto de Registro',
  description: 'Pesquise horários de ônibus, rotas e tarifas entre as cidades do Vale do Ribeira.',
};

export default function HorariosPage() {
  return (
    <>
      <Header />

      <section className="section" style={{ minHeight: 'calc(100vh - 400px)' }}>
        <div className="container">
          <div className="section__header">
            <h1 className="section__title">Busca de Horários</h1>
            <p className="section__subtitle">
              Siga os passos abaixo para encontrar o ônibus ideal para sua viagem
            </p>
          </div>

          <div style={{ maxWidth: 900, margin: '0 auto', background: 'var(--cinza-50)', padding: '2rem', borderRadius: 'var(--raio-lg)', border: '1px solid var(--cinza-200)' }}>
            <ScheduleSearch />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
