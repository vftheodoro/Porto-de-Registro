import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { TipoDia } from '@/types';
import { listarDestinosAlcancaveis } from '@/lib/route-planner';

export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const origem = searchParams.get('origem');
    const tipo = (searchParams.get('tipo') || 'UTIL') as TipoDia;

    if (!origem) {
      return NextResponse.json(
        { error: 'Origem e obrigatoria' },
        { status: 400 }
      );
    }

    const db = getDb();
    const destinos = listarDestinosAlcancaveis(db, origem, tipo);
    return NextResponse.json({ destinos });
  } catch (error) {
    console.error('Erro ao listar destinos alcancaveis:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
