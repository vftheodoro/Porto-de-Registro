import Link from 'next/link';
import Image from 'next/image';
import { Smartphone, MapPin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand" style={{ marginBottom: '1rem' }}>
              <Image 
                src="/images/logos/logo_porto_branca.png" 
                alt="Porto de Registro" 
                width={60} 
                height={60} 
                style={{ objectFit: 'contain' }} 
              />
            </div>
            <p className="footer__description" style={{ marginBottom: '1.5rem' }}>
              Empresa de transporte intermunicipal de passageiros do Vale do Ribeira,
              interior de São Paulo. Servindo a região com segurança e compromisso
              há décadas.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid var(--cinza-800)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
               <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cinza-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                 Uma empresa
               </div>
               <a href="https://www.rapidoperus.com.br/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', transition: 'opacity var(--transicao-rapida)' }} className="hover-opacity">
                 <Image 
                   src="/images/logos/logo_rapido_perus.png" 
                   alt="Grupo Rápido Perus" 
                   width={120} 
                   height={30} 
                   style={{ objectFit: 'contain' }} 
                 />
               </a>
            </div>
          </div>

          <div>
            <h4 className="footer__title">Navegação</h4>
            <ul className="footer__links">
              <li><Link href="/" className="footer__link">Início</Link></li>
              <li><Link href="/horarios" className="footer__link">Horários</Link></li>
              <li><Link href="/atendimento" className="footer__link">Atendimento</Link></li>
              <li><Link href="/linhas" className="footer__link">Linhas</Link></li>
              <li><Link href="/tarifas" className="footer__link">Tarifas</Link></li>
              <li><Link href="/sobre" className="footer__link">Sobre</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer__title">Contato</h4>
            <ul className="footer__links">
              <li><a href="https://wa.me/5511977795599" target="_blank" rel="noopener noreferrer" className="footer__link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Smartphone size={16} /> WhatsApp: (11) 97779-5599</a></li>
              <li><a href="https://www.instagram.com/portoregistro/" target="_blank" rel="noopener noreferrer" className="footer__link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Instagram size={16} /> @portoregistro</a></li>
              <li><span className="footer__link" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }}/> 
                <span>
                  Rodovia Regis Bittencourt <br />
                  Registro - SP, 11.900-000
                </span>
              </span></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} Porto de Registro Transportes Ltda. CNPJ: 21.966.029/0001-00. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
