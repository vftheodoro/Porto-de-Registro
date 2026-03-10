import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TipoDia, Linha } from '@/types';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function paradasOrdenadas(linha: { paradas: Array<{ ordem: number; parada_id: number }> }) {
  return [...linha.paradas].sort((a, b) => a.ordem - b.ordem);
}

function tempoTotalLinha(linha: { paradas: Array<{ ordem: number; tempo_minutos: number }> }): number {
  const paradas = [...linha.paradas].sort((a, b) => a.ordem - b.ordem);
  return paradas.length > 0 ? paradas[paradas.length - 1].tempo_minutos : 0;
}

function findLinhaVolta(db: ReturnType<typeof getDb>, linhaIda: NonNullable<ReturnType<typeof getDb>['linhas'][number]>) {
  const pIda = paradasOrdenadas(linhaIda);
  if (pIda.length < 2) return null;
  const origemIda = pIda[0].parada_id;
  const destinoIda = pIda[pIda.length - 1].parada_id;

  return (
    db.linhas.find((l) => {
      if (!l.ativa || l.id === linhaIda.id) return false;
      const pVolta = paradasOrdenadas(l);
      if (pVolta.length < 2) return false;
      const origemVolta = pVolta[0].parada_id;
      const destinoVolta = pVolta[pVolta.length - 1].parada_id;
      return origemVolta === destinoIda && destinoVolta === origemIda;
    }) || null
  );
}

function routeLabel(linha: Linha, db: ReturnType<typeof getDb>): string {
  const paradas = paradasOrdenadas(linha);
  const origem = db.paradas.find((p) => p.id === paradas[0]?.parada_id)?.cidade || 'Origem';
  const destino = db.paradas.find((p) => p.id === paradas[paradas.length - 1]?.parada_id)?.cidade || 'Destino';
  return `${origem} -> ${destino}`;
}

function getLogoDataUrl(): string | null {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logos', 'logo_completa_pr.png');
    const logoBuffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch {
    return null;
  }
}

function moeda(valor: number): string {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

function chegadaEstimativa(horaSaida: string, tempoMin: number): string {
  const [hh, mm] = horaSaida.split(':').map(Number);
  const total = hh * 60 + mm + tempoMin;
  const hora = String(Math.floor(total / 60) % 24).padStart(2, '0');
  const minuto = String(total % 60).padStart(2, '0');
  return `${hora}:${minuto}`;
}

function minMaxTarifa(tarifas: Array<{ valor: number }>): string {
  if (tarifas.length === 0) return 'Nao informada';
  const valores = tarifas.map((t) => t.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  return min === max ? moeda(min) : `${moeda(min)} a ${moeda(max)}`;
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 220);
    doc.line(14, height - 14, width - 14, height - 14);
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text('Porto de Registro - Documento oficial de consulta de horarios', 14, height - 9);
    doc.text(`Pagina ${i} de ${pageCount}`, width - 14, height - 9, { align: 'right' });
  }
}

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

    const linhaVolta = findLinhaVolta(db, linha);
    const tempoIda = tempoTotalLinha(linha);
    const tempoVolta = linhaVolta ? tempoTotalLinha(linhaVolta) : 0;

    const horariosIda = linha.horarios
       .filter(h => h.tipo === tipo)
       .sort((a, b) => a.hora_saida.localeCompare(b.hora_saida));

    const horariosVolta = linhaVolta
      ? linhaVolta.horarios
          .filter((h) => h.tipo === tipo)
          .sort((a, b) => a.hora_saida.localeCompare(b.hora_saida))
      : [];

    const observacoesIda = horariosIda.filter((h) => Boolean(h.observacao?.trim()));
    const observacoesVolta = horariosVolta.filter((h) => Boolean(h.observacao?.trim()));

    const tarifasIda = [...linha.tarifas]
      .map((t) => {
        const origem = db.paradas.find((p) => p.id === t.origem_id);
        const destino = db.paradas.find((p) => p.id === t.destino_id);
        return {
          origem: origem?.cidade || 'Origem',
          destino: destino?.cidade || 'Destino',
          valor: t.valor,
        };
      })
      .sort((a, b) => a.origem.localeCompare(b.origem) || a.destino.localeCompare(b.destino));

    const tarifasVolta = linhaVolta
      ? [...linhaVolta.tarifas]
          .map((t) => {
            const origem = db.paradas.find((p) => p.id === t.origem_id);
            const destino = db.paradas.find((p) => p.id === t.destino_id);
            return {
              origem: origem?.cidade || 'Origem',
              destino: destino?.cidade || 'Destino',
              valor: t.valor,
            };
          })
          .sort((a, b) => a.origem.localeCompare(b.origem) || a.destino.localeCompare(b.destino))
      : [];

    const tipoMap: Record<TipoDia, string> = {
      'UTIL': 'Dias Úteis',
      'SABADO': 'Sábados',
      'DOMINGO': 'Domingos',
      'FERIADO': 'Feriados'
    };

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const logoDataUrl = getLogoDataUrl();
    const largura = doc.internal.pageSize.getWidth();

    // Header principal
    doc.setFillColor(20, 71, 30);
    doc.rect(0, 0, largura, 36, 'F');

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 14, 7, 64, 16);
    }

    doc.setFontSize(9);
    doc.setTextColor(215, 190, 106);
    doc.text('TRANSPORTE COLETIVO INTERMUNICIPAL', largura - 14, 11, { align: 'right' });

    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text('Quadro Oficial de Horários', largura - 14, 19, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(230, 230, 230);
    doc.text(`${tipoMap[tipo]} • Atualizado em ${new Date().toLocaleDateString('pt-BR')}`, largura - 14, 26, { align: 'right' });

    doc.setFontSize(9);
    doc.text('Documento pronto para impressão e fixação em pontos de consulta', largura - 14, 32, { align: 'right' });

    // Bloco resumo
    doc.setDrawColor(198, 222, 202);
    doc.setFillColor(245, 251, 246);
    doc.roundedRect(14, 42, 182, 32, 3, 3, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Linha principal', 18, 49);
    doc.text('Tempo estimado', 90, 49);
    doc.text('Faixa de tarifa', 150, 49);

    doc.setFontSize(12);
    doc.setTextColor(20, 71, 30);
    doc.text(routeLabel(linha, db), 18, 57);
    doc.text(`${tempoIda} min`, 90, 57);
    doc.text(minMaxTarifa(linha.tarifas), 150, 57);

    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(`Código ${linha.codigo}${linhaVolta ? ` • Volta associada ${linhaVolta.codigo}` : ''}`, 18, 64);
    doc.text(linhaVolta ? routeLabel(linhaVolta, db) : 'Linha sem retorno associado cadastrado', 18, 69);

    // Tabela principal de horários
    const maxRows = Math.max(horariosIda.length, horariosVolta.length, 1);
    const body = Array.from({ length: maxRows }).map((_, idx) => {
      const ida = horariosIda[idx];
      const volta = horariosVolta[idx];
      return linhaVolta
        ? [
            ida ? `${ida.hora_saida}${ida.observacao?.trim() ? '*' : ''}` : '—',
            ida ? chegadaEstimativa(ida.hora_saida, tempoIda) : '—',
            volta ? `${volta.hora_saida}${volta.observacao?.trim() ? '*' : ''}` : '—',
            volta ? chegadaEstimativa(volta.hora_saida, tempoVolta) : '—',
          ]
        : [
            ida ? `${ida.hora_saida}${ida.observacao?.trim() ? '*' : ''}` : '—',
            ida ? chegadaEstimativa(ida.hora_saida, tempoIda) : '—',
          ];
    });

    autoTable(doc, {
      startY: 80,
      margin: { left: 14, right: 14 },
      head: linhaVolta
        ? [[
            `Ida (${linha.codigo}) - Saída`,
            'Ida - Chegada',
            `Volta (${linhaVolta.codigo}) - Saída`,
            'Volta - Chegada',
          ]]
        : [[`Saída (${linha.codigo})`, 'Chegada estimada']],
      body,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2.6, textColor: [40, 40, 40] },
      headStyles: {
        fillColor: [20, 71, 30],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [247, 251, 247],
      },
      columnStyles: linhaVolta
        ? {
            0: { cellWidth: 43 },
            1: { cellWidth: 43 },
            2: { cellWidth: 43 },
            3: { cellWidth: 43 },
          }
        : {
            0: { cellWidth: 86 },
            1: { cellWidth: 86 },
          },
    });

    let finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 44;

    const observacoesCombinadas = [
      ...observacoesIda.map((h) => `Ida ${h.hora_saida}: ${h.observacao}`),
      ...observacoesVolta.map((h) => `Volta ${h.hora_saida}: ${h.observacao}`),
    ];

    if (observacoesCombinadas.length > 0) {
      doc.setFillColor(255, 248, 225);
      doc.setDrawColor(240, 220, 160);
      const limite = Math.min(observacoesCombinadas.length, 8);
      const boxHeight = 10 + limite * 5;
      doc.roundedRect(14, finalY + 6, 182, boxHeight, 2, 2, 'FD');
      doc.setFontSize(10);
      doc.setTextColor(120, 90, 10);
      doc.text('* Observações relevantes', 18, finalY + 12);
      doc.setFontSize(9);
      doc.setTextColor(85, 70, 25);
      for (let i = 0; i < limite; i += 1) {
        doc.text(`- ${observacoesCombinadas[i]}`, 18, finalY + 17 + i * 5);
      }
      finalY += 12 + boxHeight;
    }

    // Tarifas ida
    if (tarifasIda.length > 0) {
      autoTable(doc, {
        startY: finalY + 8,
        margin: { left: 14, right: 14 },
        head: [[`Tarifas da ida - ${linha.codigo} (${routeLabel(linha, db)})`, '', 'Valor']],
        body: tarifasIda.map((t) => [t.origem, t.destino, moeda(t.valor)]),
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2.2 },
        headStyles: {
          fillColor: [47, 114, 61],
          textColor: 255,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 62 },
          1: { cellWidth: 82 },
          2: { cellWidth: 30, halign: 'right' },
        },
      });
      finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || finalY;
    }

    if (tarifasVolta.length > 0) {
      autoTable(doc, {
        startY: finalY + 6,
        margin: { left: 14, right: 14 },
        head: [[`Tarifas da volta - ${linhaVolta?.codigo || '---'} (${linhaVolta ? routeLabel(linhaVolta, db) : 'Volta'})`, '', 'Valor']],
        body: tarifasVolta.map((t) => [t.origem, t.destino, moeda(t.valor)]),
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2.2 },
        headStyles: {
          fillColor: [180, 134, 11],
          textColor: 255,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 62 },
          1: { cellWidth: 82 },
          2: { cellWidth: 30, halign: 'right' },
        },
      });
      finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || finalY;
    }

    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text('Pagamento: na rodoviária aceitamos Pix, cartão e dinheiro. No ônibus fora da rodoviária, somente dinheiro físico.', 14, Math.min(finalY + 10, 280));

    addFooter(doc);

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
