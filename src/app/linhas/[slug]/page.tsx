import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { getDb } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { LinhaParadaComDetalhes, TarifaComDetalhes } from '@/types';
import type { Metadata } from 'next';
import LinhaDetailClient from './LinhaDetailClient';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const db = getDb();
  const linha = db.linhas.find(l => l.slug === slug && l.ativa);

  if (!linha) return { title: 'Linha não encontrada | Porto de Registro' };

  return {
    title: `${linha.nome} — Horários e Tarifas | Porto de Registro`,
    description: `Consulte horários, paradas e tarifas da linha ${linha.codigo} ${linha.nome} operada pela Porto de Registro no Vale do Ribeira.`,
  };
}

// Generate static params so the dynamic pages are generated at build time
export async function generateStaticParams() {
  const db = getDb();
  return db.linhas.filter(l => l.ativa).map((linha) => ({
    slug: linha.slug,
  }));
}

export default async function LinhaDetailPage({ params }: Props) {
  const { slug } = await params;
  const db = getDb();

  const linhaOrig = db.linhas.find(l => l.slug === slug && l.ativa);
  if (!linhaOrig) notFound();

  // Populate data using lookups
  const paradas: LinhaParadaComDetalhes[] = linhaOrig.paradas.map(lp => {
     const pBase = db.paradas.find(p => p.id === lp.parada_id);
     return {
        ...lp,
        parada_nome: pBase?.nome || 'Desconhecida',
        parada_cidade: pBase?.cidade || 'Local não mapeado'
     };
  }).sort((a, b) => a.ordem - b.ordem);

  const horarios = [...linhaOrig.horarios].sort((a, b) => a.hora_saida.localeCompare(b.hora_saida));

  const tarifas: TarifaComDetalhes[] = linhaOrig.tarifas.map(t => {
      const oBase = db.paradas.find(p => p.id === t.origem_id);
      const dBase = db.paradas.find(p => p.id === t.destino_id);
      return {
         ...t,
         origem_nome: oBase ? `${oBase.nome} (${oBase.cidade})` : 'Origem',
         destino_nome: dBase ? `${dBase.nome} (${dBase.cidade})` : 'Destino'
      };
  }).sort((a, b) => a.valor - b.valor);

  return (
    <>
      <Header />

      <section style={{ background: 'linear-gradient(135deg, var(--verde-800), var(--verde-700))', padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <span className="badge badge--dourado" style={{ fontSize: '0.9rem', padding: '0.3rem 1rem' }}>
              {linhaOrig.codigo}
            </span>
          </div>
          <h1 style={{ color: 'var(--branco)', fontSize: 'var(--texto-3xl)', fontFamily: 'var(--fonte-titulo)', marginBottom: '0.5rem' }}>
            {linhaOrig.nome}
          </h1>
          {linhaOrig.descricao && (
            <p style={{ color: 'var(--dourado-300)', fontSize: 'var(--texto-lg)' }}>
              {linhaOrig.descricao}
            </p>
          )}
        </div>
      </section>

      <LinhaDetailClient
        linha={linhaOrig}
        paradas={paradas}
        horarios={horarios}
        tarifas={tarifas}
      />

      <Footer />
    </>
  );
}
