import type { RodoviariaInfo } from '@/types';

export const RODOVIARIAS_VALE_RIBEIRA: RodoviariaInfo[] = [
  {
    cidade: 'Registro',
    nome: 'Terminal Rodoviario de Registro',
    endereco: 'Rua Meraldo Previde, 823 - Centro, Registro/SP, CEP 11900-000',
    telefone: '(13) 3521-2195',
    funcionamento: 'Consulte no terminal',
    observacoes:
      'Ha divergencia de telefone em cadastros publicos (tambem aparece (13) 3821-2195). Em caso de duvida, confirme antes da viagem.',
    nivel_confianca: 'medio',
    fontes: [
      {
        label: 'Bing - card do terminal',
        url: 'https://www.bing.com/search?q=rodoviaria+de+registro+sp+telefone+endereco',
      },
      {
        label: 'Rodoviaria.pro - Registro',
        url: 'https://rodoviaria.pro/rodoviaria-de-registro-sp/',
      },
    ],
  },
  {
    cidade: 'Jacupiranga',
    nome: 'Terminal Rodoviaria de Jacupiranga',
    endereco: 'Av. Vinte e Tres de Junho, 490 - Jacupiranga/SP, CEP 11940-000',
    telefone: '(13) 98819-6939',
    funcionamento: 'Consulte no terminal',
    observacoes:
      'Numero e endereco conferem com card de mapa e listagem de venda de passagens.',
    nivel_confianca: 'alto',
    fontes: [
      {
        label: 'Bing - card do terminal',
        url: 'https://www.bing.com/search?q=rodoviaria+de+jacupiranga+sp+telefone+endereco',
      },
      {
        label: 'BlaBlaCar - estacao Jacupiranga',
        url: 'https://www.blablacar.com.br/bus/stations/jacupiranga-sp',
      },
    ],
  },
  {
    cidade: 'Cajati',
    nome: 'Terminal Rodoviario de Cajati',
    endereco: 'Rua Teodoro Ferreira Machado - Cajati/SP, CEP 11950-000',
    telefone: '(13) 99768-2166',
    funcionamento: 'Consulte no terminal',
    observacoes:
      'Algumas fontes citam endereco alternativo (Rua Bico do Pato).',
    nivel_confianca: 'medio',
    fontes: [
      {
        label: 'Bing - card do terminal',
        url: 'https://www.bing.com/search?q=rodoviaria+de+cajati+sp+telefone+endereco',
      },
      {
        label: 'BlaBlaCar - estacao Cajati',
        url: 'https://www.blablacar.com.br/bus/stations/cajati-sp',
      },
    ],
  },
  {
    cidade: 'Eldorado',
    nome: 'Terminal Rodoviario de Eldorado',
    endereco: 'Av. Vinte e Quatro de Dezembro, 650 - Eldorado/SP, CEP 11960-000',
    telefone: '(13) 3455-1638',
    funcionamento: 'Consulte no terminal',
    observacoes:
      'Dados consistentes em diretorios locais e card de mapa.',
    nivel_confianca: 'alto',
    fontes: [
      {
        label: 'Bing - card do terminal',
        url: 'https://www.bing.com/search?q=rodoviaria+de+eldorado+sp+telefone+endereco',
      },
      {
        label: 'Boa Empresa - Eldorado',
        url: 'https://www.boaempresa.com.br/local/terminal-rodoviario-de-eldorado-rodoviarias-eldorado-sp-32463',
      },
    ],
  },
  {
    cidade: 'Sete Barras',
    nome: 'Rodoviaria de Sete Barras',
    endereco: 'Av. Dr. Julio Prestes - Sete Barras/SP',
    telefone: 'Nao confirmado nas fontes consultadas',
    funcionamento: 'Consulte na Prefeitura',
    observacoes:
      'Endereco aparece em guia local; telefone nao foi confirmado em fonte oficial acessivel.',
    nivel_confianca: 'baixo',
    fontes: [
      {
        label: 'Bing - busca Sete Barras',
        url: 'https://www.bing.com/search?q=rodoviaria+de+sete+barras+sp+telefone+endereco',
      },
      {
        label: 'Guia Facil - Sete Barras',
        url: 'https://guiafacil.com/site/rodoviaria-de-sete-barras/sete-barras/sp/95901473',
      },
      {
        label: 'Prefeitura de Sete Barras',
        url: 'http://www.setebarras.sp.gov.br/',
      },
    ],
  },
  {
    cidade: 'Iguape',
    nome: 'Terminal Rodoviario de Iguape',
    endereco: 'Rua Prof. Bento Pereira Rocha, 102 - Iguape/SP, CEP 11920-000',
    telefone: '(13) 3841-1209 / (13) 3841-2334',
    funcionamento: 'Consulte no terminal',
    observacoes:
      'Ha variacao de telefone entre fontes. Endereco aparece de forma consistente.',
    nivel_confianca: 'medio',
    fontes: [
      {
        label: 'Bing - card do terminal',
        url: 'https://www.bing.com/search?q=rodoviaria+de+iguape+sp+telefone+endereco',
      },
      {
        label: 'TodosNegocios - Iguape',
        url: 'https://br.todosnegocios.com/pt/terminal-rodovi%C3%A1rio-de-iguap%C3%A9-13-3841-2334',
      },
    ],
  },
  {
    cidade: 'Pariquera-Acu',
    nome: 'Terminal Rodoviario de Pariquera-Acu',
    endereco: 'Nao confirmado nas fontes consultadas',
    telefone: 'Nao confirmado nas fontes consultadas',
    funcionamento: 'Consulte na Prefeitura/terminal',
    observacoes:
      'Foram encontradas paginas de referencia, mas sem extracao consistente de endereco e telefone no rastreio automatico.',
    nivel_confianca: 'baixo',
    fontes: [
      {
        label: 'Bing - busca Pariquera-Acu',
        url: 'https://www.bing.com/search?q=Terminal+Rodovi%C3%A1rio+de+Pariquera-A%C3%A7u+telefone',
      },
      {
        label: 'Rodoviaria.pro - Pariquera-Acu',
        url: 'https://rodoviaria.pro/rodoviaria-de-pariquera-acu-sp/',
      },
    ],
  },
  {
    cidade: 'Miracatu',
    nome: 'Rodoviaria de Miracatu',
    endereco: 'Rua Dr. Emilio Martins Ribeiro, 160 - Miracatu/SP, CEP 11850-000',
    telefone: '(13) 3847-3231',
    funcionamento: 'Consulte no terminal',
    observacoes:
      'Dados com boa consistencia no card de mapa de busca.',
    nivel_confianca: 'alto',
    fontes: [
      {
        label: 'Bing - card do terminal',
        url: 'https://www.bing.com/search?q=rodoviaria+de+miracatu+sp+telefone+endereco',
      },
      {
        label: 'Rodoviaria.pro - Miracatu',
        url: 'https://rodoviaria.pro/rodoviaria-de-miracatu-sp/',
      },
    ],
  },
  {
    cidade: 'Juquia',
    nome: 'Terminal Rodoviario de Juquia',
    endereco: 'Avenida Presidente Getulio Vargas - Juquia/SP, CEP 11800-000',
    telefone: '(13) 2844-1744',
    funcionamento: 'Consulte no terminal',
    observacoes:
      'BlaBlaCar cita endereco alternativo (Av. Venancio Dias Patricio, 804) e telefone indisponivel.',
    nivel_confianca: 'medio',
    fontes: [
      {
        label: 'Bing - busca Juquia',
        url: 'https://www.bing.com/search?q=Terminal+Rodovi%C3%A1rio+de+Juqui%C3%A1+telefone',
      },
      {
        label: 'GuiaTelefone - Juquia',
        url: 'https://www.guiatelefone.com/juquia-sp/transporte-aereo/3682139/terminal-rodoviario',
      },
    ],
  },
];
