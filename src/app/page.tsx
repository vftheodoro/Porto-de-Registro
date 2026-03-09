import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import AlertBanner from '@/components/public/AlertBanner';
import ScheduleSearch from '@/components/public/ScheduleSearch';
import { getDb } from '@/lib/db';
import type { Aviso, LinhaCompleta } from '@/types';
import Link from 'next/link';
import { MapPin, Map, CalendarDays, Clock } from 'lucide-react';

export const revalidate = 60;

async function getAvisos(): Promise<Aviso[]> {
  const db = getDb();
  return db.avisos
     .filter(a => a.ativo)
     .sort((a, b) => {
         const pesos: Record<string, number> = { 'URGENTE': 1, 'FERIADO': 2, 'INFORMATIVO': 3 };
         return (pesos[a.tipo] || 99) - (pesos[b.tipo] || 99);
     });
}

async function getLinhasPopulares(): Promise<LinhaCompleta[]> {
  const db = getDb();
  const ativas = db.linhas.filter(l => l.ativa).slice(0, 6); // Pegar top 6 ativas

  return ativas.map(linha => {
     const cidades = new Set<string>();
     linha.paradas.forEach(lp => {
       const p = db.paradas.find(pd => pd.id === lp.parada_id);
       if (p) cidades.add(p.cidade);
     });

     return {
         ...linha,
         cidades: Array.from(cidades).join(', '),
         qtd_util: linha.horarios.filter(h => h.tipo === 'UTIL').length,
         qtd_sabado: linha.horarios.filter(h => h.tipo === 'SABADO').length,
         qtd_domingo: linha.horarios.filter(h => h.tipo === 'DOMINGO').length,
         paradas: [], // não necessário no card
         tarifas: [], // não necessário no card
     };
  });
}

export default async function HomePage() {
  const avisos = await getAvisos();
  const linhasPopulares = await getLinhasPopulares();

  return (
    <>
      <AlertBanner avisos={avisos} />
      <Header />

      {/* Hero + Schedule Search */}
      <section className="hero">
        <div className="container">
          <h1 className="hero__title">Consulte os Horários de Ônibus</h1>
          <p className="hero__subtitle">
            Encontre os horários, rotas e tarifas para viajar pelo Vale do Ribeira
          </p>
          <ScheduleSearch />
        </div>
      </section>

      {/* Popular Routes */}
      <section className="routes-section">
        <div className="container">
          <h2 className="routes-section__title">Nossas Linhas</h2>
          <p className="routes-section__subtitle">
            Conheça as rotas que conectam as cidades do Vale do Ribeira
          </p>

          <div className="routes-grid">
            {linhasPopulares.map((linha) => (
              <Link
                key={linha.id}
                href={`/linhas/${linha.slug}`}
                className="route-card"
              >
                <div className="route-card__code">{linha.codigo}</div>
                <div className="route-card__name">{linha.nome}</div>
                <div className="route-card__cities" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={16} /> {linha.cidades.split(', ').join(' → ')}
                </div>
                <div className="route-card__badges">
                  <span className="badge badge--verde">Dias úteis</span>
                  {linha.qtd_sabado > 0 && <span className="badge badge--dourado">Sáb</span>}
                  {linha.qtd_domingo > 0 && <span className="badge badge--cinza">Dom/Fer</span>}
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/linhas" className="btn btn--secondary">
              Ver todas as linhas →
            </Link>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="section section--alt">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Como usar o site</h2>
            <p className="section__subtitle">É simples e rápido</p>
          </div>

          <div className="routes-grid" style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="card" style={{ textAlign: 'center', cursor: 'default' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Map size={48} color="var(--cinza-400)" /></div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--verde-700)' }}>
                Escolha a origem e destino
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--cinza-600)' }}>
                Selecione de onde você sai e para onde quer ir nos campos acima
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center', cursor: 'default' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><CalendarDays size={48} color="var(--cinza-400)" /></div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--verde-700)' }}>
                Selecione o dia
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--cinza-600)' }}>
                Escolha se é dia útil, sábado, domingo ou feriado
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center', cursor: 'default' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Clock size={48} color="var(--cinza-400)" /></div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--verde-700)' }}>
                Veja os horários
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--cinza-600)' }}>
                Confira todos os horários disponíveis com tempo e tarifa
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
