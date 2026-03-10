import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  CreditCard,
  ShieldCheck,
  FileCheck,
  ClipboardCheck,
  Clock3,
  CircleAlert,
  Smartphone,
  Instagram,
  BusFront,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Atendimento ao Passageiro | Porto de Registro',
  description:
    'Informacoes para passageiros: cartoes, beneficios, documentacao e canais de atendimento da Porto de Registro.',
};

export const revalidate = 60;

export default async function AtendimentoPage() {
  return (
    <>
      <Header />

      <section className="atendimento-hero">
        <div className="container atendimento-hero__grid">
          <div className="atendimento-hero__content">
            <span className="atendimento-hero__kicker">Central de Servicos</span>
            <h1 className="atendimento-hero__title">Atendimento ao Passageiro</h1>
            <p className="atendimento-hero__subtitle">
              Um painel unico para tirar duvidas, regularizar cartoes e seguir as regras de uso
              do transporte sem dor de cabeca.
            </p>

            <div className="atendimento-hero__actions">
              <Link href="/horarios" className="btn btn--gold">
                <BusFront size={18} /> Buscar horarios
              </Link>
              <Link href="/tarifas" className="btn btn--secondary">
                Ver tarifas
              </Link>
            </div>

            <div className="atendimento-hero__chips">
              <span className="atendimento-chip">Cartao estudante</span>
              <span className="atendimento-chip">Declaracoes escolares</span>
              <span className="atendimento-chip">Cartao isento</span>
              <span className="atendimento-chip">Vale-transporte</span>
            </div>
          </div>

          <div className="atendimento-hero__media">
            <div className="atendimento-card-spotlight">
              <div className="atendimento-card-spotlight__label">Porto card - frente e verso</div>
              <div className="atendimento-card-spotlight__gallery">
                <Image
                  src="/images/cartao_onibus_frente.png"
                  alt="Porto card frente"
                  width={360}
                  height={220}
                  className="atendimento-card-spotlight__image"
                  priority
                />
                <Image
                  src="/images/cartao_onibus_verso_informacoes_passageiro.png"
                  alt="Porto card verso"
                  width={360}
                  height={220}
                  className="atendimento-card-spotlight__image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container atendimento-layout">
          <div className="atendimento-main">
            <div className="section__header" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <h2 className="section__title" style={{ marginBottom: '0.25rem' }}>Jornada do atendimento</h2>
              <p className="section__subtitle" style={{ fontSize: '1rem' }}>
                Siga este fluxo para resolver pendencias com rapidez.
              </p>
            </div>

            <div className="atendimento-steps">
              <article className="atendimento-step">
                <div className="atendimento-step__num">1</div>
                <div>
                  <h3 className="atendimento-step__title">Identifique seu servico</h3>
                  <p className="atendimento-step__text">
                    Defina se a solicitacao e para cartao estudante, cartao isento, declaracao escolar
                    ou vale-transporte.
                  </p>
                </div>
              </article>
              <article className="atendimento-step">
                <div className="atendimento-step__num">2</div>
                <div>
                  <h3 className="atendimento-step__title">Separe os documentos</h3>
                  <p className="atendimento-step__text">
                    Valide assinatura digital, reconhecimento quando exigido e dados pessoais atualizados.
                  </p>
                </div>
              </article>
              <article className="atendimento-step">
                <div className="atendimento-step__num">3</div>
                <div>
                  <h3 className="atendimento-step__title">Solicite e acompanhe</h3>
                  <p className="atendimento-step__text">
                    Envie pelos canais oficiais e acompanhe status para evitar bloqueio de beneficio.
                  </p>
                </div>
              </article>
            </div>

            <div className="atendimento-services-grid">
              <article className="atendimento-service-card">
                <div className="atendimento-service-card__icon">
                  <FileCheck size={20} />
                </div>
                <h3>Documentacao para cartoes</h3>
                <p>
                  Declaracoes escolares precisam de assinatura digital valida ou reconhecimento
                  em cartorio.
                </p>
              </article>

              <article className="atendimento-service-card">
                <div className="atendimento-service-card__icon">
                  <CreditCard size={20} />
                </div>
                <h3>Beneficios e gratuidade</h3>
                <p>
                  Cartao Isento para 65+ segue regras legais vigentes e pode exigir validacoes
                  periodicas.
                </p>
              </article>

              <article className="atendimento-service-card">
                <div className="atendimento-service-card__icon">
                  <ShieldCheck size={20} />
                </div>
                <h3>Uso correto do cartao</h3>
                <p>
                  Cartoes sao pessoais e intransferiveis. Uso indevido pode gerar bloqueio e cancelamento.
                </p>
              </article>

              <article className="atendimento-service-card">
                <div className="atendimento-service-card__icon">
                  <Clock3 size={20} />
                </div>
                <h3>Prazos e regularizacao</h3>
                <p>
                  Mantenha seus dados atualizados e acompanhe os prazos para nao perder beneficios.
                </p>
              </article>
            </div>
          </div>

          <aside className="atendimento-aside">
            <div className="atendimento-aside__card">
              <div className="atendimento-aside__title">
                <CircleAlert size={18} /> Checklist rapido
              </div>
              <ul className="atendimento-checklist">
                <li><ClipboardCheck size={16} /> Documento oficial com foto</li>
                <li><ClipboardCheck size={16} /> Declaracao assinada corretamente</li>
                <li><ClipboardCheck size={16} /> Dados do titular atualizados</li>
                <li><ClipboardCheck size={16} /> Protocolo de solicitacao</li>
              </ul>
            </div>

            <div className="atendimento-aside__card atendimento-aside__card--contato">
              <div className="atendimento-aside__title">Canais de atendimento</div>
              <a
                href="https://wa.me/5511977795599"
                target="_blank"
                rel="noopener noreferrer"
                className="atendimento-contact-btn"
              >
                <Smartphone size={16} /> WhatsApp/SAC
              </a>
              <a
                href="https://www.instagram.com/portoregistro/"
                target="_blank"
                rel="noopener noreferrer"
                className="atendimento-contact-btn"
              >
                <Instagram size={16} /> Instagram
              </a>
              <Link href="/horarios" className="btn btn--gold" style={{ marginTop: '0.35rem' }}>
                Buscar horarios
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="section section--alt" style={{ paddingTop: '1rem' }}>
        <div className="container" style={{ maxWidth: 980 }}>
          <div className="results">
            <div className="results__header">
              <div className="results__title">Atendimento com orientacao clara</div>
            </div>
            <div className="atendimento-final">
              <p>
                Em caso de duvida sobre documentos, beneficios ou regularizacao, use os canais oficiais
                acima para orientacao antes de viajar.
              </p>
              <Link href="/sobre" className="btn btn--secondary">Ver contatos completos</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
