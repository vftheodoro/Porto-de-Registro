import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import AlertBanner from '@/components/public/AlertBanner';
import { getDb } from '@/lib/db';
import { classificarAvisosPublicos } from '@/lib/avisos-publicos';
import type { LinhaCompleta } from '@/types';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MapPin, BusFront, CalendarDays, Route } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Linhas de Ônibus | Porto de Registro',
  description: 'Todas as linhas de ônibus operadas pela Porto de Registro no Vale do Ribeira.',
};

export const revalidate = 60;

export default async function LinhasPage() {
  const db = getDb();
  const { notificacoes } = classificarAvisosPublicos(db.avisos);
  const cidadesUnicas = new Set(db.paradas.map((p) => p.cidade)).size;

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

  const totalSaidas = linhas.reduce(
    (acc, linha) => acc + linha.qtd_util + linha.qtd_sabado + linha.qtd_domingo,
    0
  );

  return (
    <>
      <AlertBanner avisos={notificacoes} />
      <Header />

      <section className="section linhas-page">
        <div className="container">
          <div className="section__header">
            <h1 className="section__title">Todas as Linhas</h1>
            <p className="section__subtitle">
              Consulta clara e equilibrada das rotas ativas no Vale do Ribeira
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              <Link href="/rodoviarias" className="btn btn--secondary btn--sm">
                Consultar rodoviarias e contatos
              </Link>
            </p>
          </div>

          <div className="linhas-overview" role="list" aria-label="Resumo operacional">
            <article className="linhas-overview__item" role="listitem">
              <div className="linhas-overview__icon"><BusFront size={18} /></div>
              <div>
                <p className="linhas-overview__label">Linhas ativas</p>
                <strong className="linhas-overview__value">{linhas.length}</strong>
              </div>
            </article>
            <article className="linhas-overview__item" role="listitem">
              <div className="linhas-overview__icon"><Route size={18} /></div>
              <div>
                <p className="linhas-overview__label">Cidades atendidas</p>
                <strong className="linhas-overview__value">{cidadesUnicas}</strong>
              </div>
            </article>
            <article className="linhas-overview__item" role="listitem">
              <div className="linhas-overview__icon"><CalendarDays size={18} /></div>
              <div>
                <p className="linhas-overview__label">Saídas cadastradas</p>
                <strong className="linhas-overview__value">{totalSaidas}</strong>
              </div>
            </article>
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
                <div className="route-card__cities route-card__cities--icon">
                  <MapPin size={16} /> {linha.cidades.split(', ').join(' → ')}
                </div>
                {linha.descricao && (
                  <p className="route-card__description">
                    {linha.descricao}
                  </p>
                )}
                <div className="route-card__badges">
                  <span className="badge badge--verde">Util: {linha.qtd_util}</span>
                  <span className="badge badge--dourado">Sab: {linha.qtd_sabado}</span>
                  <span className="badge badge--cinza">Dom/Fer: {linha.qtd_domingo}</span>
                </div>
                <span className="route-card__cta">Ver detalhes da linha →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
