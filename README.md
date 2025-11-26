# Vulnerable Node.js Web App (Security Training)

**[결과 보고서 다운로드 (PDF)](./reports/Vulnerable_App_Pentest_Report_2025.pdf)**

이 프로젝트는 **웹 취약점의 원리를 이해하고 모의해킹 실습을 진행하기 위해 의도적으로 취약하게 제작된 Node.js 웹 애플리케이션**입니다.
OWASP Top 10의 주요 취약점들을 직접 구현하였으며, 공격 시나리오 검증을 목적으로 합니다.

> ** 주의 (Warning)**
> 이 코드는 보안 취약점을 포함하고 있습니다. 실제 서비스나 운영 환경에 배포하지 마십시오.
> This project is intentionally vulnerable. Do NOT deploy this in a production environment.

---

## 🛠️ 기술 스택 (Tech Stack)
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Frontend:** EJS (Server-side Rendering)
- **Tool:** Burp Suite (for Pentesting)

---

## 주요 취약점 (Vulnerabilities)

이 프로젝트에는 다음과 같은 4가지 핵심 취약점이 구현되어 있습니다.

| 취약점 (Vulnerability) | 발생 위치 (Endpoint) | 설명 (Description) |
| :--- | :--- | :--- |
| **SQL Injection** | `/auth/login` | 로그인 시 입력값 검증 부재로 인한 **인증 우회 (Authentication Bypass)** |
| **Stored XSS** | `/post/write` | 게시글 작성 시 스크립트 태그 필터링 미적용으로 인한 **악성 스크립트 실행** |
| **IDOR** | `/post/edit/:id` | 게시글 수정 시 작성자 본인 확인 절차 부재로 인한 **타인 게시글 무단 수정** |
| **File Upload** | `/upload` | 파일 확장자 및 실행 권한 검증 미흡으로 인한 **Webshell 업로드 가능** |

---

## 설치 및 실행 방법 (Installation)

### 1. 프로젝트 클론
```bash
git clone [https://github.com/dlwl224/sc_pro.git](https://github.com/dlwl224/sc_pro.git)
cd sc_pro
```

### 2. 의존성 설치
프로젝트 실행에 필요한 라이브러리(Express, MySQL2, EJS 등)를 설치합니다.
```bash
npm install
```
### 3. 환경 변수 설정 (.env)
보안을 위해 DB 접속 정보는 환경 변수로 관리합니다. 프로젝트 루트 경로(최상위 폴더)에 .env 파일을 직접 생성하고, 아래 내용을 복사해 본인의 DB 정보에 맞게 수정하여 입력해주세요.

```sql

DB_HOST=localhost
DB_USER=root
DB_PASS=사용자비밀번호
DB_NAME=security_app
```
주의: DB_PASS 부분에는 본인의 실제 MySQL 비밀번호를 입력해야 합니다.

### 4. 데이터베이스 세팅 (MySQL)
MySQL Workbench 또는 터미널에서 아래 SQL 쿼리를 실행하여 데이터베이스와 테이블을 생성합니다.

```sql

/* 1. 데이터베이스 생성 */
CREATE DATABASE security_app;
USE security_app;

/* 2. 유저 테이블 생성 (User Table) */
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* 3. 게시글 테이블 생성 (Post Table) */
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
### 5. 서버 실행
아래 명령어로 서버를 실행합니다.

```bash

npm start
# 또는 node app.js
```
서버 실행 후 브라우저 주소창에 http://localhost:3000 을 입력하여 접속합니다.

## 공격 시나리오 예시 (PoC)
### 1. SQL Injection (Login Bypass)
```bash
Method: Login Form

Payload: ' OR '1'='1' #

Result: 비밀번호 검증을 무시하고 관리자 계정으로 로그인 성공
```
### 2. Stored XSS
```bash
Method: Post Write (게시글 작성)

Payload: <script>alert(document.cookie)</script>

Result: 게시글 열람 시 방문자의 세션 쿠키 탈취 팝업 발생
```
### 3. IDOR (Insecure Direct Object References)
```bash
Method: Post Edit (게시글 수정)

Scenario: 게시글 수정 페이지 URL의 ID 파라미터를 변조 (/post/edit/2 -> /post/edit/1)

Result: 본인이 작성하지 않은 타인의 게시글을 수정 가능
```
### 4. File Upload (Webshell)
```bash
Method: File Upload Page

Payload: Upload .html file containing javascript malware

Result: 업로드된 파일에 직접 접근하여 악성 스크립트 실행 가능
```

