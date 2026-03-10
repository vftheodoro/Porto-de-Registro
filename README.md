# Porto de Registro - Sistema de Horarios e Atendimento

Aplicacao web institucional e operacional da Porto de Registro para consulta de horarios, linhas, tarifas, avisos e informacoes de atendimento no Vale do Ribeira.

## Analise Atual do Site

Status geral: estavel e funcional, com boa cobertura de fluxos publicos e painel admin operando com autenticacao por cookie assinado.

Pontos fortes:
- Busca inteligente com rotas diretas e conexoes.
- Filtro dinamico de destinos validos por origem e tipo de dia.
- Leitura de horario em tempo real no cliente (proximo horario, passado/futuro).
- Geracao de PDF operacional pronta para impressao.
- Painel admin para manutencao de `data.json`.
- Testes automatizados para rotas criticas (`busca` e `destinos`) e validacao estrutural de dados.

Pontos de atencao:
- Tentativa de login admin sem limite de taxa (rate-limit).
- Comparacao de senha admin direta (sem hash e sem tempo constante).
- Middleware do Next com aviso de deprecacao para migracao futura para `proxy`.
- Em producao (Vercel), gravacao local de arquivo nao e permitida e depende de fluxo manual de download/commit do JSON.

## Stack Tecnica

- Next.js 16 (App Router)
- React 19
- TypeScript
- CSS global com design system
- Vitest
- ESLint
- jsPDF + jspdf-autotable
- Base de dados em arquivo (`data.json`)

## Numeros do Projeto (data.json)

- Paradas: 12
- Linhas: 9
- Linhas ativas: 9
- Avisos: 6
- Cidades cobertas: 12
- Horarios cadastrados: 250
- Tarifas cadastradas: 30

## Paginas Publicas

- `/` Home com avisos, busca principal, frota, linhas e area do passageiro.
- `/horarios` Busca inteligente focada em planejamento de viagem.
- `/linhas` Lista de linhas com resumo operacional.
- `/linhas/[slug]` Detalhe da linha (ida/volta, horarios, paradas, tarifas, PDF).
- `/tarifas` Tabela de tarifas por linha + politicas de pagamento.
- `/atendimento` Central de servicos para passageiro.
- `/rodoviarias` Base de terminais/rodoviarias com nivel de confianca e fontes.
- `/sobre` Historia, pilares e contatos institucionais.

## APIs Publicas

- `GET /api/public/paradas`
   - Retorna cidades/paradas usadas por linhas ativas (sem duplicidade de cidade).

- `GET /api/public/destinos?origem=...&tipo=...`
   - Retorna apenas destinos alcancaveis para aquela origem e tipo de dia.

- `GET /api/public/busca?origem=...&destino=...&tipo=...`
   - Retorna `resultados` (direto) e `conexoes` (quando nao ha direto).
   - Regra importante: se existir opcao direta valida, conexoes sao suprimidas.

- `GET /api/public/linhas`
   - Lista linhas ativas em payload leve para listagem.

- `GET /api/public/avisos`
   - Suporta grupos (`informativos`, `todos`) alem do default operacional.

- `GET /api/public/pdf?linha_id=...&tipo=...`
   - Gera PDF com horarios, chegada estimada, tarifas e observacoes.

## Painel Administrativo

Paginas:
- `/admin`
- `/admin/avisos`
- `/admin/paradas`
- `/admin/linhas`
- `/admin/linhas/[id]`
- `/admin/login`

APIs:
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/data`
- `POST /api/admin/data`

Seguranca atual:
- Middleware protege `/admin/:path*` (exceto login).
- Sessao por cookie `HttpOnly` assinado com HMAC (`ADMIN_SECRET`).

Observacao operacional:
- Em dev, `POST /api/admin/data` grava `data.json` no disco.
- Em Vercel, a API retorna orientacao para baixar JSON e commitar no Git.

## Regras de Negocio Relevantes

- Tipo de dia: `UTIL`, `SABADO`, `DOMINGO`, `FERIADO`.
- Deteccao automatica do tipo de dia no cliente com feriados nacionais fixos e moveis.
- Conexao exige tempo minimo de transferencia.
- Destinos mostrados no front dependem da origem e do tipo de dia.
- Estado da busca e sincronizado entre Home e pagina de Horarios via `localStorage`.

## Estrutura de Projeto

- `data.json`: base principal de operacao.
- `scripts/validate.js`: validacao estrutural e semantica de dados.
- `src/app`: paginas App Router + APIs.
- `src/components`: componentes publicos e admin.
- `src/lib`: utilitarios de dados, auth, planner de rotas.
- `src/types`: contratos TypeScript.
- `test`: testes de API e validacao.

## Como Rodar

```bash
npm install
npm run dev
```

Aplicacao local: `http://localhost:3000`

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Desenvolvimento local |
| `npm run build` | Build de producao |
| `npm run start` | Servidor de producao local |
| `npm run lint` | Lint |
| `npm run test` | Testes |
| `npm run test:watch` | Testes em watch |
| `node scripts/validate.js` | Validar `data.json` |

## Configuracao de Ambiente

Crie `.env.local`:

```env
ADMIN_PASSWORD=sua_senha_forte
ADMIN_SECRET=uma_chave_longa_com_16_ou_mais_chars
```

## Qualidade e Validacao

Checklist recomendado antes de deploy:
- `node scripts/validate.js`
- `npm run test`
- `npm run build`

## Deploy

Deploy recomendado: Vercel.

Observacao importante: como a escrita em arquivo local nao funciona em runtime serverless, o fluxo de atualizacao de dados em producao deve considerar download do JSON pelo admin e commit no repositorio.

## Documentacao Completa

Foi gerado o arquivo detalhado em texto na raiz:

- `DOCUMENTACAO_COMPLETA.txt`
