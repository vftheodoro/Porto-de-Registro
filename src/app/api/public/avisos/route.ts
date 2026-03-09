import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    
    // Apenas avisos ativos
    const avisos = db.avisos
       .filter(a => a.ativo)
       .sort((a, b) => {
          // URGENTE primeiro, FERIADO depois, INFORMATIVO no fim
           const pesos: Record<string, number> = {
               'URGENTE': 1,
               'FERIADO': 2,
               'INFORMATIVO': 3
           };
           return (pesos[a.tipo] || 99) - (pesos[b.tipo] || 99);
       });

    return NextResponse.json(avisos);
  } catch (error) {
    console.error('Erro ao buscar avisos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
