# DayFlow — Frontend

Interface web desenvolvida em **React + TypeScript + Tailwind CSS** para o aplicativo DayFlow, um sistema de gerenciamento de rotinas pessoais com gamificação.

## 🚀 Tecnologias

- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router DOM
- Sonner (notificações)
- Lucide React (ícones)
- Cloudinary (upload de imagens)

## 📋 Páginas

- 🏠 **Landing Page** — apresentação do produto
- 🔐 **Login / Registro** — autenticação de usuários
- 📊 **Dashboard** — visão geral do dia, progresso e ranking
- 📋 **Rotinas** — gerenciar rotinas e tarefas
- 📈 **Histórico** — desempenho ao longo do tempo
- 🏆 **Ranking** — ranking global de usuários
- 👤 **Perfil** — score, grade e estatísticas
- ⚙️ **Configurações** — editar nome, senha e foto

## 🔧 Como rodar localmente

### Pré-requisitos
- Node.js 18+
- Backend DayFlow rodando em `localhost:8080`

### 1. Instale as dependências
```bash
npm install --legacy-peer-deps
```

### 2. Rode o projeto
```bash
npm run dev
```

O app estará disponível em `http://localhost:5173`

## 🏗️ Estrutura do projeto
```
src/
├── components/     # Componentes reutilizáveis
│   ├── Sidebar.tsx
│   ├── UserMenu.tsx
│   └── AvatarUpload.tsx
├── pages/          # Páginas da aplicação
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Routines.tsx
│   ├── History.tsx
│   ├── Ranking.tsx
│   ├── UserProfile.tsx
│   └── Settings.tsx
└── App.tsx         # Rotas da aplicação
```

## 🎨 Preview

> Dashboard com progresso, grade e ranking em tempo real

## 👨‍💻 Desenvolvido por

**Lucas** — [@Luqtta](https://github.com/Luqtta)