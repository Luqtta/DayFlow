<div align="center">

# 🌊 DayFlow

**Organize sua rotina, evolua todos os dias.**

DayFlow é uma aplicação web full stack de gerenciamento de rotinas pessoais com sistema de gamificação, ranking global e acompanhamento de progresso diário.

<img width="1861" height="916" alt="Image" src="https://github.com/user-attachments/assets/00bcd64b-12eb-4b46-ba85-278b45a76fc5" />

</div>

---

## ✨ Funcionalidades

- 🔐 **Autenticação segura** — registro e login com JWT
- 📋 **Rotinas personalizadas** — crie rotinas com categorias como estudo, saúde e trabalho
- ✅ **Checklist diário** — marque tarefas e acompanhe seu progresso em tempo real
- 🔁 **Tarefas recorrentes** — tarefas que aparecem automaticamente todo dia
- 📊 **Histórico** — veja seu desempenho nos últimos dias com gráficos animados
- 🏆 **Sistema de score e grades** — ganhe grades de D até S baseado no seu desempenho
- 🌍 **Ranking global** — compete com outros usuários pelo topo
- 👤 **Perfil com avatar** — personalize seu perfil com foto via Cloudinary
- ⚙️ **Configurações** — edite nome, senha e foto de perfil

---

## 🛠️ Stack

### Backend
| Tecnologia | Uso |
|---|---|
| Java 21 | Linguagem principal |
| Spring Boot 3.5 | Framework web |
| Spring Security | Autenticação e autorização |
| JWT | Tokens de autenticação |
| Spring Data JPA | Acesso ao banco de dados |
| PostgreSQL | Banco de dados relacional |
| Maven | Gerenciador de dependências |
| Docker | Ambiente de desenvolvimento |

### Frontend
| Tecnologia | Uso |
|---|---|
| React 18 | Framework de UI |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização |
| Vite | Build tool |
| React Router DOM | Navegação |
| Sonner | Notificações toast |
| Lucide React | Ícones |
| Cloudinary | Upload de imagens |

---

## 📁 Estrutura do projeto
```
dayflow/
├── backend/                  # API REST em Java + Spring Boot
│   └── src/main/java/
│       └── com/dayflow/backend/
│           ├── config/       # JWT, Security, Filtros
│           ├── controller/   # Endpoints da API
│           ├── dto/          # Objetos de transferência
│           ├── model/        # Entidades do banco
│           ├── repository/   # Acesso ao banco
│           └── service/      # Regras de negócio
│
└── dayflow-frontend/         # Interface em React + TypeScript
    └── src/
        ├── components/       # Componentes reutilizáveis
        └── pages/            # Páginas da aplicação
```

---

## 🚀 Como rodar localmente

### Pré-requisitos

- [Java 21](https://adoptium.net/)
- [Maven](https://maven.apache.org/)
- [Node.js 18+](https://nodejs.org/)
- [Docker](https://www.docker.com/)

### 1. Clone o repositório
```bash
git clone https://github.com/Luqtta/dayflow.git
cd dayflow
```

### 2. Suba o banco de dados com Docker
```bash
docker run --name dayflow-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=dayflow \
  -p 5432:5432 -d postgres
```

### 3. Rode o backend
```bash
cd backend
mvn spring-boot:run
```

A API estará disponível em `https://dayflow-production-724d.up.railway.app`

### 4. Rode o frontend
```bash
cd dayflow-frontend
npm install --legacy-peer-deps
npm run dev
```

O app estará disponível em `http://localhost:5173`

---

## 📡 Principais endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Criar conta |
| POST | `/auth/login` | Fazer login |
| GET | `/auth/profile` | Perfil do usuário |
| PATCH | `/auth/avatar` | Atualizar avatar |
| PATCH | `/auth/name` | Atualizar nome |
| PATCH | `/auth/password` | Alterar senha |
| GET | `/routines` | Listar rotinas |
| POST | `/routines` | Criar rotina |
| PUT | `/routines/{id}` | Editar rotina |
| DELETE | `/routines/{id}` | Deletar rotina |
| GET | `/tasks/today` | Tarefas do dia |
| POST | `/tasks` | Criar tarefa |
| PUT | `/tasks/{id}` | Editar tarefa |
| PATCH | `/tasks/{id}/complete` | Concluir tarefa |
| DELETE | `/tasks/{id}` | Deletar tarefa |
| GET | `/score/me` | Score do usuário |
| GET | `/score/ranking` | Ranking global |

---

## 🎮 Sistema de Score

O score é calculado com base em 3 fatores:

| Fator | Peso | Descrição |
|-------|------|-----------|
| Média geral | 40% | % médio de tarefas concluídas por dia |
| Streak | 40% | Dias consecutivos com pelo menos 1 tarefa concluída |
| Dias perfeitos | 20% | Dias com 100% das tarefas concluídas |

### Grades

| Grade | Pontuação | Descrição |
|-------|-----------|-----------|
| 🏆 S | 90 - 100 | Lendário |
| ⭐ A | 75 - 89 | Excelente |
| 👍 B | 55 - 74 | Bom |
| 📈 C | 35 - 54 | Regular |
| 🔰 D | 0 - 34 | Iniciante |

---

## 👨‍💻 Desenvolvedor

Feito com 💜 por **Lucas** — 16 anos, desenvolvedor full stack em formação.

[![GitHub](https://img.shields.io/badge/GitHub-Luqtta-purple?style=flat&logo=github)](https://github.com/Luqtta)

---

<div align="center">
  <sub>DayFlow — Organize sua rotina, evolua todos os dias 🌊</sub>
</div>
