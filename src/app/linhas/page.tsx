import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import AlertBanner from '@/components/public/AlertBanner';
import { getDb } from '@/lib/db';
import { classificarAvisosPublicos } from '@/lib/avisos-publicos';
import type { LinhaCompleta } from '@/types';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Linhas de Ônibus | Porto de Registro',
  description: 'Todas as linhas de ônibus operadas pela Porto de Registro no Vale do Ribeira.',
};

export const revalidate = 60;

export default async function LinhasPage() {
  const db = getDb();
  const { notificacoes } = classificarAvisosPublicos(db.avisos);

  const linhas = db.linhas.filter(l => l.ativa).map(linha => {
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
         paradas: [], // não necessário na listagem
         tarifas: [], // não necessário na listagem
     } as LinhaCompleta;
  }).sort((a, b) => a.codigo.localeCompare(b.codigo));

  return (
    <>
      <AlertBanner avisos={notificacoes} />
      <Header />

      <section className="section">
        <div className="container">
          <div className="section__header">
            <h1 className="section__title">Todas as Linhas</h1>
            <p className="section__subtitle">
              {linhas.length} linhas atendendo o Vale do Ribeira
            </p>
          </div>

          <div className="routes-grid">
            {linhas.map((linha) => (
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
                {linha.descricao && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--cinza-600)', marginBottom: '1rem' }}>
                    {linha.descricao}
                  </p>
                )}
                <div className="route-card__badges">
                  <span className="badge badge--verde">{linha.qtd_util} horários</span>
                  {linha.qtd_sabado > 0 && (
                    <span className="badge badge--dourado">Sábado</span>
                  )}
                  {linha.qtd_domingo > 0 && (
                    <span className="badge badge--cinza">Dom/Fer</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
