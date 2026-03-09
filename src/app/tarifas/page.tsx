import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { getDb } from '@/lib/db';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarifas e Valores | Porto de Registro',
  description: 'Tabela completa de preços e tarifas das linhas de ônibus da Porto de Registro.',
};

export const revalidate = 60;

export default async function TarifasPage() {
  const db = getDb();

  // Organiza as tarifas por linha
  const linhasComTarifas = db.linhas
    .filter((l) => l.ativa && l.tarifas.length > 0)
    .map((linha) => {
      const tarifasDetalhes = linha.tarifas
        .map((t) => {
          const origem = db.paradas.find((p) => p.id === t.origem_id);
          const destino = db.paradas.find((p) => p.id === t.destino_id);
          return {
            ...t,
            origem_nome: origem ? `${origem.nome} (${origem.cidade})` : 'Origem',
            destino_nome: destino ? `${destino.nome} (${destino.cidade})` : 'Destino',
          };
        })
        .sort((a, b) => a.valor - b.valor);

      return {
        ...linha,
        tarifasDetalhes,
      };
    })
    .sort((a, b) => a.codigo.localeCompare(b.codigo));

  return (
    <>
      <Header />

      <section className="section">
        <div className="container">
          <div className="section__header">
            <h1 className="section__title">Tarifas e Preços</h1>
            <p className="section__subtitle">
              Consulte os valores das passagens para os trechos operados
            </p>
          </div>

          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {linhasComTarifas.map((linha) => (
              <div key={linha.id} className="results" style={{ marginBottom: '2rem' }}>
                <div className="results__header">
                  <div>
                    <div className="results__title">{linha.nome}</div>
                  </div>
                  <span className="badge badge--verde">{linha.codigo}</span>
                </div>

                <table className="fare-table">
                  <thead>
                    <tr>
                      <th>Origem</th>
                      <th>Destino</th>
                      <th style={{ textAlign: 'right' }}>Tarifa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linha.tarifasDetalhes.map((t, idx) => (
                      <tr key={idx}>
                        <td>{t.origem_nome}</td>
                        <td>{t.destino_nome}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="fare-table__value">
                            R$ {t.valor.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            
            {linhasComTarifas.length === 0 && (
               <div className="results__empty">
                 <p>Não há tabelas de tarifas cadastradas no momento.</p>
               </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
