const fs = require('fs');
const path = require('path');

const dataPath = path.join(process.cwd(), 'data.json');

console.log('Validando data.json...\n');

try {
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const db = JSON.parse(rawData);

  let errors = 0;
  let warnings = 0;

  function error(msg) { console.log(`[ERRO] ${msg}`); errors++; }
  function warn(msg) { console.log(`[AVISO] ${msg}`); warnings++; }

  // 1. Check Root Objects
  if (!db.paradas || !Array.isArray(db.paradas)) error('Módulo "paradas" ausente ou não é array');
  if (!db.linhas || !Array.isArray(db.linhas)) error('Módulo "linhas" ausente ou não é array');
  if (!db.avisos || !Array.isArray(db.avisos)) error('Módulo "avisos" ausente ou não é array');

  if (errors > 0) process.exit(1);

  // 2. Map stops by ID for quick lookup
  const stopsMap = new Map();
  db.paradas.forEach(p => {
    if (!p.id || !p.nome || !p.cidade) error(`Parada inválida encontrada: ${JSON.stringify(p)}`);
    if (stopsMap.has(p.id)) error(`ID de parada duplicado: ${p.id}`);
    stopsMap.set(p.id, p);
  });

  // 3. Validate Lines
  const lineCodes = new Set();
  const lineSlugs = new Set();
  
  db.linhas.forEach(linha => {
    if (!linha.id || !linha.codigo || !linha.nome || !linha.slug) {
        error(`Linha com campos obrigatórios ausentes: ${JSON.stringify(linha)}`);
        return;
    }
    
    if (lineCodes.has(linha.codigo)) error(`Código de linha duplicado: ${linha.codigo}`);
    lineCodes.add(linha.codigo);

    if (lineSlugs.has(linha.slug)) error(`Slug de linha duplicado: ${linha.slug}`);
    lineSlugs.add(linha.slug);

    if (typeof linha.ativa !== 'boolean') warn(`Linha ${linha.codigo} não tem campo 'ativa' booleano.`);

    // 3.1 Validate Linha.paradas
    if (!Array.isArray(linha.paradas) || linha.paradas.length < 2) {
        error(`Linha ${linha.codigo} precisa ter pelo menos 2 paradas na rota.`);
    } else {
        linha.paradas.forEach(lp => {
            if (!stopsMap.has(lp.parada_id)) {
                error(`Linha ${linha.codigo} referencia parada_id ${lp.parada_id} que não existe em 'paradas'.`);
            }
        });
    }

    // 3.2 Validate Linha.horarios
    if (!Array.isArray(linha.horarios) || linha.horarios.length === 0) {
        warn(`Linha ${linha.codigo} não tem horários cadastrados.`);
    } else {
        linha.horarios.forEach(h => {
             if (!h.hora_saida.match(/^([01]\d|2[0-3]):([0-5]\d)$/)) {
                 error(`Horário '${h.hora_saida}' na linha ${linha.codigo} tem formato inválido. Use HH:MM.`);
             }
             if (!['UTIL', 'SABADO', 'DOMINGO', 'FERIADO'].includes(h.tipo)) {
                 error(`Tipo de dia inválido '${h.tipo}' na linha ${linha.codigo} horário ${h.hora_saida}.`);
             }
        });
    }

    // 3.3 Validate Linha.tarifas
    if (!Array.isArray(linha.tarifas)) {
        warn(`Linha ${linha.codigo} não tem array de tarifas definido.`);
    } else {
        linha.tarifas.forEach(t => {
            if (!stopsMap.has(t.origem_id)) error(`Tarifa linha ${linha.codigo}: origem_id ${t.origem_id} não existe.`);
            if (!stopsMap.has(t.destino_id)) error(`Tarifa linha ${linha.codigo}: destino_id ${t.destino_id} não existe.`);
            if (typeof t.valor !== 'number') error(`Tarifa linha ${linha.codigo}: valor R$${t.valor} deve ser formato numérico.`);
        });
    }
  });

  // 4. Validate Avisos
  db.avisos.forEach(aviso => {
     if (!aviso.id || !aviso.titulo || !aviso.conteudo) error(`Aviso inválido: ${JSON.stringify(aviso)}`);
     if (!['URGENTE', 'INFORMATIVO', 'FERIADO'].includes(aviso.tipo)) {
         error(`Tipo de aviso inválido '${aviso.tipo}' no aviso ${aviso.id}`);
     }
  });

  console.log('\n=======================================');
  if (errors === 0) {
     console.log(`✅ Sucesso! O arquivo data.json está válido.`);
     if (warnings > 0) console.log(`⚠️ Foram encontrados ${warnings} avisos para verificar.`);
     process.exit(0);
  } else {
     console.log(`❌ Falha! Foram encontrados ${errors} erros estruturais.`);
     console.log('Corrija o data.json antes de enviar pro GitHub.');
     process.exit(1);
  }

} catch (err) {
  console.log(`[ERRO CRÍTICO] O arquivo data.json contém JSON malformado (faltando vírgula, aspas, etc).`);
  console.log(err.message);
  process.exit(1);
}
