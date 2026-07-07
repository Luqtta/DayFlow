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

No Railway a JVM "enxerga" a RAM do container (plano até 8 GB) e, por padrão, dimensiona
o heap em ~25% disso → ~2 GB de heap parado, e o billing é por GB de RAM usada. Para um
app pequeno isso custa caro à toa. **Cape o heap em valor absoluto** (não em porcentagem)
no painel do Railway (**Service → Variables**):

```
JAVA_TOOL_OPTIONS=-Xmx384m -XX:MaxMetaspaceSize=128m -XX:+UseSerialGC
```

- `-Xmx384m` — heap fixo e pequeno, independente do tamanho do container. Suficiente para o tráfego atual; suba para `-Xmx512m` se ocorrer `OutOfMemoryError`.
- `-XX:+UseSerialGC` — menor footprint de memória que o G1 para apps pequenos.
- `-XX:MaxMetaspaceSize=128m` — limita o metaspace.

Reduz o RSS de ~1.2–2.4 GB para ~0.4–0.5 GB (≈3–5x mais barato no Railway).

> ⚠️ Passo manual no dashboard (variáveis de runtime não vão no repositório). Após alterar, faça redeploy.

## 👨‍💻 Desenvolvido por

**Lucas** — [@Luqtta](https://github.com/Luqtta)