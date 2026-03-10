import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import ScheduleSearch from '@/components/public/ScheduleSearch';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Buscar Horários | Porto de Registro',
  description: 'Pesquise horários de ônibus, rotas e tarifas entre as cidades do Vale do Ribeira.',
};

export default function HorariosPage() {
  return (
    <>
      <Header />

      <section className="horarios-hero">
        <div className="container">
          <div className="horarios-hero__header">
            <h1 className="horarios-hero__title">Busca Inteligente de Horarios</h1>
            <p className="horarios-hero__subtitle">
              O sistema sugere apenas destinos realmente alcancaveis e, quando nao houver linha direta,
              monta opcoes com conexao respeitando os horarios do dia.
            </p>
            <div className="horarios-hero__badges">
              <span className="badge badge--dourado">Direto + Conexao</span>
              <span className="badge badge--verde">Filtro por dia</span>
              <span className="badge badge--cinza">Resultados por horario real</span>
            </div>
            <div className="horarios-hero__actions">
              <Link href="/rodoviarias" className="btn btn--secondary btn--sm">
                Ver rodoviarias e contatos
              </Link>
            </div>
          </div>

          <div className="horarios-search-shell">
            <ScheduleSearch />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
