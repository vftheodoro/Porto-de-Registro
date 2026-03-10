import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Clock, Smartphone, MapPin, Instagram, Phone, Globe, CalendarDays, BusFront, AlertTriangle, CreditCard, Ban } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre a Empresa | Porto de Registro',
  description: 'Conheça a história e o compromisso da Porto de Registro com o transporte no Vale do Ribeira.',
};

export default function SobrePage() {
  return (
    <>
      <Header />

      {/* Hero Section */}
      <section style={{ 
        position: 'relative',
        background: 'linear-gradient(135deg, var(--verde-800) 0%, var(--verde-600) 100%)', 
        color: 'white', 
        padding: '5rem 0 6rem 0', 
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Decorative Element */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.05, transform: 'rotate(-15deg)' }}>
          <BusFront size={400} />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: 'var(--raio-full)', marginBottom: '1.5rem', fontSize: 'var(--texto-sm)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--dourado-400)' }}></span>
            Tradição & Confiança
          </div>
          <h1 style={{ fontSize: 'var(--texto-4xl)', fontFamily: 'var(--fonte-titulo)', marginBottom: '1rem', fontWeight: 800 }}>
            Conheça a Porto de Registro
          </h1>
          <p style={{ fontSize: 'var(--texto-xl)', color: 'var(--branco)', opacity: 0.9, maxWidth: 650, margin: '0 auto', lineHeight: 1.6 }}>
            Movimentando o Vale do Ribeira com segurança rigorosa, pontualidade britânica e imenso respeito pelos passageiros.
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '0 0 var(--esp-12) 0', marginTop: '-3rem', position: 'relative', zIndex: 10 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          
          {/* Main History Card */}
          <div className="card" style={{ padding: '3rem', marginBottom: '2.5rem', boxShadow: 'var(--sombra-lg)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 48, height: 48, background: 'var(--verde-50)', borderRadius: 'var(--raio-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--verde-600)' }}>
                <Clock size={24} />
              </div>
              <h2 style={{ color: 'var(--verde-800)', fontSize: 'var(--texto-2xl)', margin: 0 }}>Nossa História</h2>
            </div>
            
            <p style={{ color: 'var(--cinza-700)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '1.5rem' }}>
              Há anos, a <strong>Porto de Registro</strong> tem sido peça fundamental no desenvolvimento e na integração 
              das cidades do Vale do Ribeira. Nascemos com o único propósito de encurtar distâncias e facilitar 
              o dia a dia dos trabalhadores, estudantes e famílias de toda a nossa região.
            </p>
            <p style={{ color: 'var(--cinza-700)', lineHeight: 1.8, fontSize: '1.05rem' }}>
              Com uma frota focada na mais alta segurança viária e motoristas treinados, operamos diariamente conectando 
              Registro, Cajati, Jacupiranga, Eldorado, Iguape, Miracatu, Juquiá e demais cidades intermunicipais, 
              sempre buscando oferecer um serviço de qualidade contínua.
            </p>
          </div>

          {/* Values Grid */}
          <h2 style={{ color: 'var(--cinza-900)', fontSize: 'var(--texto-xl)', marginBottom: '1.5rem', textAlign: 'center' }}>Nossos Pilares</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--raio-xl)', border: '1px solid var(--cinza-200)', transition: 'transform var(--transicao-normal), box-shadow var(--transicao-normal)' }} className="hover-scale">
              <div style={{ width: 60, height: 60, background: 'var(--verde-50)', borderRadius: 'var(--raio-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--verde-600)' }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ color: 'var(--verde-800)', marginBottom: '0.75rem', fontSize: '1.25rem' }}>Segurança Viária</h3>
              <p style={{ color: 'var(--cinza-600)', lineHeight: 1.6 }}>
                Manutenção preventiva rigorosa acompanhada por telemetria e motoristas profissionais treinados regularmente para garantir uma viagem extremamente tranquila.
              </p>
            </div>
            
            <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--raio-xl)', border: '1px solid var(--cinza-200)', transition: 'transform var(--transicao-normal), box-shadow var(--transicao-normal)' }} className="hover-scale">
              <div style={{ width: 60, height: 60, background: 'var(--dourado-50)', borderRadius: 'var(--raio-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--dourado-700)' }}>
                <CalendarDays size={32} />
              </div>
              <h3 style={{ color: 'var(--verde-800)', marginBottom: '0.75rem', fontSize: '1.25rem' }}>Pontualidade</h3>
              <p style={{ color: 'var(--cinza-600)', lineHeight: 1.6 }}>
                Total respeito ao seu tempo e compromissos. Trabalhamos intensamente frotas reserva para cumprir todos os horários exatos da nossa tabela diária.
              </p>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 'var(--raio-xl)', border: '1px solid var(--cinza-200)', padding: '2rem', marginBottom: '4rem', boxShadow: 'var(--sombra-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: 'var(--verde-700)' }}>
              <AlertTriangle size={20} />
              <strong>Informacoes ao passageiro centralizadas</strong>
            </div>
            <p style={{ color: 'var(--cinza-700)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Conteudos sobre cartoes de beneficio, documentacao escolar, gratuidade e regras de uso agora ficam na pagina de atendimento.
            </p>
            <Link href="/atendimento" className="btn btn--primary">Ir para Atendimento ao Passageiro</Link>
          </div>

          {/* Rapido Perus Banner */}
          <div style={{ background: 'linear-gradient(to right, var(--cinza-900), var(--cinza-800))', borderRadius: 'var(--raio-xl)', padding: '2.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', justifyContent: 'space-between', boxShadow: 'var(--sombra-lg)', marginBottom: '4rem' }}>
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cinza-400)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Governança Corporativa</div>
              <h3 style={{ fontSize: 'var(--texto-xl)', marginBottom: '1rem', color: 'var(--branco)' }}>Membro do Grupo Rápido Perus</h3>
              <p style={{ color: 'var(--cinza-300)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                A Porto de Registro integra rigorosamente o <strong>Grupo Rápido Perus</strong>. Essa união de excelência garante ao usuário do Vale do Ribeira suporte operacional de ponta, 
                renovação constante de frota e credibilidade de administração de ponta a ponta.
              </p>
            </div>
            <div style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: 'var(--raio-md)' }}>
              <Image src="/images/logos/logo_rapido_perus.png" alt="Rápido Perus" width={160} height={50} style={{ objectFit: 'contain' }} />
            </div>
          </div>

          {/* Contact Section */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--verde-800)', fontSize: 'var(--texto-3xl)', marginBottom: '0.5rem' }}>Contato & Atendimento</h2>
            <p style={{ color: 'var(--cinza-600)' }}>Canais de comunicação para dúvidas, sugestões e informações.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {/* Contato Operacional - Porto de Registro */}
            <div style={{ background: 'white', borderRadius: 'var(--raio-xl)', border: '1px solid var(--cinza-200)', overflow: 'hidden' }}>
              <div style={{ background: 'var(--verde-50)', padding: '1.5rem', borderBottom: '1px solid var(--verde-100)' }}>
                <h3 style={{ color: 'var(--verde-800)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BusFront size={20} />
                  Operação Porto de Registro
                </h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--cinza-500)', marginBottom: '0.25rem' }}>Razão Social</div>
                  <div style={{ color: 'var(--cinza-900)', fontWeight: 500 }}>Porto de Registro Transportes Ltda</div>
                  <div style={{ color: 'var(--cinza-600)', fontSize: '0.9rem' }}>CNPJ: 21.966.029/0001-00</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <a href="https://wa.me/5511977795599" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--cinza-800)', textDecoration: 'none', padding: '0.75rem', background: 'var(--cinza-50)', borderRadius: 'var(--raio-md)', transition: 'background var(--transicao-rapida)' }} className="hover-bg-cinza-100">
                    <Smartphone size={20} color="var(--verde-600)" />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--cinza-500)' }}>WhatsApp / SAC</div>
                      <div style={{ fontWeight: 600 }}>(11) 97779-5599</div>
                    </div>
                  </a>
                  
                  <a href="https://www.instagram.com/portoregistro/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--cinza-800)', textDecoration: 'none', padding: '0.75rem', background: 'var(--cinza-50)', borderRadius: 'var(--raio-md)', transition: 'background var(--transicao-rapida)' }} className="hover-bg-cinza-100">
                    <Instagram size={20} color="var(--verde-600)" />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--cinza-500)' }}>Instagram Oficial</div>
                      <div style={{ fontWeight: 600 }}>@portoregistro</div>
                    </div>
                  </a>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--cinza-800)', padding: '0.75rem', background: 'var(--cinza-50)', borderRadius: 'var(--raio-md)' }}>
                    <MapPin size={20} color="var(--verde-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--cinza-500)' }}>Sede Operacional</div>
                      <div style={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
                        Rodovia Regis Bittencourt<br />
                        Registro - SP, 11.900-000
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contato Corporativo - Rápido Perus */}
            <div style={{ background: 'white', borderRadius: 'var(--raio-xl)', border: '1px solid var(--cinza-200)', overflow: 'hidden' }}>
              <div style={{ background: 'var(--cinza-100)', padding: '1.5rem', borderBottom: '1px solid var(--cinza-200)' }}>
                <h3 style={{ color: 'var(--cinza-800)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Globe size={20} />
                  Administração Corporativa
                </h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--cinza-500)', marginBottom: '0.25rem' }}>Holding</div>
                  <div style={{ color: 'var(--cinza-900)', fontWeight: 500 }}>Grupo Rápido Perus</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--cinza-800)', padding: '0.75rem', background: 'var(--cinza-50)', borderRadius: 'var(--raio-md)' }}>
                    <Phone size={20} color="var(--cinza-600)" />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--cinza-500)' }}>Telefone Central</div>
                      <div style={{ fontWeight: 600 }}>(11) 3915-6464</div>
                    </div>
                  </div>
                  
                  <a href="https://www.rapidoperus.com.br/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--cinza-800)', textDecoration: 'none', padding: '0.75rem', background: 'var(--cinza-50)', borderRadius: 'var(--raio-md)', transition: 'background var(--transicao-rapida)' }} className="hover-bg-cinza-100">
                    <Globe size={20} color="var(--cinza-600)" />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--cinza-500)' }}>Site Institucional</div>
                      <div style={{ fontWeight: 600 }}>rapidoperus.com.br</div>
                    </div>
                  </a>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--cinza-800)', padding: '0.75rem', background: 'var(--cinza-50)', borderRadius: 'var(--raio-md)' }}>
                    <MapPin size={20} color="var(--cinza-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--cinza-500)' }}>Sede Administrativa</div>
                      <div style={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
                        Alameda das Laranjeiras, 18<br />
                        Laranjeiras, Caieiras - SP, 07740-505
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />

      <style dangerouslySetInnerHTML={{__html: `
        .hover-scale { transform: translateY(0); }
        .hover-scale:hover { transform: translateY(-4px); box-shadow: var(--sombra-md); }
        .hover-bg-cinza-100:hover { background: var(--cinza-100) !important; }
      `}} />
    </>
  );
}
