import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    
    // Filtro: pegar apenas paradas ativas e que estejam atreladas a alguma linha ativa
    const linhasAtivas = db.linhas.filter(l => l.ativa);
    const paradas_ids_usadas = new Set<number>();
    
    linhasAtivas.forEach(linha => {
       linha.paradas.forEach(lp => {
           paradas_ids_usadas.add(lp.parada_id);
       });
    });

    const paradas_resultado = db.paradas
       .filter(p => paradas_ids_usadas.has(p.id))
       .map(p => ({
           cidade: p.cidade,
           id: p.id,
           nome: p.nome
       }))
       .sort((a, b) => a.cidade.localeCompare(b.cidade));
       
    // Remover duplicatas de cidades caso tenham múltiplas paradas na mesma cidade na query
    const cidadesUnicas = [];
    const cidadesVistas = new Set<string>();
    
    for (const p of paradas_resultado) {
      if (!cidadesVistas.has(p.cidade)) {
         cidadesVistas.add(p.cidade);
         cidadesUnicas.push(p);
      }
    }

    return NextResponse.json(cidadesUnicas);
  } catch (error) {
    console.error('Erro ao buscar paradas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
