# CodeWorks Lab - Safe Way 11 홈페이지

위험한 순간에 곁에 있어주는 11개 안전 도구 앱 홈페이지입니다.

## 기술 스택

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **보안**: Helmet.js, Rate Limiting, CORS, JWT

## 보안 기능

### DDoS 방어
- IP당 요청 제한 (100req/15분)
- Request Size 제한 (10KB)
- 연결 타임아웃 설정

### 해킹 방어
- Helmet.js (15+ HTTP 보안 헤더)
- SQL Injection 방지 (Parameterized queries)
- XSS 방지 (DOMPurify + CSP)
- CORS 설정

### 인증 보안
- bcrypt 비밀번호 해싱 (salt: 12)
- JWT + HttpOnly 쿠키
- Brute Force 방지 (5회/15분)

## 설치 및 실행

### 1. 의존성 설치

```bash
# 서버 의존성 설치
cd server
npm install

# 클라이언트 의존성 설치
cd ../client
npm install
```

### 2. 환경 변수 설정

서버의 `.env` 파일을 수정하여 프로덕션 환경에 맞게 설정하세요:

```env
JWT_SECRET=your-production-secret-key
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-secure-password
```

### 3. 실행

```bash
# 서버 실행 (포트 5000)
cd server
npm start

# 클라이언트 실행 (포트 5173)
cd client
npm run dev
```

## 기본 관리자 계정

- Email: admin@example.com
- Password: admin123!@#

**중요**: 프로덕션 환경에서는 반드시 비밀번호를 변경하세요!

## 프로젝트 구조

```
Home_Page/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # 재사용 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── hooks/          # 커스텀 훅
│   │   └── utils/          # 유틸리티 함수
│   └── package.json
│
├── server/                 # Node.js 백엔드
│   ├── config/             # 설정 파일
│   ├── middleware/         # Express 미들웨어
│   ├── routes/             # API 라우트
│   ├── models/             # 데이터베이스 모델
│   └── utils/              # 유틸리티
│
└── database/               # DB 스키마
```

## API 엔드포인트

### 공개 API
- `GET /api/settings/public` - 사이트 설정
- `GET /api/reviews` - 리뷰 목록
- `POST /api/reviews` - 리뷰 작성
- `GET /api/blog` - 블로그 목록
- `GET /api/blog/:slug` - 블로그 상세
- `POST /api/contact` - 문의 제출

### 인증 API
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자

### 관리자 API
- `GET /api/admin/dashboard` - 대시보드
- `GET/PUT/DELETE /api/admin/reviews` - 리뷰 관리
- `GET/POST/PUT/DELETE /api/admin/blog` - 블로그 관리
