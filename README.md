# Job Hub

풀스택 사이드 프로젝트 레포지토리입니다.

React(Vite) 기반 프론트엔드, Express 기반 백엔드, MongoDB를 사용하며 Docker Compose로 개발 환경을 구성하였습니다.

---

## 📁 프로젝트 구조

```
job-hub/
├─ job-hub-frontend/   # 프론트엔드 (Vite + React)
├─ job-hub-backend/    # 백엔드 (Node.js + Express)
├─ docker-compose.yml
└─ README.md
```

---

## 🐳 개발 환경 실행 방법 (Docker)

### 1. Docker 및 Docker Compose 설치

* Docker Desktop 설치 필요

### 2. 프로젝트 실행

첫 실행 시

```bash
docker compose up --build
```

그 후 실행 시

```bash
docker compose up
```

다시 빌드가 필요한 경우

Dockerfile 수정

package.json / package-lock.json 변경

Node 버전 변경 (FROM node:...)

새 라이브러리 설치

---

## 🛠 기술 스택

* Frontend: React, Vite, TypeScript
* Backend: Node.js, Express
* Database: MongoDB
* Infra: Docker, Docker Compose

---

## 📄 기타

이 프로젝트는 학습 및 사이드 프로젝트 목적이며,
점진적으로 기능을 확장해 나갈 예정입니다.
