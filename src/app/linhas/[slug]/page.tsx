import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { getDb } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Linha, LinhaParadaComDetalhes, TarifaComDetalhes } from '@/types';
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
    description: `Consulte horários, paradas e tarifas da rota ${linha.nome} operada pela Porto de Registro no Vale do Ribeira.`,
  };
}

// Generate static params so the dynamic pages are generated at build time
export async function generateStaticParams() {
  const db = getDb();
  return db.linhas.filter(l => l.ativa).map((linha) => ({
    slug: linha.slug,
  }));
}

function getParadasOrdenadas(linha: Linha) {
  return [...linha.paradas].sort((a, b) => a.ordem - b.ordem);
}

function findLinhaVolta(db: ReturnType<typeof getDb>, linha: Linha): Linha | null {
  const paradasLinha = getParadasOrdenadas(linha);
  if (paradasLinha.length < 2) return null;

  const origemIda = paradasLinha[0].parada_id;
  const destinoIda = paradasLinha[paradasLinha.length - 1].parada_id;

  const candidata = db.linhas.find((l) => {
    if (!l.ativa || l.id === linha.id) return false;
    const ps = getParadasOrdenadas(l);
    if (ps.length < 2) return false;
    const origemVolta = ps[0].parada_id;
    const destinoVolta = ps[ps.length - 1].parada_id;
    return origemVolta === destinoIda && destinoVolta === origemIda;
  });

  return candidata || null;
}

export default async function LinhaDetailPage({ params }: Props) {
  const { slug } = await params;
  const db = getDb();

  const linhaOrig = db.linhas.find(l => l.slug === slug && l.ativa);
  if (!linhaOrig) notFound();
  const linhaVolta = findLinhaVolta(db, linhaOrig);

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

  const paradasVolta: LinhaParadaComDetalhes[] = linhaVolta
    ? linhaVolta.paradas
        .map((lp) => {
          const pBase = db.paradas.find((p) => p.id === lp.parada_id);
          return {
            ...lp,
            parada_nome: pBase?.nome || 'Desconhecida',
            parada_cidade: pBase?.cidade || 'Local não mapeado',
          };
        })
        .sort((a, b) => a.ordem - b.ordem)
    : [];

  const horariosVolta = linhaVolta
    ? [...linhaVolta.horarios].sort((a, b) => a.hora_saida.localeCompare(b.hora_saida))
    : [];

  const tarifasVolta: TarifaComDetalhes[] = linhaVolta
    ? linhaVolta.tarifas
        .map((t) => {
          const oBase = db.paradas.find((p) => p.id === t.origem_id);
          const dBase = db.paradas.find((p) => p.id === t.destino_id);
          return {
            ...t,
            origem_nome: oBase ? `${oBase.nome} (${oBase.cidade})` : 'Origem',
            destino_nome: dBase ? `${dBase.nome} (${dBase.cidade})` : 'Destino',
          };
        })
        .sort((a, b) => a.valor - b.valor)
    : [];

  return (
    <>
      <Header />

      <section className="linha-hero">
        <div className="container">
          <h1 className="linha-hero__title">
            {linhaOrig.nome}
          </h1>
          {linhaOrig.descricao && (
            <p className="linha-hero__subtitle">
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
        linhaVolta={linhaVolta}
        paradasVolta={paradasVolta}
        horariosVolta={horariosVolta}
        tarifasVolta={tarifasVolta}
      />

      <Footer />
    </>
  );
}
