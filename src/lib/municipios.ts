const BRASOES_MUNICIPIOS: Record<string, string> = {
  registro: '/images/municipios/prefeitura_registro.png',
  cajati: '/images/municipios/prefeitura_cajati.png',
  jacupiranga: '/images/municipios/prefeitura_jacupiranga.png',
  eldorado: '/images/municipios/prefeitura_eldorado.png',
  iguape: '/images/municipios/prefeitura_iguape.png',
  miracatu: '/images/municipios/prefeitura_miracatu.png',
  juquia: '/images/municipios/prefeitura_juqia.webp',
  pariquera: '/images/municipios/prefeitura_pariquera.png',
  iporanga: '/images/municipios/prefeitura_iporanga.png',
  sete_barras: '/images/municipios/prefeitura_sete_barras.png',
};

function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function getBrasaoMunicipio(cidade?: string | null): string | null {
  if (!cidade) return null;

  const chave = normalizarTexto(cidade);

  if (BRASOES_MUNICIPIOS[chave]) {
    return BRASOES_MUNICIPIOS[chave];
  }

  // Compatibilidade com nomes compostos como "pariquera-acu".
  if (chave.includes('pariquera')) {
    return BRASOES_MUNICIPIOS.pariquera;
  }

  if (chave.includes('sete_barras')) {
    return BRASOES_MUNICIPIOS.sete_barras;
  }

  return null;
}
