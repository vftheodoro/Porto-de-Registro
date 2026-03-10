import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Clock, Smartphone, MapPin, Instagram, Phone, Globe, CalendarDays, BusFront, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre a Empresa | Porto de Registro',
  description: 'Conheça a história e o compromisso da Porto de Registro com o transporte no Vale do Ribeira.',
};

export default function SobrePage() {
  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="sobre-hero">
        <div className="sobre-hero__shape">
          <BusFront size={400} />
        </div>
        <div className="container sobre-hero__inner">
          <div className="sobre-hero__kicker">
            <span className="sobre-hero__kicker-dot"></span>
            Tradição & Confiança
          </div>
          <h1 className="sobre-hero__title">
            Conheça a Porto de Registro
          </h1>
          <p className="sobre-hero__subtitle">
            Movimentando o Vale do Ribeira com segurança rigorosa, pontualidade britânica e imenso respeito pelos passageiros.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="sobre-content-shell">
        <div className="container sobre-content-shell__container">
          
          {/* Main History Card */}
          <div className="card sobre-history-card sobre-history-card--spaced">
            <div className="sobre-history-card__header">
              <div className="sobre-history-card__icon">
                <Clock size={24} />
              </div>
              <h2 className="sobre-history-card__title">Nossa História</h2>
            </div>
            
            <p className="sobre-history-card__text sobre-history-card__text--spaced">
              Há anos, a <strong>Porto de Registro</strong> tem sido peça fundamental no desenvolvimento e na integração 
              das cidades do Vale do Ribeira. Nascemos com o único propósito de encurtar distâncias e facilitar 
              o dia a dia dos trabalhadores, estudantes e famílias de toda a nossa região.
            </p>
            <p className="sobre-history-card__text">
              Com uma frota focada na mais alta segurança viária e motoristas treinados, operamos diariamente conectando 
              Registro, Cajati, Jacupiranga, Eldorado, Iguape, Miracatu, Juquiá e demais cidades intermunicipais, 
              sempre buscando oferecer um serviço de qualidade contínua.
            </p>
          </div>

          {/* Values Grid */}
          <h2 className="sobre-values__title">Nossos Pilares</h2>
          <div className="sobre-values-grid sobre-values-grid--spaced">
            <div className="sobre-panel hover-scale">
              <div className="sobre-panel__icon sobre-panel__icon--verde">
                <ShieldCheck size={32} />
              </div>
              <h3 className="sobre-panel__title">Segurança Viária</h3>
              <p className="sobre-panel__text">
                Manutenção preventiva rigorosa acompanhada por telemetria e motoristas profissionais treinados regularmente para garantir uma viagem extremamente tranquila.
              </p>
            </div>
            
            <div className="sobre-panel hover-scale">
              <div className="sobre-panel__icon sobre-panel__icon--dourado">
                <CalendarDays size={32} />
              </div>
              <h3 className="sobre-panel__title">Pontualidade</h3>
              <p className="sobre-panel__text">
                Total respeito ao seu tempo e compromissos. Trabalhamos intensamente frotas reserva para cumprir todos os horários exatos da nossa tabela diária.
              </p>
            </div>
          </div>

          <div className="sobre-info-card">
            <div className="sobre-info-card__head">
              <AlertTriangle size={20} />
              <strong>Informacoes ao passageiro centralizadas</strong>
            </div>
            <p className="sobre-info-card__text">
              Conteudos sobre cartoes de beneficio, documentacao escolar, gratuidade e regras de uso agora ficam na pagina de atendimento.
            </p>
            <Link href="/atendimento" className="btn btn--primary">Ir para Atendimento ao Passageiro</Link>
          </div>

          {/* Rapido Perus Banner */}
          <div className="sobre-group-banner">
            <div className="sobre-group-banner__content">
              <div className="sobre-group-banner__kicker">Governança Corporativa</div>
              <h3 className="sobre-group-banner__title">Membro do Grupo Rápido Perus</h3>
              <p className="sobre-group-banner__text">
                A Porto de Registro integra rigorosamente o <strong>Grupo Rápido Perus</strong>. Essa união de excelência garante ao usuário do Vale do Ribeira suporte operacional de ponta, 
                renovação constante de frota e credibilidade de administração de ponta a ponta.
              </p>
            </div>
            <div className="sobre-group-banner__logo-wrap">
              <Image src="/images/logos/logo_rapido_perus.png" alt="Rápido Perus" width={160} height={50} className="sobre-group-banner__logo" />
            </div>
          </div>

          {/* Contact Section */}
          <div className="sobre-contacts__header">
            <h2 className="sobre-contacts__title">Contato & Atendimento</h2>
            <p className="sobre-contacts__subtitle">Canais de comunicação para dúvidas, sugestões e informações.</p>
          </div>

          <div className="sobre-contacts-grid sobre-contacts-grid--spaced">
            {/* Contato Operacional - Porto de Registro */}
            <div className="sobre-contact-card">
              <div className="sobre-contact-card__head sobre-contact-card__head--operacao">
                <h3 className="sobre-contact-card__title sobre-contact-card__title--operacao">
                  <BusFront size={20} />
                  Operação Porto de Registro
                </h3>
              </div>
              <div className="sobre-contact-card__body">
                <div className="sobre-contact-card__company">
                  <div className="sobre-contact-card__label">Razão Social</div>
                  <div className="sobre-contact-card__name">Porto de Registro Transportes Ltda</div>
                  <div className="sobre-contact-card__doc">CNPJ: 21.966.029/0001-00</div>
                </div>

                <div className="sobre-contact-card__list">
                  <a href="https://wa.me/5511977795599" target="_blank" rel="noopener noreferrer" className="sobre-contact-card__item hover-bg-cinza-100">
                    <Smartphone size={20} color="var(--verde-600)" />
                    <div>
                      <div className="sobre-contact-card__item-label">WhatsApp / SAC</div>
                      <div className="sobre-contact-card__item-value">(11) 97779-5599</div>
                    </div>
                  </a>
                  
                  <a href="https://www.instagram.com/portoregistro/" target="_blank" rel="noopener noreferrer" className="sobre-contact-card__item hover-bg-cinza-100">
                    <Instagram size={20} color="var(--verde-600)" />
                    <div>
                      <div className="sobre-contact-card__item-label">Instagram Oficial</div>
                      <div className="sobre-contact-card__item-value">@portoregistro</div>
                    </div>
                  </a>

                  <div className="sobre-contact-card__item sobre-contact-card__item--static">
                    <MapPin size={20} color="var(--verde-600)" className="sobre-contact-card__item-icon" />
                    <div>
                      <div className="sobre-contact-card__item-label">Sede Operacional</div>
                      <div className="sobre-contact-card__address">
                        Rodovia Regis Bittencourt<br />
                        Registro - SP, 11.900-000
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contato Corporativo - Rápido Perus */}
            <div className="sobre-contact-card">
              <div className="sobre-contact-card__head sobre-contact-card__head--corporativo">
                <h3 className="sobre-contact-card__title sobre-contact-card__title--corporativo">
                  <Globe size={20} />
                  Administração Corporativa
                </h3>
              </div>
              <div className="sobre-contact-card__body">
                <div className="sobre-contact-card__company">
                  <div className="sobre-contact-card__label">Holding</div>
                  <div className="sobre-contact-card__name">Grupo Rápido Perus</div>
                </div>

                <div className="sobre-contact-card__list">
                  <div className="sobre-contact-card__item sobre-contact-card__item--static">
                    <Phone size={20} color="var(--cinza-600)" />
                    <div>
                      <div className="sobre-contact-card__item-label">Telefone Central</div>
                      <div className="sobre-contact-card__item-value">(11) 3915-6464</div>
                    </div>
                  </div>
                  
                  <a href="https://www.rapidoperus.com.br/" target="_blank" rel="noopener noreferrer" className="sobre-contact-card__item hover-bg-cinza-100">
                    <Globe size={20} color="var(--cinza-600)" />
                    <div>
                      <div className="sobre-contact-card__item-label">Site Institucional</div>
                      <div className="sobre-contact-card__item-value">rapidoperus.com.br</div>
                    </div>
                  </a>

                  <div className="sobre-contact-card__item sobre-contact-card__item--static">
                    <MapPin size={20} color="var(--cinza-600)" className="sobre-contact-card__item-icon" />
                    <div>
                      <div className="sobre-contact-card__item-label">Sede Administrativa</div>
                      <div className="sobre-contact-card__address">
                        Alameda das Laranjeiras, 18<br />
                        Laranjeiras, Caieiras - SP, 07740-505
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="sobre-creditos">
            <strong>Créditos do desenvolvimento:</strong> site desenvolvido por{' '}
            <a
              href="https://vftheodoro.github.io/Portfolio/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Victor Theodoro (vftheodoro)
            </a>
            .
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
