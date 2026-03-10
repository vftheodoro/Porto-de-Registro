# Porto de Registro — Horários de Ônibus

Site institucional e operacional da **Porto de Registro**, empresa de transporte intermunicipal de ônibus no Vale do Ribeira (SP). O site permite consultar horários, rotas, tarifas e avisos operacionais.

## Tecnologias

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- CSS com variáveis (design system verde/dourado)
- Dados em `data.json` (Git-CMS — sem banco de dados)

## Como rodar

```bash
# Instalar dependências
npm install

# Desenvolvimento (com Turbopack)
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Como atualizar os dados (horários, linhas, avisos)

Os dados do site vêm do arquivo **`data.json`** na raiz do projeto. Para alterar horários, paradas, tarifas ou avisos:

1. **Edite** o arquivo `data.json` no seu editor.
2. **Valide** o JSON antes de enviar:
   ```bash
   node scripts/validate.js
   ```
   O script verifica estrutura, IDs de paradas, formato de horários (HH:MM), tipos de dia (UTIL, SABADO, DOMINGO, FERIADO) e tarifas. Corrija qualquer erro exibido.
3. **Commit e push** para o repositório. Se o projeto estiver conectado à Vercel, o site será atualizado automaticamente após o deploy.

## Scripts

| Comando | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção (após `build`) |
| `npm run lint` | ESLint |
| `npm run test` | Testes automatizados (Vitest) |
| `npm run test:watch` | Testes em modo watch |
| `node scripts/validate.js` | Valida o `data.json` antes de commitar |

## Área administrativa (restrita)

Existe um painel em **`/admin`** para editar avisos, paradas e linhas (horários e tarifas). Ele **não aparece em nenhum link do site** — apenas quem souber o endereço e tiver a senha pode acessar.

1. Crie um arquivo **`.env.local`** na raiz (copie de `.env.example`):
   - `ADMIN_PASSWORD` — senha forte para entrar no painel.
   - `ADMIN_SECRET` — chave secreta com pelo menos 16 caracteres (para assinatura do cookie de sessão).
2. Acesse **http://localhost:3000/admin** (ou seu domínio/admin). Você será redirecionado para a tela de login.
3. Em **desenvolvimento**, ao salvar no admin, o `data.json` é atualizado no disco. Em **produção (Vercel)** o sistema não pode gravar arquivo; use o botão "Baixar data.json" e faça commit no GitHub com o conteúdo baixado.

**Segurança:** o painel é protegido por senha e cookie assinado. Não divulgue a URL nem a senha.

## Estrutura principal

- **`data.json`** — Fonte de dados (paradas, linhas com horários e tarifas, avisos).
- **`src/app/`** — Páginas: `/` (home + busca), `/horarios`, `/linhas`, `/linhas/[slug]`, `/tarifas`, `/sobre`; `/admin` (painel restrito).
- **`src/app/api/public/`** — APIs: paradas, busca (origem/destino/tipo de dia), PDF de horários.
- **`src/app/api/admin/`** — Login, logout e leitura/gravação de dados (protegidos por autenticação).
- **`src/lib/db.ts`** — Leitura do `data.json` no servidor.

## Deploy (Vercel)

O projeto está preparado para deploy na Vercel. Conecte o repositório e faça o deploy; o build usa `next build`. Para domínio customizado (ex.: portoderegistro.com.br), configure o DNS no painel da Vercel.
