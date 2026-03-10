import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { classificarAvisosPublicos } from '@/lib/avisos-publicos';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const grupo = searchParams.get('grupo');

    const { notificacoes, informativosCartoes } = classificarAvisosPublicos(db.avisos);

    if (grupo === 'informativos') {
      return NextResponse.json(informativosCartoes);
    }

    if (grupo === 'todos') {
      return NextResponse.json({ notificacoes, informativos: informativosCartoes });
    }

    // Compatibilidade: resposta padrão mantém apenas notificações operacionais.
    return NextResponse.json(notificacoes);
  } catch (error) {
    console.error('Erro ao buscar avisos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
