import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { LinhaParadaComDetalhes, ResultadoBusca, TipoDia } from '@/types';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);

    const origemCidade = searchParams.get('origem');
    const destinoCidade = searchParams.get('destino');
    const tipo = (searchParams.get('tipo') || 'UTIL') as TipoDia;

    if (!origemCidade || !destinoCidade) {
      return NextResponse.json(
        { error: 'Origem e destino são obrigatórios' },
        { status: 400 }
      );
    }

    const resultados: ResultadoBusca[] = [];

    // Find lines that pass through both origin and destination cities
    for (const linha of db.linhas.filter(l => l.ativa)) {
       // Check if line passes through both cities, and origin comes first
       let paradaOrigemInfo: LinhaParadaComDetalhes | undefined;
       let paradaDestinoInfo: LinhaParadaComDetalhes | undefined;
       
       // Populate parada details
       const paradasComDetalhes = linha.paradas.map(lp => {
         const p = db.paradas.find(pd => pd.id === lp.parada_id);
         return {
            ...lp,
            parada_nome: p?.nome || '',
            parada_cidade: p?.cidade || ''
         };
       }).sort((a, b) => a.ordem - b.ordem);

       for (const p of paradasComDetalhes) {
          if (p.parada_cidade === origemCidade && !paradaOrigemInfo) paradaOrigemInfo = p;
          if (p.parada_cidade === destinoCidade && !paradaDestinoInfo) paradaDestinoInfo = p;
       }

       if (paradaOrigemInfo && paradaDestinoInfo && paradaOrigemInfo.ordem < paradaDestinoInfo.ordem) {
           // Line is valid! Add it to results
           const horariosAtivosParaTipo = linha.horarios.filter(h => h.tipo === tipo);
           
           // Calculate fare
           const tarifaObj = linha.tarifas.find(t => 
             t.origem_id === paradaOrigemInfo?.parada_id && 
             t.destino_id === paradaDestinoInfo?.parada_id
           );
           
           const tempoEstimado = paradaDestinoInfo.tempo_minutos - paradaOrigemInfo.tempo_minutos;

           resultados.push({
               linha: {
                   id: linha.id,
                   codigo: linha.codigo,
                   nome: linha.nome,
                   slug: linha.slug,
                   descricao: linha.descricao,
                   ativa: linha.ativa
               },
               horarios: horariosAtivosParaTipo.sort((a, b) => a.hora_saida.localeCompare(b.hora_saida)),
               paradas: paradasComDetalhes,
               tarifa: tarifaObj ? tarifaObj.valor : null,
               tempo_estimado: tempoEstimado
           });
       }
    }

    return NextResponse.json({ resultados });
  } catch (error) {
    console.error('Erro na busca de horários:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
