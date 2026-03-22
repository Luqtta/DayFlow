# DayFlow

DayFlow e uma aplicacao web full stack para gestao de rotinas e tarefas, com autenticao, historico de desempenho, score e ranking.

<div align="center">
  <img width="1861" height="916" alt="DayFlow preview" src="https://github.com/user-attachments/assets/00bcd64b-12eb-4b46-ba85-278b45a76fc5" />
</div>

## Visao Geral

- Backend REST com autenticacao JWT e controle de acesso.
- CRUD de rotinas e tarefas (pontuais, recorrentes e por agenda).
- Monitoramento diario por data, mes e historico paginado.
- Sistema de score com grade (S, A, B, C, D) e ranking global.
- Fluxos de conta: registro, verificacao de email e recuperacao de senha.

## Arquitetura

```text
dayflow/
|-- backend/    # API REST em Java + Spring Boot
`-- frontend/   # SPA em React + TypeScript
```

## Stack Tecnologica

### Backend

| Tecnologia | Versao/uso |
|---|---|
| Java | 21 |
| Spring Boot | 3.5.11 |
| Spring Security | Autenticacao e autorizacao |
| JWT (jjwt) | Emissao e validacao de token |
| Spring Data JPA | Persistencia |
| PostgreSQL | Banco de dados relacional |
| Maven | Build e gerenciamento de dependencias |

### Frontend

| Tecnologia | Versao/uso |
|---|---|
| React | 19 |
| TypeScript | 5.9 |
| Vite | 8 |
| Tailwind CSS | 4 |
| React Router DOM | 7 |
| Sonner | Notificacoes |
| Lucide React | Iconografia |

## Requisitos

- Java 21
- Maven 3.9+ (ou wrapper `./mvnw`)
- Node.js 20+
- npm
- Docker (opcional, para subir PostgreSQL rapidamente)

## Configuracao de Ambiente (Backend)

O backend usa `backend/src/main/resources/application.yaml` com fallback para variaveis de ambiente:

| Variavel | Valor padrao |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/dayflow` |
| `SPRING_DATASOURCE_USERNAME` | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | `postgres` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` |
| `BREVO_API_KEY` | sem padrao |
| `BREVO_FROM_EMAIL` | sem padrao |
| `BREVO_FROM_NAME` | sem padrao |

Observacao: os fluxos de email (verificacao e recuperacao) dependem da configuracao Brevo.

## Execucao Local

### 1. Clonar repositorio

```bash
git clone https://github.com/Luqtta/dayflow.git
cd dayflow
```

### 2. Subir PostgreSQL com Docker

```bash
docker run --name dayflow-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=dayflow \
  -p 5432:5432 \
  -d postgres
```

### 3. Rodar backend

```bash
cd backend
./mvnw spring-boot:run
```

API local: `http://localhost:8080`

### 4. Rodar frontend

```bash
cd frontend
npm install
npm run dev
```

App local: `http://localhost:5173`

### 5. Observacao importante para desenvolvimento local

No estado atual do repositorio, o frontend referencia a API de producao diretamente (`https://dayflow-production-724d.up.railway.app`) em varios arquivos de `frontend/src`.

Para usar o backend local, substitua essas URLs por `http://localhost:8080` (idealmente centralizando em uma variavel de ambiente no frontend).

## Endpoints Principais da API

Todas as rotas fora de `/auth/**` exigem autenticacao JWT.

| Metodo | Rota | Descricao |
|---|---|---|
| POST | `/auth/register` | Criar conta |
| POST | `/auth/verify-email` | Verificar email com codigo |
| POST | `/auth/resend-code` | Reenviar codigo de verificacao |
| POST | `/auth/forgot-password` | Solicitar codigo de redefinicao |
| POST | `/auth/reset-password` | Redefinir senha |
| POST | `/auth/login` | Autenticar usuario |
| GET | `/auth/profile` | Obter perfil autenticado |
| PATCH | `/auth/avatar` | Atualizar avatar |
| PATCH | `/auth/name` | Atualizar nome |
| PATCH | `/auth/password` | Atualizar senha |
| GET | `/routines` | Listar rotinas |
| POST | `/routines` | Criar rotina |
| GET | `/routines/{id}` | Buscar rotina por id |
| PUT | `/routines/{id}` | Atualizar rotina |
| DELETE | `/routines/{id}` | Remover rotina |
| GET | `/tasks` | Listar tarefas |
| POST | `/tasks` | Criar tarefa |
| GET | `/tasks/today` | Listar tarefas do dia |
| GET | `/tasks/date` | Listar tarefas por data |
| GET | `/tasks/month` | Listar tarefas por mes |
| GET | `/tasks/routine/{routineId}` | Listar tarefas por rotina |
| PATCH | `/tasks/{id}/complete` | Marcar tarefa como concluida |
| PUT | `/tasks/{id}` | Atualizar tarefa |
| DELETE | `/tasks/{id}` | Remover tarefa |
| GET | `/score/me` | Obter score do usuario autenticado |
| GET | `/score/ranking` | Obter ranking global |
| GET | `/score/history?page=0&size=30` | Historico paginado de progresso |

## Modelo de Score

Janela de calculo: ultimos 30 dias.

Componentes do score:

- `avgScore = avgCompletion * 100 * 0.60 * coverage`
- `streakScore = (streak / 30) * 100 * 0.25`
- `perfectScore = (perfectDays / 30) * 100 * 0.15`
- `scoreFinal = round(avgScore + streakScore + perfectScore)` limitado entre 0 e 100

Grades:

| Grade | Intervalo |
|---|---|
| S | 90-100 |
| A | 75-89 |
| B | 55-74 |
| C | 30-54 |
| D | 0-29 |

## Licenca

Projeto sob licenca MIT. Consulte [`LICENSE`](LICENSE).
