# 다음 작업 목록

## 완료된 작업
- [x] FAQ 수정: "앱은 무료인가요?" 답변 변경
- [x] FAQ 수정: "데이터 백업" 항목 삭제
- [x] "클라우드 백업" → "100% 로컬 저장" 메시지 변경 (11개 언어)
- [x] Hero 섹션 평점/다운로드 숫자 초기화 ("-"로 변경)
- [x] Firebase 관리자 인증 통합 (Google 로그인)
- [x] GitHub 레포 생성 (codeworks-lab-homepage)
- [x] Render.com 계정 생성 및 서비스 설정
- [x] **PostgreSQL 마이그레이션 완료** (better-sqlite3 → pg)

---

## 진행 중: 온라인 배포

### 현재 상태
- **GitHub**: https://github.com/chgykim/codeworks-lab-homepage ✅
- **Render 서버**: PostgreSQL 마이그레이션 완료, 재배포 필요
- **Firebase Hosting**: 아직 배포 안 됨

### 다음 세션에서 할 작업

#### 1. Render PostgreSQL 데이터베이스 생성
1. Render 대시보드 → **New** → **PostgreSQL** 클릭
2. 이름: `codeworks-lab-db`
3. Region: Oregon (US West)
4. Plan: Free
5. **Create Database** 클릭
6. 생성 후 **Internal Database URL** 복사

#### 2. Render 서버 환경 변수 추가
Render 대시보드 → codeworks-lab-homepage 서비스 → **Environment**:

| Name | Value |
|------|-------|
| DATABASE_URL | (위에서 복사한 Internal Database URL) |
| NODE_ENV | production |
| JWT_SECRET | codeworks-lab-secret-key-2026 |
| FIREBASE_PROJECT_ID | rustic-sage |
| FIREBASE_CLIENT_EMAIL | firebase-adminsdk-fbsvc@rustic-sage.iam.gserviceaccount.com |
| FIREBASE_PRIVATE_KEY | (서비스 계정 키) |

#### 3. 코드 푸시 및 배포
```bash
cd C:\Users\chgyk\.local\bin\Home_Page
git add .
git commit -m "Migrate from better-sqlite3 to PostgreSQL"
git push origin main
```
Render가 자동으로 재배포됨

#### 4. 클라이언트 API URL 설정
서버 배포 성공 후 `client/src/utils/api.js` 수정:
```javascript
const api = axios.create({
    baseURL: import.meta.env.PROD
        ? 'https://codeworks-lab-homepage.onrender.com/api'
        : '/api',
    ...
});
```

#### 5. Firebase Hosting 배포
```bash
cd C:\Users\chgyk\.local\bin\Home_Page\client
npm run build

cd ..
firebase deploy --only hosting
```

---

## 로컬 개발 실행 (PostgreSQL 사용 시)

로컬에서 테스트하려면 `.env` 파일에 DATABASE_URL 추가:
```
DATABASE_URL=postgresql://localhost:5432/homepage_dev
```

또는 로컬에서는 SQLite를 계속 사용하고 싶다면, 별도 브랜치에서 개발

---

## 파일 구조 요약
```
Home_Page/
├── client/                 # React (Vite) - Firebase Hosting에 배포
├── server/                 # Express.js - Render.com에 배포
│   └── models/db.js        # PostgreSQL 연결 (pg 모듈)
├── database/schema.sql     # PostgreSQL 스키마
├── firebase.json           # Firebase Hosting 설정
└── .firebaserc            # Firebase 프로젝트 연결 (rustic-sage)
```

---

*마지막 업데이트: 2026-02-02*
