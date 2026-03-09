import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();

    const linhasMatriciais = db.linhas.filter(l => l.ativa).map(linha => {
        const cidadesLinha = new Set<string>();
        linha.paradas.forEach(lp => {
             const p = db.paradas.find(pd => pd.id === lp.parada_id);
             if (p) {
                 cidadesLinha.add(p.cidade);
             }
        });
        
        return {
           ...linha,
           cidades: Array.from(cidadesLinha).join(','),
           opera_sabado: linha.horarios.some(h => h.tipo === 'SABADO'),
           opera_domingo: linha.horarios.some(h => h.tipo === 'DOMINGO'),
           // Retiramos horários e paradas pesadas da listagem principal
           horarios: undefined,
           paradas: undefined,
           tarifas: undefined
        };
    }).sort((a, b) => a.codigo.localeCompare(b.codigo));

    return NextResponse.json(linhasMatriciais);
  } catch (error) {
    console.error('Erro ao buscar linhas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
