# jwt-api — API do Sistema de Biblioteca

Node.js 20+ · Express 5 · Sequelize · SQLite · JWT (access token + refresh token com rotação)

## Como instalar

```bash
npm install
cp .envex .env        # no Windows: copy .envex .env
npm start             # SERVIDOR RODANDO http://localhost:3000
```

Na primeira execução o banco `database.sqlite` é criado e o **admin do seed** é gerado:

| E-mail | Senha |
|---|---|
| admin@biblioteca.com | 123456 |

(altere em `SEED_ADMIN_*` no `.env`). Se você já tinha um `database.sqlite` da versão antiga, **apague o arquivo** antes de subir (as tabelas mudaram).

## Variáveis de ambiente (`.envex`)

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | chave do access token |
| `JWT_REFRESH_SECRET` | chave do refresh token (diferente da primeira) |
| `JWT_ACCESS_EXPIRES` | validade do access token (padrão `15m`; use `30s` só na demonstração) |
| `PORT` | porta da API (3000) |
| `CORS_ORIGIN` | origens liberadas, separadas por vírgula (front em `http://localhost:5173`) |
| `SEED_ADMIN_*` | dados do primeiro administrador |

## Estrutura

```
auth/ user/ category/ author/ book/ reader/ loan/ report/   router → controller → service → model
models/index.js    associações (hasMany, belongsTo, belongsToMany)
config/db.js       conexão Sequelize/SQLite
utils/             HttpError, errorHandler, helpers
seed.js            cria o primeiro admin
scripts/           atrasar-emprestimo.js (apoio à demonstração)
```

## Endpoints

`(A)` = somente administrador. Tudo exige `Authorization: Bearer <accessToken>`, exceto login/refresh/logout.

| Método | Rota | Descrição |
|---|---|---|
| POST | /v1/auth/login | `{accessToken, refreshToken, user}` |
| POST | /v1/auth/refresh | renova o par (rotação) |
| POST | /v1/auth/logout | revoga o refresh token |
| GET | /v1/auth/me | usuário logado |
| GET/POST | /v1/user (A) | listar / criar atendente |
| PUT/PATCH | /v1/user/:id (A) | editar atendente |
| PATCH | /v1/user/:id/active (A) | ativar/desativar `{active:true|false}` |
| GET/POST/PUT/DELETE | /v1/categories | CRUD (escrita A) |
| GET/POST/PUT/DELETE | /v1/authors | CRUD (escrita A) |
| GET/POST/PUT/DELETE | /v1/books | CRUD com autores e categoria (escrita A) |
| GET | /v1/books?title=&categoryId=&authorId=&available=true | busca com filtros |
| GET/POST/PUT | /v1/readers | leitores |
| GET | /v1/readers/:id/loans | histórico do leitor |
| POST | /v1/loans | `{bookId, readerId}` |
| PATCH | /v1/loans/:id/return | devolução (calcula multa) |
| GET | /v1/loans?status=ATIVO\|ATRASADO\|DEVOLVIDO | listar |
| GET | /v1/reports/dashboard (A) | totais |

Coleção pronta: `biblioteca.postman_collection.json` (importa no Thunder Client, Postman e Insomnia).

## Decisões tomadas

- **Access token** (15 min, `JWT_SECRET`) com `id, name, email, isAdmin`. **Refresh token** (7 dias, `JWT_REFRESH_SECRET`, com `jti` aleatório) salvo na tabela `refresh_tokens`.
- **Rotação**: a cada `/auth/refresh` o refresh antigo é revogado e um novo par é emitido. **Reuso** de um refresh já revogado revoga todas as sessões do usuário (detecção de roubo).
- **`logout_list` removida**: com access token curto (15 min) e refresh revogável no banco, a blacklist do access token não é necessária; o logout revoga o refresh token e o access token morre sozinho em até 15 min. Desativar um atendente também revoga todos os refresh tokens dele.
- Middleware devolve **401** para token ausente/inválido/expirado (o front usa isso para renovar) e **403** quando atendente acessa rota de administrador.
- **Bug do login corrigido**: o usuário é buscado antes de comparar a senha; e-mail inexistente responde 401.
- Senhas com `bcryptjs` (JS puro, evita erro de compilação no Windows).
- **Empréstimo e devolução usam `sequelize.transaction`**, então o estoque nunca fica inconsistente.
- `ATRASADO` é calculado (`dueDate < agora` e sem `returnDate`); a coluna `status` é atualizada antes de cada consulta/operação.
- **Multa**: R$ 1,00 por dia de atraso, contando dia iniciado (`ceil`).
- Exclusão de categoria/autor/livro com vínculos devolve **409** com mensagem clara. Livro com histórico de empréstimos também não pode ser excluído (preserva o histórico).
- O refresh token é guardado no banco em texto (assinado e com validade). Em produção o ideal seria guardar só o hash.

## Demonstração do refresh e da multa

- Para mostrar o token expirando, ponha `JWT_ACCESS_EXPIRES=30s` no `.env` e reinicie a API (volte para `15m` depois).
- Para mostrar multa sem esperar 7 dias: `npm run atrasar -- <idDoEmprestimo> 3` deixa o empréstimo vencido há 3 dias; ao devolver, a multa é R$ 3,00.
