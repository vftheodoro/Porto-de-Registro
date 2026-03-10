import Link from 'next/link';
import Image from 'next/image';
import { Smartphone, MapPin, Instagram } from 'lucide-react';
import { withBasePath } from '@/lib/asset-path';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand footer__brand--spaced">
              <Image 
                src={withBasePath('/images/logos/logo_porto_branca.png')} 
                alt="Porto de Registro" 
                width={60} 
                height={60} 
                className="footer__brand-image"
              />
            </div>
            <p className="footer__description footer__description--spaced">
              Empresa de transporte intermunicipal de passageiros do Vale do Ribeira,
              interior de São Paulo. Servindo a região com segurança e compromisso
              há décadas.
            </p>
            <div className="footer__company">
               <div className="footer__company-label">
                 Uma empresa
               </div>
               <a href="https://www.rapidoperus.com.br/" target="_blank" rel="noopener noreferrer" className="footer__company-link">
                 <Image 
                   src={withBasePath('/images/logos/logo_rapido_perus.png')} 
                   alt="Grupo Rápido Perus" 
                   width={120} 
                   height={30} 
                   className="footer__company-image"
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
              <li><a href="https://wa.me/5511977795599" target="_blank" rel="noopener noreferrer" className="footer__link footer__link--contact"><Smartphone size={16} /> WhatsApp: (11) 97779-5599</a></li>
              <li><a href="https://www.instagram.com/portoregistro/" target="_blank" rel="noopener noreferrer" className="footer__link footer__link--contact"><Instagram size={16} /> @portoregistro</a></li>
              <li><span className="footer__link footer__link--contact footer__link--address">
                <MapPin size={16} className="footer__icon"/> 
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
          <p className="footer__credits">
            Desenvolvimento do site por{' '}
            <a
              href="https://vftheodoro.github.io/Portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__credits-link"
            >
              Victor Theodoro (vftheodoro)
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
