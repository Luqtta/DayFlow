# DayFlow — Backend

API REST desenvolvida em **Java 21 + Spring Boot 3.5** para o aplicativo DayFlow, um sistema de gerenciamento de rotinas pessoais com gamificação.

## 🚀 Tecnologias

- Java 21
- Spring Boot 3.5
- Spring Security + JWT
- Spring Data JPA + Hibernate
- PostgreSQL
- Maven
- Docker (ambiente de desenvolvimento)

## 📋 Funcionalidades

- ✅ Autenticação completa com JWT
- ✅ Registro e login de usuários
- ✅ CRUD de rotinas com categorias
- ✅ CRUD de tarefas (pontuais e recorrentes)
- ✅ Checklist diário com progresso
- ✅ Sistema de score e grades (S, A, B, C, D)
- ✅ Ranking global de usuários
- ✅ Upload de avatar via Cloudinary
- ✅ Histórico de desempenho

## 🔧 Como rodar localmente

### Pré-requisitos
- Java 21
- Maven
- Docker

### 1. Suba o banco de dados
```bash
docker run --name dayflow-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=dayflow \
  -p 5432:5432 -d postgres
```

### 2. Configure o `application.yaml`
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/dayflow
    username: postgres
    password: postgres
```

### 3. Rode o projeto
```bash
mvn spring-boot:run
```

A API estará disponível em `https://dayflow-production-724d.up.railway.app`

## 📡 Endpoints principais

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

## ⚙️ Configuração de produção (Railway)

A JVM, sem flags, limita o heap a ~25% da RAM do container (`MaxRAMPercentage` padrão),
desperdiçando memória disponível e arriscando `OutOfMemoryError` sob carga. Defina a
variável de ambiente abaixo no painel do Railway (**Service → Variables**) — ela é lida
automaticamente pela JVM no startup, sem alterar o comando de start:

```
JAVA_TOOL_OPTIONS=-XX:MaxRAMPercentage=75 -XX:+UseG1GC -XX:+HeapDumpOnOutOfMemoryError
```

- `-XX:MaxRAMPercentage=75` — usa até 75% da RAM do container como heap.
- `-XX:+UseG1GC` — coletor G1 (melhor para heaps maiores e pausas previsíveis).
- `-XX:+HeapDumpOnOutOfMemoryError` — gera heap dump em caso de OOM, facilitando o diagnóstico.

> ⚠️ Este passo é manual no dashboard do Railway (variáveis de runtime não são commitadas
> no repositório). Após adicionar, faça um redeploy do serviço.

## 👨‍💻 Desenvolvido por

**Lucas** — [@Luqtta](https://github.com/Luqtta)