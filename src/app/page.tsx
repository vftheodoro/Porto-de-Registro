import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import ScheduleSearch from '@/components/public/ScheduleSearch';
import { getDb } from '@/lib/db';
import { classificarAvisosPublicos } from '@/lib/avisos-publicos';
import type { Aviso, LinhaCompleta } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Map,
  CalendarDays,
  Clock,
  AlertTriangle,
  Info,
  Calendar,
  CircleCheck,
  GraduationCap,
  FileText,
  CreditCard,
  Briefcase,
  ArrowUpRight,
} from 'lucide-react';

export const revalidate = 60;

async function getAvisos(): Promise<Aviso[]> {
  const db = getDb();
  return db.avisos;
}

async function getLinhasPopulares(): Promise<LinhaCompleta[]> {
  const db = getDb();
  const ativas = db.linhas.filter(l => l.ativa).slice(0, 3);

  return ativas.map(linha => {
     const cidades = new Set<string>();
     linha.paradas.forEach(lp => {
       const p = db.paradas.find(pd => pd.id === lp.parada_id);
       if (p) cidades.add(p.cidade);
     });

     return {
         ...linha,
         cidades: Array.from(cidades).join(', '),
         qtd_util: linha.horarios.filter(h => h.tipo === 'UTIL').length,
         qtd_sabado: linha.horarios.filter(h => h.tipo === 'SABADO').length,
         qtd_domingo: linha.horarios.filter(h => h.tipo === 'DOMINGO').length,
         paradas: [],
         tarifas: [],
     };
  });
}

const avisoIcons: Record<string, React.ReactNode> = {
  URGENTE: <AlertTriangle size={20} />,
  INFORMATIVO: <Info size={20} />,
  FERIADO: <Calendar size={20} />,
};

export default async function HomePage() {
  const avisos = await getAvisos();
  const { notificacoes } = classificarAvisosPublicos(avisos);
  const linhasPopulares = await getLinhasPopulares();

  return (
    <>
      <Header />

      {/* ===== Comunicados em destaque ===== */}
      <section className="comunicados-section">
        <div className="container">
          <div className="comunicados-header">
            <h2 className="comunicados-header__title">Avisos Importantes</h2>
            <span className="comunicados-header__count">
              {notificacoes.length > 0
                ? `${notificacoes.length} alerta${notificacoes.length > 1 ? 's' : ''}`
                : 'Operação normal'}
            </span>
          </div>

          {notificacoes.length > 0 ? (
            <div className="comunicados-grid">
              {notificacoes.map((aviso) => (
                <div
                  key={aviso.id}
                  className={`comunicado-card comunicado-card--${aviso.tipo.toLowerCase()}`}
                >
                  <div className="comunicado-card__icon">
                    {avisoIcons[aviso.tipo]}
                  </div>
                  <div className="comunicado-card__body">
                    <div className="comunicado-card__badge">
                      {aviso.tipo === 'URGENTE' ? 'Urgente' : aviso.tipo === 'FERIADO' ? 'Feriado' : 'Informativo'}
                    </div>
                    <h3 className="comunicado-card__title">{aviso.titulo}</h3>
                    <p className="comunicado-card__text">{aviso.conteudo}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="comunicado-card comunicado-card--normal">
              <div className="comunicado-card__icon">
                <CircleCheck size={20} />
              </div>
              <div className="comunicado-card__body">
                <div className="comunicado-card__badge">Status da operação</div>
                <h3 className="comunicado-card__title">Sem ocorrências críticas no momento</h3>
                <p className="comunicado-card__text">
                  Caso haja interrupções de pista, atrasos relevantes ou cancelamentos de horários, os avisos serão publicados aqui imediatamente.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== Hero + Busca ===== */}
      <section className="hero">
        <div className="container">
          <h1 className="hero__title">Consulte os Horários de Ônibus</h1>
          <p className="hero__subtitle">
            Encontre os horários, rotas e tarifas para viajar pelo Vale do Ribeira
          </p>
          <ScheduleSearch />
        </div>
      </section>

      {/* ===== Nossa Frota ===== */}
      <section className="frota-section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Nossa Frota</h2>
            <p className="section__subtitle">Veículos modernos e seguros para a sua viagem</p>
          </div>
          <div className="frota-grid">
            <div className="frota-card">
              <div className="frota-card__img">
                <Image
                  src="/images/onibus/onibus1.png"
                  alt="Ônibus Porto de Registro - Marcopolo Torino branco"
                  width={560}
                  height={320}
                  className="frota-card__image"
                />
              </div>
              <div className="frota-card__info">
                <span className="badge badge--verde">Frota ativa</span>
                <span className="frota-card__model">Marcopolo Torino</span>
              </div>
            </div>
            <div className="frota-card">
              <div className="frota-card__img">
                <Image
                  src="/images/onibus/onibus2.png"
                  alt="Ônibus Porto de Registro - Neobus verde"
                  width={560}
                  height={320}
                  className="frota-card__image"
                />
              </div>
              <div className="frota-card__info">
                <span className="badge badge--verde">Frota ativa</span>
                <span className="frota-card__model">Neobus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Linhas populares ===== */}
      <section className="routes-section">
        <div className="container">
          <div className="section__header routes-section__header">
            <h2 className="section__title">Nossas Linhas</h2>
            <p className="section__subtitle">
              Conheca as principais rotas que conectam as cidades do Vale do Ribeira
            </p>
          </div>

          <div className="routes-grid">
            {linhasPopulares.map((linha) => (
              <Link
                key={linha.id}
                href={`/linhas/${linha.slug}`}
                className="route-card"
              >
                <div className="route-card__code">{linha.codigo}</div>
                <div className="route-card__name">{linha.nome}</div>
                <div className="route-card__cities route-card__cities--icon">
                  <MapPin size={16} /> {linha.cidades.split(', ').join(' → ')}
                </div>
                <div className="route-card__badges">
                  <span className="badge badge--verde">Dias úteis</span>
                  {linha.qtd_sabado > 0 && <span className="badge badge--dourado">Sáb</span>}
                  {linha.qtd_domingo > 0 && <span className="badge badge--cinza">Dom/Fer</span>}
                </div>
              </Link>
            ))}
          </div>

          <div className="routes-section__actions">
            <Link href="/linhas" className="btn btn--secondary">
              Ver todas as linhas →
            </Link>
          </div>
        </div>
      </section>

      <section className="passageiro-section">
        <div className="container">
          <div className="passageiro-shell">
            <div className="passageiro-intro">
              <span className="passageiro-kicker">Atendimento Digital</span>
              <h2 className="passageiro-title">Area do Passageiro</h2>
              <p className="passageiro-subtitle">
                Tudo que voce precisa para sua rotina de viagem em um unico painel:
                cartao estudante, declaracoes escolares, cartao isento e vale-transporte.
              </p>
              <div className="passageiro-cta-row">
                <Link href="/atendimento" className="btn btn--primary passageiro-cta">
                  Acessar Atendimento ao Passageiro
                </Link>
                <Link href="/sobre" className="passageiro-link">
                  Ver canais e contatos
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            <div className="passageiro-grid" aria-label="Servicos disponiveis">
              <article className="passageiro-card">
                <div className="passageiro-card__icon">
                  <GraduationCap size={20} />
                </div>
                <h3>Cartao estudante</h3>
                <p>Consulte regras, prazos e documentos para manter o beneficio ativo.</p>
              </article>

              <article className="passageiro-card">
                <div className="passageiro-card__icon">
                  <FileText size={20} />
                </div>
                <h3>Declaracoes escolares</h3>
                <p>Veja como solicitar, atualizar e validar documentos para transporte.</p>
              </article>

              <article className="passageiro-card">
                <div className="passageiro-card__icon">
                  <CreditCard size={20} />
                </div>
                <h3>Cartao isento</h3>
                <p>Encontre orientacoes para pedido, renovacao e regularizacao do cartao.</p>
              </article>

              <article className="passageiro-card">
                <div className="passageiro-card__icon">
                  <Briefcase size={20} />
                </div>
                <h3>Vale-transporte</h3>
                <p>Informacoes para empresas, colaborador e emissao correta do beneficio.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Como usar ===== */}
      <section className="section section--alt">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Como usar o site</h2>
            <p className="section__subtitle">Passo a passo simples para encontrar seu melhor horario</p>
          </div>

          <div className="howto-intro">
            <strong className="howto-intro__title">Antes de comecar</strong>
            <p className="howto-intro__text">
              Tenha em maos a cidade de origem, destino e o tipo de dia da viagem.
              O sistema mostra horarios, tempo estimado e tarifa quando disponivel.
            </p>
            <div className="howto-intro__chips">
              <span className="howto-chip">Origem e destino por cidade</span>
              <span className="howto-chip">Selecione o tipo de dia correto</span>
              <span className="howto-chip">Compare saida, chegada e tarifa</span>
            </div>
          </div>

          <div className="howto-grid">
            <div className="howto-card">
              <div className="howto-card__step">1</div>
              <div className="howto-card__icon"><Map size={36} /></div>
              <h3 className="howto-card__title">Escolha origem e destino</h3>
              <p className="howto-card__text">
                Selecione de onde voce sai e para onde quer ir.
              </p>
              <p className="howto-card__meta">Dica: use o botao de troca para simular ida e volta.</p>
            </div>
            <div className="howto-card">
              <div className="howto-card__step">2</div>
              <div className="howto-card__icon"><CalendarDays size={36} /></div>
              <h3 className="howto-card__title">Selecione o tipo de dia</h3>
              <p className="howto-card__text">
                Escolha entre dia util, sabado, domingo ou feriado.
              </p>
              <p className="howto-card__meta">Isso evita exibicao de horarios fora da sua data.</p>
            </div>
          </div>

          <details className="howto-more">
            <summary className="btn btn--secondary howto-more__summary">Ver mais</summary>
            <div className="howto-grid howto-grid--more">
              <div className="howto-card">
                <div className="howto-card__step">3</div>
                <div className="howto-card__icon"><Clock size={36} /></div>
                <h3 className="howto-card__title">Compare os horarios</h3>
                <p className="howto-card__text">
                  Veja saida, chegada estimada e observacoes de cada viagem.
                </p>
                <p className="howto-card__meta">Priorize a opcao com melhor encaixe no seu trajeto.</p>
              </div>
              <div className="howto-card">
                <div className="howto-card__step">4</div>
                <div className="howto-card__icon"><CircleCheck size={36} /></div>
                <h3 className="howto-card__title">Confirme tarifa e regras</h3>
                <p className="howto-card__text">
                  Antes de embarcar, confira valor e requisitos de beneficio.
                </p>
                <p className="howto-card__meta">Se necessario, acesse a Area do Passageiro para validar documentos.</p>
              </div>
            </div>
          </details>
        </div>
      </section>

      <Footer />
    </>
  );
}
