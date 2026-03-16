# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"我AI学英语" — An AI-powered English learning platform for Chinese students, delivered as a WeChat Mini Program. Supports five roles: Student, Parent, Teacher, Principal, and Admin.

## Tech Stack

- **Backend**: Java 17 + Spring Boot 3.2.0 + MyBatis Plus + MySQL + Redis
- **Frontend**: Native WeChat Mini Program (原生微信小程序)
- **Auth**: JWT + WeChat OAuth2
- **AI**: 讯飞 (speech recognition), OpenAI/Claude (quiz generation)
- **Storage**: Tencent COS

> Note: `/docs/plans/` references a Python FastAPI stack — this was the planned architecture. The actual implementation uses Java Spring Boot.

## Commands

### Backend

```bash
cd backend

# Run
mvn spring-boot:run

# Build
mvn clean package

# Run tests
mvn test

# Run a single test class
mvn test -Dtest=ClassName

# Run a single test method
mvn test -Dtest=ClassName#methodName
```

### Frontend (WeChat Mini Program)

Use **WeChat Developer Tools** to open the `miniprogram/` directory. There is no CLI build step — the IDE handles compilation, ES6 transpilation, and PostCSS.

## Architecture

### Backend (`backend/src/main/java/com/english/app/`)

- `controller/` — REST endpoints: Auth, Campus, Membership, Payment, Principal
- `service/` — Business logic
- `entity/` — JPA/MyBatis entities (User, Book, etc.)
- `dto/` — Request/response DTOs
- `mapper/` — MyBatis Plus mappers
- `config/` — Spring Security config, JWT interceptor

Key config: `backend/src/main/resources/application.yml`
DB schema: `backend/src/main/resources/schema.sql`
Seed data: `backend/src/main/resources/init.sql`

Default ports: API on `8080`, MySQL on `3306`, Redis on `6379`.

### Frontend (`miniprogram/`)

Pages are organized by role under `pages/`:
- `pages/auth/` — WeChat login flow
- `pages/student/` — 13 pages: books, reading, AI quiz, learning reports
- `pages/parent/` — 5 pages: child binding, task assignment, progress monitoring
- `pages/teacher/` — 3 pages: book upload, class management, assignments
- `pages/principal/` — 5 pages: content review (two-level approval), institution management
- `pages/common/` — Shared pages: assessment, institution, payment

`app.js` currently uses mock data. `app.json` defines all routes and the tab bar.

## Key Business Flows

1. **Auth**: WeChat OAuth → backend validates → issues JWT → role-based routing
2. **Content Review**: Teacher uploads book → Principal reviews → Admin approves (two-level)
3. **Reading Evaluation**: Student reads → 讯飞 ASR scores pronunciation → result saved
4. **AI Quiz**: Book content → OpenAI/Claude generates questions → student answers → report generated
5. **Parent Binding**: Parent links to child account → monitors progress, assigns tasks

## Docs

- `docs/architecture/系统架构设计.md` — Full system design, DB schema, API specs, security model
- `docs/requirements/产品需求规格说明书.md` — Product requirements, MVP scope, user roles
- `docs/design/` — Frontend UI/UX design specifications
