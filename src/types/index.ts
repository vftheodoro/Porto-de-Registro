export type TipoDia = 'UTIL' | 'SABADO' | 'DOMINGO' | 'FERIADO';
export type TipoAviso = 'URGENTE' | 'INFORMATIVO' | 'FERIADO';

export interface Parada {
  id: number;
  nome: string;
  cidade: string;
}

export interface LinhaParada {
  parada_id: number;
  ordem: number;
  tempo_minutos: number;
}

export interface Horario {
  id: number;
  hora_saida: string;
  tipo: TipoDia;
  observacao?: string;
}

export interface Tarifa {
  origem_id: number;
  destino_id: number;
  valor: number;
}

export interface Linha {
  id: number;
  codigo: string;
  nome: string;
  slug: string;
  descricao?: string;
  ativa: boolean;
  paradas: LinhaParada[];
  horarios: Horario[];
  tarifas: Tarifa[];
}

export interface Aviso {
  id: number;
  titulo: string;
  conteudo: string;
  tipo: TipoAviso;
  ativo: boolean;
}

export interface Database {
  paradas: Parada[];
  linhas: Linha[];
  avisos: Aviso[];
}

// ----------------------------------------------------------------------
// Interfaces combinadas com joins lógicos (usadas no frontend)
// ----------------------------------------------------------------------

export interface LinhaParadaComDetalhes extends LinhaParada {
  parada_nome: string;
  parada_cidade: string;
}

export interface TarifaComDetalhes extends Tarifa {
  origem_nome: string;
  destino_nome: string;
}

export interface LinhaCompleta extends Omit<Linha, 'paradas' | 'tarifas'> {
  cidades: string; // ex: "Registro, Cajati"
  qtd_util: number;
  qtd_sabado: number;
  qtd_domingo: number;
  paradas: LinhaParadaComDetalhes[];
  tarifas: TarifaComDetalhes[];
}

export interface ResultadoBusca {
  linha: Omit<Linha, 'paradas' | 'horarios' | 'tarifas'>;
  horarios: Horario[];
  paradas: LinhaParadaComDetalhes[];
  tarifa: number | null;
  tempo_estimado: number | null;
}
