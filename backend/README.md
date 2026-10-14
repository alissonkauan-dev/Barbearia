# Backend Barber API

API REST para gestão de barbearia, usuários, agendamentos, serviços, horários e dashboard.

## Stack

- Node.js + TypeScript
- Fastify
- Prisma ORM
- PostgreSQL
- JWT + cookies
- Vitest

## Requisitos

- Node.js 20+
- PostgreSQL rodando localmente ou em cloud
- Variáveis de ambiente configuradas em `.env`

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte formato:

```env
NODE_ENV=DEVELOPMENT
PORT=3111
HOST=0.0.0.0

DATABASE_URL="postgres://user:password@localhost:5432/barbearia?schema=public"

JWT_SECRET="seu_jwt_secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="seu_refresh_secret"
JWT_REFRESH_EXPIRES_IN="1h"
COOKIES_SECRET="seu_cookie_secret"
```

## Scripts

```bash
npm install
npm run dev
npm run test
npm run coverage
```

## Inicialização

```bash
npm run dev
```

O servidor será iniciado em:

```text
http://0.0.0.0:3111
```

## Health check

```http
GET /health
```

Resposta esperada:

```json
{
  "ok": true,
  "message": "server up",
  "timestamp": "2026-10-14T00:00:00.000Z"
}
```

## Documentação interativa

A API expõe a documentação Swagger em:

```text
http://0.0.0.0:3111/docs
```

A rota da documentação está protegida por autenticação JWT. É necessário enviar um token válido no header `Authorization: Bearer <token>`.

Você pode usar a interface para testar endpoints e visualizar a OpenAPI gerada automaticamente.

## Base da API

Todos os endpoints ficam sob o prefixo:

```text
/api/v1
```

## Autenticação

A API usa JWT no header:

```http
Authorization: Bearer <token>
```

Alguns endpoints também usam cookies para refresh tokens.

## Endpoints

### Usuários

```http
POST /api/v1/usuario/criar
POST /api/v1/usuario/login
POST /api/v1/usuario/refresh
PATCH /api/v1/usuario/atualizar
GET /api/v1/usuario/listar
GET /api/v1/usuario/lista-agendamentos
PATCH /api/v1/usuario/delete
```

- `POST /api/v1/usuario/criar`: cria usuário
- `POST /api/v1/usuario/login`: autentica e gera token
- `POST /api/v1/usuario/refresh`: renova sessão/token
- `PATCH /api/v1/usuario/atualizar`: atualiza perfil do usuário autenticado
- `GET /api/v1/usuario/listar`: lista usuários (admin)
- `GET /api/v1/usuario/lista-agendamentos`: lista agendamentos do usuário
- `PATCH /api/v1/usuario/delete`: desativa/exclui usuário

### Serviços

```http
POST /api/v1/services/create
PATCH /api/v1/services/:serviceId/update
PATCH /api/v1/services/:serviceId/inactivate
```

- Autorização: admin / super admin

### Barbeiros

```http
POST /api/v1/barber/create
PATCH /api/v1/barber/update/:barberId
GET /api/v1/barber/list
PATCH /api/v1/barber/delete/:barberId
```

- Autorização: admin / super admin

### Bloqueios de agenda

```http
POST /api/v1/blocks
GET /api/v1/blocks
PATCH /api/v1/blocks/:blockId/:isActive
```

- Autorização: barbeiro / admin / super admin

### Agendamentos

```http
POST /api/v1/appointment/create
GET /api/v1/appointment/list
PATCH /api/v1/appointment/update/:appointId
PATCH /api/v1/appointment/aprove/:appointId
PATCH /api/v1/appointment/cancel/:appointId
```

- Autorização conforme regra por rota

### Horários da barbearia

```http
GET /api/v1/barbershop/:barbershopId/hours
PUT /api/v1/barbershop/:barbershopId/hours
```

- Autorização: admin / super admin no update

### Barbearias

```http
GET /api/v1/barbearias
GET /api/v1/barbearia/:barbershopId/Services
GET /api/v1/barbearia/:barbershopId/barbeiros
GET /api/v1/barbearia/:barbershopId/services/search
PATCH /api/v1/barbearia/dados-cadastrais/:barbershopId
POST /api/v1/barberia-nova
PATCH /api/v1/barbearia/dados-cadastrais/:barbershopId/deleted
```

- Autorização: conforme rota e perfil

### Dashboard

```http
GET /api/v1/barbershop/:barbershopId/dashboard
```

- Autorização: admin / super admin / barbeiro

## Códigos de resposta

- `200` OK
- `201` Criado
- `400` Requisição inválida
- `401` Não autenticado / token inválido
- `403` Sem permissão
- `500` Erro interno do servidor

## Estrutura principal

```text
src/
  app.ts
  serve.ts
  env/
  database/
  middlewares/
  modules/
  utils/
```

## Observações

- O projeto usa Fastify plugins para modularização.
- O servidor que sobe em produção deve ter o banco PostgreSQL acessível e as variáveis de ambiente corretamente preenchidas.
- Os testes estão configurados com Vitest e podem ser executados via `npm run test` ou `npm run coverage`.
