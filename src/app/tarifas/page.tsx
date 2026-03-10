import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { getDb } from '@/lib/db';
import type { Metadata } from 'next';
import { CreditCard, QrCode, Banknote, Building2, Bus } from 'lucide-react';

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

      <section className="section tarifas-page">
        <div className="container">
          <div className="section__header tarifas-hero">
            <h1 className="section__title">Tarifas e Preços</h1>
            <p className="section__subtitle">
              Consulte os valores por trecho e as formas de pagamento aceitas
            </p>
          </div>

          <section className="pagamento-policy" aria-label="Formas de pagamento">
            <div className="pagamento-policy__header">
              <h2 className="pagamento-policy__title">Formas de pagamento</h2>
              <p className="pagamento-policy__subtitle">A forma de pagamento muda conforme o local de embarque. Confira antes de entrar no veiculo.</p>
              <div className="pagamento-policy__alert">Embarque fora da rodoviaria: leve dinheiro trocado.</div>
            </div>

            <div className="pagamento-policy__grid">
              <article className="pagamento-card pagamento-card--terminal">
                <div className="pagamento-card__top">
                  <Building2 size={18} /> Na rodoviaria
                </div>
                <p className="pagamento-card__hint">Aceita todos os meios abaixo:</p>
                <ul className="pagamento-card__methods" aria-label="Formas aceitas na rodoviaria">
                  <li className="pagamento-method"><QrCode size={15} /> Pix</li>
                  <li className="pagamento-method"><CreditCard size={15} /> Cartao (debito e credito)</li>
                  <li className="pagamento-method"><Banknote size={15} /> Dinheiro</li>
                </ul>
              </article>

              <article className="pagamento-card pagamento-card--onibus">
                <div className="pagamento-card__top">
                  <Bus size={18} /> No onibus (fora da rodoviaria)
                </div>
                <p className="pagamento-card__hint">Pagamento direto ao motorista:</p>
                <ul className="pagamento-card__methods" aria-label="Formas aceitas no onibus">
                  <li className="pagamento-method pagamento-method--only-cash"><Banknote size={15} /> Somente dinheiro em especie</li>
                </ul>
              </article>
            </div>
          </section>

          <div className="tarifas-list">
            {linhasComTarifas.map((linha) => (
              <div key={linha.id} className="results tarifas-list__item">
                <div className="results__header">
                  <div className="tarifas-line-head">
                    <div className="results__title">{linha.nome}</div>
                    <p className="tarifas-line-head__subtitle">Valores oficiais por trecho cadastrado</p>
                  </div>
                </div>

                <div className="tarifas-table-wrap">
                  <table className="fare-table">
                    <thead>
                      <tr>
                        <th>Origem</th>
                        <th>Destino</th>
                        <th className="fare-table__col-price">Tarifa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linha.tarifasDetalhes.map((t, idx) => (
                        <tr key={idx}>
                          <td data-label="Origem">{t.origem_nome}</td>
                          <td data-label="Destino">{t.destino_nome}</td>
                          <td data-label="Tarifa" className="fare-table__col-price fare-table__cell--price">
                            <span className="fare-table__value">
                              R$ {t.valor.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
