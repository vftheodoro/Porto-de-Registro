import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TipoDia } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const linhaIdStr = searchParams.get('linha_id');
    const tipo = (searchParams.get('tipo') || 'UTIL') as TipoDia;

    if (!linhaIdStr) {
      return NextResponse.json({ error: 'ID da linha é obrigatório' }, { status: 400 });
    }

    const linha_id = parseInt(linhaIdStr);
    const db = getDb();
    const linha = db.linhas.find(l => l.id === linha_id && l.ativa);

    if (!linha) {
      return NextResponse.json({ error: 'Linha não encontrada' }, { status: 404 });
    }

    const horariosFiltrados = linha.horarios
       .filter(h => h.tipo === tipo)
       .sort((a, b) => a.hora_saida.localeCompare(b.hora_saida));

    // Nomes pro PDF
    const tipoMap: Record<TipoDia, string> = {
      'UTIL': 'Dias Úteis',
      'SABADO': 'Sábados',
      'DOMINGO': 'Domingos e Feriados',
      'FERIADO': 'Feriados'
    };

    // Criar PDF
    const doc = new jsPDF();

    // Cabeçalho / Título
    doc.setFontSize(20);
    doc.setTextColor(26, 92, 42); // verde-escuro (#1a5c2a)
    doc.text('Porto de Registro', 14, 22);

    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text(`Horários: ${linha.codigo} - ${linha.nome}`, 14, 32);

    doc.setFontSize(11);
    doc.setTextColor(97, 97, 97);
    doc.text(`Tabela válida para: ${tipoMap[tipo]}`, 14, 40);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 46);

    if (horariosFiltrados.length === 0) {
       doc.setFontSize(12);
       doc.text('Não há horários cadastrados para este dia.', 14, 60);
    } else {
        const bodyContent = horariosFiltrados.map(h => [
            h.hora_saida,
            h.observacao || '—'
        ]);

        autoTable(doc, {
            startY: 55,
            head: [['Horário de Saída', 'Observações']],
            body: bodyContent,
            theme: 'grid',
            headStyles: {
                fillColor: [45, 138, 70], // verde-medio (#2d8a46)
                textColor: 255,
                fontSize: 11,
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 10,
                textColor: 33
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });
    }

    // Gerar buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Headers para forçar o download no navegador
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="horarios-${linha.slug}-${tipo.toLowerCase()}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json({ error: 'Erro interno ao gerar PDF' }, { status: 500 });
  }
}
