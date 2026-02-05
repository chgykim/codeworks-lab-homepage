# Codeworks Lab Homepage 관리 가이드

## 맥미니 M4 새 환경 설정

### 1. 필수 프로그램 설치

```bash
# Homebrew 설치 (macOS 패키지 관리자)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 설치 (LTS 버전 권장)
brew install node

# Git 설치
brew install git

# Firebase CLI 설치
npm install -g firebase-tools

# 설치 확인
node --version    # v20.x 이상
npm --version     # v10.x 이상
git --version
firebase --version
```

### 2. 프로젝트 클론

```bash
# 원하는 디렉토리로 이동
cd ~/Projects  # 또는 원하는 경로

# GitHub에서 클론
git clone https://github.com/chgykim/codeworks-lab-homepage.git

cd codeworks-lab-homepage
```

### 3. 의존성 설치

```bash
# 서버 의존성 설치
cd server
npm install

# 클라이언트 의존성 설치
cd ../client
npm install
```

### 4. Firebase 로그인 및 프로젝트 연결

```bash
# Firebase 로그인
firebase login

# 프로젝트 확인 (rustic-sage 연결됨)
firebase projects:list
```

### 5. 로컬 개발용 환경 변수 설정

**server/.env 파일 생성:**
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=codeworks-lab-secret-key-2026

# 로컬 개발 시 Render PostgreSQL 사용 (또는 로컬 DB)
# Render Dashboard > PostgreSQL > External Database URL 복사
DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]

# Firebase Admin SDK
FIREBASE_PROJECT_ID=rustic-sage
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@rustic-sage.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...(Firebase Console에서 복사)...\n-----END PRIVATE KEY-----\n"

# CORS 허용 도메인
ALLOWED_ORIGINS=http://localhost:5173,https://rustic-sage.web.app
```

> **참고**: Firebase Private Key는 Firebase Console > 프로젝트 설정 > 서비스 계정 > 새 비공개 키 생성

---

## 라이브 서비스 정보

| 서비스 | URL | 플랫폼 |
|--------|-----|--------|
| **클라이언트** | https://rustic-sage.web.app | Firebase Hosting |
| **서버 API** | https://codeworks-lab-homepage.onrender.com | Render.com |
| **데이터베이스** | PostgreSQL | Render.com |
| **GitHub** | https://github.com/chgykim/codeworks-lab-homepage | GitHub |

### 관리자 콘솔
| 서비스 | URL |
|--------|-----|
| Firebase Console | https://console.firebase.google.com/project/rustic-sage |
| Render Dashboard | https://dashboard.render.com |
| GitHub Repository | https://github.com/chgykim/codeworks-lab-homepage |

### 관리자 로그인
- **URL**: https://rustic-sage.web.app/admin/login
- **방법**: Google 계정 로그인 (등록된 관리자 이메일만 가능)

---

## ⚠️ 관리자 로그인 주의사항 (중요!)

### ✅ 올바른 관리자 로그인 방법
```
https://rustic-sage.web.app/admin/login
```
- **반드시 Firebase Hosting URL** (`rustic-sage.web.app`)에서 로그인
- Google 계정 (등록된 관리자 이메일)으로 로그인

### ❌ 작동하지 않는 URL (절대 사용 금지!)
```
https://codeworks-lab-homepage.onrender.com/admin/login  ← 안됨!
```
- Render URL에서는 Google 로그인이 **작동하지 않음**
- OAuth 설정이 Firebase 도메인에만 되어 있음

### 🏗️ 시스템 구조 이해

| 서비스 | URL | 역할 |
|--------|-----|------|
| **Firebase Hosting** | `rustic-sage.web.app` | 웹사이트 (클라이언트) |
| **Render** | `codeworks-lab-homepage.onrender.com` | API 서버만 |

```
[사용자] → rustic-sage.web.app (Firebase) → API 호출 → Render 서버 → PostgreSQL
```

### 🚫 절대 바꾸지 말 것

1. **Firebase Authentication 설정**
   - Google Cloud Console의 OAuth 클라이언트 ID
   - 승인된 자바스크립트 원본 (`rustic-sage.web.app`)
   - Firebase Console의 승인된 도메인

2. **클라이언트 Firebase 설정** (`client/src/config/firebase.js`)
   - API 키, 프로젝트 ID 등 환경변수로 유지
   - 하드코딩 절대 금지

3. **배포 구조**
   - 클라이언트: Firebase Hosting에만 배포
   - 서버 API: Render에만 배포
   - 이 구조를 변경하면 Google 로그인이 깨짐!

### 🔧 문제 발생 시 체크리스트

관리자 로그인이 안 될 때:

1. **URL 확인**: `rustic-sage.web.app`인지 확인 (Render URL 아님!)
2. **Firebase 승인 도메인**: Firebase Console → Authentication → Settings → 승인된 도메인
3. **Google Cloud OAuth**: 승인된 자바스크립트 원본에 도메인 있는지 확인
4. **API 키**: Firebase Console의 SDK 설정과 일치하는지 확인
5. **캐시 삭제**: 브라우저 강력 새로고침 (`Ctrl + Shift + R`)

---

## 로컬 개발 실행

```bash
# 터미널 1: 서버 실행
cd server
npm run dev
# → http://localhost:5000

# 터미널 2: 클라이언트 실행
cd client
npm run dev
# → http://localhost:5173
```

---

## 배포 방법

### 클라이언트 배포 (Firebase Hosting)

```bash
# 1. 클라이언트 빌드
cd client
npm run build

# 2. Firebase 배포
cd ..
firebase deploy --only hosting

# 배포 완료 → https://rustic-sage.web.app
```

### 서버 배포 (Render)

```bash
# GitHub에 푸시하면 자동 배포
git add .
git commit -m "Update description"
git push origin master

# Render가 자동으로 감지하여 재배포
# 수동 배포: Render Dashboard → Manual Deploy
```

---

## Render 환경 변수 (이미 설정됨)

| Key | 설명 |
|-----|------|
| DATABASE_URL | PostgreSQL Internal URL |
| NODE_ENV | production |
| JWT_SECRET | JWT 토큰 시크릿 |
| FIREBASE_PROJECT_ID | rustic-sage |
| FIREBASE_CLIENT_EMAIL | Firebase 서비스 계정 이메일 |
| FIREBASE_PRIVATE_KEY | Firebase 서비스 계정 비공개 키 |
| ALLOWED_ORIGINS | CORS 허용 도메인 |
| ADMIN_EMAIL | 관리자 이메일 |
| VITE_FIREBASE_API_KEY | Firebase 웹 API 키 (클라이언트 빌드용) |
| VITE_FIREBASE_AUTH_DOMAIN | Firebase 인증 도메인 |
| VITE_FIREBASE_PROJECT_ID | Firebase 프로젝트 ID |
| VITE_FIREBASE_STORAGE_BUCKET | Firebase 스토리지 버킷 |
| VITE_FIREBASE_MESSAGING_SENDER_ID | Firebase 메시징 발신자 ID |
| VITE_FIREBASE_APP_ID | Firebase 앱 ID |
| VITE_FIREBASE_MEASUREMENT_ID | Firebase 측정 ID |
| VITE_ADMIN_EMAIL | 관리자 이메일 (클라이언트용) |

---

## 프로젝트 구조

```
codeworks-lab-homepage/
├── client/                     # React 클라이언트 (Vite)
│   ├── src/
│   │   ├── components/         # UI 컴포넌트
│   │   ├── pages/              # 페이지 컴포넌트
│   │   │   ├── auth/           # 인증 페이지 (Login, Register)
│   │   │   ├── user/           # 사용자 페이지 (MyPage, ChangePassword, MyReviews, MyInquiries)
│   │   │   └── admin/          # 관리자 페이지
│   │   ├── hooks/useAuth.jsx   # 인증 훅 (로그인, 회원가입, 상태관리)
│   │   ├── locales/            # 다국어 번역 (11개 언어)
│   │   └── utils/api.js        # API 통신
│   ├── dist/                   # 빌드 결과물
│   └── package.json
│
├── server/                     # Express.js 서버
│   ├── routes/                 # API 라우트
│   │   ├── auth.js             # 인증 API (login, register)
│   │   ├── user.js             # 사용자 API (profile, password, reviews, inquiries)
│   │   └── ...                 # 기타 라우트
│   ├── models/db.js            # PostgreSQL 연결 및 모델 (userModel 포함)
│   ├── middleware/             # 인증, 검증, 에러 처리
│   ├── config/                 # 보안, Firebase 설정
│   └── package.json
│
├── database/                   # DB 스키마 (참고용)
├── firebase.json               # Firebase 설정
├── .firebaserc                 # Firebase 프로젝트 연결
└── NEXT_TASKS.md               # 이 파일
```

---

## 완료된 작업 이력

### 2026-01-30
- [x] FAQ 수정: "앱은 무료인가요?" 답변 변경
- [x] FAQ 수정: "데이터 백업" 항목 삭제
- [x] "클라우드 백업" → "100% 로컬 저장" 메시지 변경 (11개 언어)
- [x] Hero 섹션 평점/다운로드 숫자 초기화 ("-"로 변경)
- [x] Firebase 관리자 인증 통합 (Google 로그인)
- [x] GitHub 레포 생성

### 2026-02-02
- [x] Render.com 서비스 설정
- [x] PostgreSQL 마이그레이션 (better-sqlite3 → pg)
- [x] 서버 배포 (Render)
- [x] 클라이언트 배포 (Firebase Hosting)
- [x] CORS 설정 완료
- [x] 관리자 로그인 테스트 완료
- [x] **보안 조치**: GitGuardian 경고 대응
  - DATABASE_URL 노출 문제 해결
  - 새 PostgreSQL credential 생성 (codeworkslabdb_phdc_user)
  - 기존 노출된 credential 삭제 완료

### 2026-02-04
- [x] **Google Cloud Platform API 키 노출 경고 대응**
  - Google로부터 API 키 노출 경고 이메일 수신
  - Firebase API 키가 GitHub에 하드코딩되어 노출됨
- [x] **Firebase 클라이언트 설정 보안 강화**
  - `client/src/config/firebase.js` → 환경변수(`VITE_*`)로 전환
  - `server/config/firebase.js` → `ADMIN_EMAIL` 환경변수로 전환
  - `client/.env` 및 `client/.env.example` 생성
- [x] **API 키 재생성 (Google Cloud Console)**
  - Browser key 순환 (키 재생성)
  - 이전 노출된 키 완전 삭제
- [x] **Firebase 서비스 계정 키 재생성**
  - 새 비공개 키 발급 및 적용
- [x] **Git 히스토리 정리 (BFG Repo-Cleaner)**
  - 노출된 API 키, 비밀번호, JWT Secret 히스토리에서 제거
  - GitHub force push 완료
- [x] **.gitignore 보안 강화**
  - `.env`, `firebase-service-account.json`, `*.key` 등 추가
- [x] **Firebase Hosting 재배포**
  - 새 API 키 적용된 클라이언트 빌드 및 배포
- [x] **Render 서버 재배포**
  - 환경변수 확인 (ADMIN_EMAIL, JWT_SECRET)
  - Clear build cache & deploy 실행
- [x] **관리자 로그인 테스트 완료** ✅

### 2026-02-03
- [x] **개인정보 처리방침 페이지 추가** (`/privacy`)
  - Privacy.jsx 컴포넌트 생성
  - 11개 언어 전체 번역 추가
  - 법적 요건 준수 내용 작성
- [x] **이용약관 페이지 추가** (`/terms`)
  - Terms.jsx 컴포넌트 생성
  - 11개 언어 전체 번역 추가
- [x] **Legal.css 스타일시트 생성**
- [x] **App.jsx 라우트 추가** (/privacy, /terms)
- [x] **Footer.jsx 링크 연결** (개인정보 처리방침, 이용약관)
- [x] **개인정보 처리방침 추가 항목 반영**
  - 민감정보 비수집 안내 (건강, 생체, 위치, 연락처, 사진, 음성 등)
  - 인앱결제 미처리 안내 (Apple App Store / Google Play Store 통해 처리)
  - 외부 서비스 해외 서버 이용 안내 (Firebase, Gemini API)
- [x] **개인정보 보호책임자 변경**
  - 성명: 김창규 → 허접도사 (Rustic Sage)
  - 직책: CEO → 대표 (Representative)
- [x] 시행일 수정: 2025-02-03 → 2026-02-03
- [x] Firebase 배포 완료

### 2026-02-05
- [x] **사용자 계정 시스템 구현**
  - 이메일/비밀번호 회원가입 (`/register`)
  - 일반 사용자 로그인 (`/login`)
  - 마이페이지 (`/mypage`) - 프로필, 통계
  - 비밀번호 변경 (`/mypage/password`)
  - 내 리뷰 관리 (`/mypage/reviews`)
  - 내 문의 내역 (`/mypage/inquiries`)
  - 회원 탈퇴 기능
- [x] **문의 양식 개선**
  - 제목 필드: 텍스트 입력 → 드롭다운 선택
  - 7개 카테고리: 앱 오류, 기기 지원, 국가/언어, 개선 사항, 기능 추가, 앱 개발 제안, 기타
- [x] **서버 API 확장**
  - `server/routes/user.js` - 사용자 API 신규 생성
  - `server/routes/auth.js` - register, login, check-email 엔드포인트 추가
  - `server/middleware/validator.js` - 회원가입/비밀번호 검증 추가
  - `server/config/security.js` - 회원가입 rate limiter 추가
  - `server/models/db.js` - users 테이블 확장, userModel 함수 추가
- [x] **데이터베이스 스키마 확장**
  - users 테이블: name, deleted_at, login_attempts, locked_until 컬럼 추가
  - reviews, contact_submissions 테이블에 user_id 외래키 추가
- [x] **보안 기능**
  - bcrypt 비밀번호 해싱 (salt 12)
  - JWT 토큰 인증 (7일 만료)
  - 로그인 시도 제한 (5회 실패 시 15분 잠금)
  - 회원가입 rate limiting (IP당 시간당 3회)
- [x] **클라이언트 페이지 추가**
  - `pages/auth/Login.jsx`, `Register.jsx`, `Auth.css`
  - `pages/user/MyPage.jsx`, `ChangePassword.jsx`, `MyReviews.jsx`, `MyInquiries.jsx`, `User.css`
- [x] **11개 언어 번역 추가**
  - auth (로그인, 회원가입, 비밀번호 관련)
  - mypage (마이페이지, 내 리뷰, 내 문의)
  - contact.categories (문의 카테고리 7개)
- [x] **Header.jsx 업데이트** - 로그인/마이페이지 메뉴 추가
- [x] **Render 배포 설정**
  - Build Command: `cd client && npm install --include=dev && npm run build && cd ../server && npm install`
  - VITE_* 환경변수 추가 (Firebase 클라이언트 설정)
  - 정적 파일 CORS 이슈 해결 (app.js 수정)
- [x] **Firebase Hosting 배포 완료** ✅

---

## 홈페이지 관리 작업

### 사용자 페이지 기능
| 경로 | 기능 |
|------|------|
| `/login` | 일반 사용자 로그인 (이메일/비밀번호) |
| `/register` | 회원가입 |
| `/mypage` | 마이페이지 (프로필, 통계) |
| `/mypage/password` | 비밀번호 변경 |
| `/mypage/reviews` | 내 리뷰 관리 |
| `/mypage/inquiries` | 내 문의 내역 |

### 관리자 페이지 기능 (/admin)
| 기능 | 설명 |
|------|------|
| 대시보드 | 리뷰, 블로그, 방문자 통계 |
| 리뷰 관리 | 승인/거절/삭제 |
| 블로그 관리 | 작성/수정/삭제/발행 |
| 연락처 관리 | 문의 내역 확인 |
| 앱 출시 관리 | 앱별 출시 상태 토글 |
| 설정 | 사이트 기본 정보 수정 |

### 앱 출시 시 업데이트 항목
1. **스크린샷 업데이트**: `client/src/assets/` 또는 외부 URL
2. **앱 설명 수정**: `client/src/locales/*/translation.json`
3. **스토어 링크 수정**: 관리자 페이지 > 설정
4. **앱 출시 상태**: 관리자 페이지 > 앱 관리
5. **Hero 섹션 업데이트**: 평점, 다운로드 수

### 다국어 지원 (11개 언어)
- 한국어 (ko), 영어 (en), 일본어 (ja), 중국어 간체 (zh-CN)
- 중국어 번체 (zh-TW), 스페인어 (es), 프랑스어 (fr)
- 독일어 (de), 포르투갈어 (pt), 러시아어 (ru), 아랍어 (ar)

**번역 파일 위치**: `client/src/locales/{언어코드}/translation.json`

---

## 향후 작업 체크리스트

### 앱 출시 준비
- [ ] 앱 스크린샷 촬영 및 업로드
- [ ] 앱 설명 작성 (11개 언어)
- [ ] App Store / Play Store 링크 연결
- [ ] Hero 섹션 평점/다운로드 수 업데이트

### 콘텐츠 관리
- [ ] 블로그 포스트 작성
- [ ] 사용자 리뷰 승인 관리
- [ ] FAQ 추가/수정
- [ ] 문의 답변

### 선택 작업
- [ ] 커스텀 도메인 연결 (Firebase & Render)
- [ ] Google Analytics 설정
- [ ] SEO 최적화
- [ ] 성능 최적화

---

## 유용한 명령어

```bash
# 변경사항 확인
git status
git diff

# 변경사항 커밋 & 푸시
git add .
git commit -m "설명"
git push origin master

# 클라이언트만 빠르게 배포
cd client && npm run build && cd .. && firebase deploy --only hosting

# 로그 확인 (Render)
# → Render Dashboard > Logs 탭

# Firebase 프로젝트 상태 확인
firebase projects:list
```

---

## 문제 해결

### Render 서버가 응답하지 않음
- 무료 플랜은 15분 비활성 시 sleep → 첫 요청 30초~1분 대기
- Logs 탭에서 오류 확인
- Manual Deploy로 재배포

### CORS 오류 발생
- Render 환경 변수 `ALLOWED_ORIGINS` 확인
- Firebase 도메인이 포함되어 있는지 확인

### 로컬에서 DB 연결 오류
- `.env` 파일의 `DATABASE_URL` 확인
- Render PostgreSQL은 External URL 사용 필요 (로컬에서 접속 시)

---

## 🔐 보안 주의사항

### ⚠️ 보안 사고 이력 (교훈)

| 날짜 | 문제 | 원인 | 대응 |
|------|------|------|------|
| 2026-02-02 | PostgreSQL credential 노출 | DATABASE_URL이 코드에 포함 | 새 credential 생성, 기존 삭제 |
| 2026-02-04 | Firebase API 키 노출 | API 키 하드코딩 | 키 재생성, Git 히스토리 정리 |

### 🚨 앞으로 예방하는 방법 (필독!)

**1. 코드 작성 시 규칙**
- API 키, 비밀번호는 **절대** 코드에 직접 작성 금지
- 항상 환경변수(`process.env.*`, `import.meta.env.*`)로 사용

**2. 커밋 전 확인**
```bash
# 커밋 전 민감한 정보 검색
git diff --staged | grep -i -E "(password|secret|key|token|api)"
```

**3. 환경변수 파일 구조**
```
client/.env          # 클라이언트 환경변수 (VITE_* 접두사)
client/.env.example  # 템플릿 (Git에 포함)
server/.env          # 서버 환경변수 (Git 제외)
.env.example         # 템플릿 (Git에 포함)
```

**4. 새 API 키/비밀 추가 시 체크리스트**
- [ ] 환경변수로 설정했는가?
- [ ] .gitignore에 포함되어 있는가?
- [ ] .env.example에 템플릿 추가했는가?
- [ ] Render 환경변수에 추가했는가?

---

### 절대 GitHub에 올리지 말 것
- DATABASE_URL (PostgreSQL 연결 정보)
- FIREBASE_PRIVATE_KEY (Firebase 비공개 키)
- JWT_SECRET
- 기타 API 키, 비밀번호

### .env 파일 관리
- `server/.env` 파일은 `.gitignore`에 포함됨
- 로컬에서만 사용, 절대 커밋하지 않음
- Render 환경 변수는 대시보드에서 직접 설정

### credential 노출 시 대응
1. 즉시 새 credential 생성 (Render Dashboard > PostgreSQL > Info > New default credential)
2. 서버 환경 변수 업데이트 (DATABASE_URL)
3. 기존 노출된 credential 삭제
4. Git 히스토리에서 민감 정보 제거 (선택)

### 현재 PostgreSQL Credential
- **Username**: codeworkslabdb_phdc_user (Default)
- **URL**: Render Dashboard > codeworks-lab-db > Info에서 확인

---

## 연락처 & 리소스

- **Firebase 문서**: https://firebase.google.com/docs/hosting
- **Render 문서**: https://render.com/docs
- **Vite 문서**: https://vitejs.dev
- **Express.js 문서**: https://expressjs.com

---

---

## 💰 수익 예상 (목표)

### 가정
- 앱 개수: **10개** (Way 시리즈)
- 앱당 다운로드: **1,000건**
- 구독료: **3,000원 ~ 6,000원/월**
- 구독 전환율: **5~10%** (업계 평균)

### 월 수익 계산

| 항목 | 보수적 (5%) | 낙관적 (10%) |
|------|-------------|--------------|
| 총 다운로드 | 10,000 | 10,000 |
| 구독자 수 | 500명 | 1,000명 |
| 월 수익 (3,000원) | 150만원 | 300만원 |
| 월 수익 (6,000원) | 300만원 | 600만원 |
| 스토어 수수료 (30%) | -45~90만원 | -90~180만원 |
| **실수령** | **105~210만원** | **210~420만원** |

### 연 수익 예상

| 시나리오 | 월 수익 | 연 수익 |
|----------|---------|---------|
| 보수적 | 105만원 | 1,260만원 |
| 낙관적 | 420만원 | 5,040만원 |

### 서버 비용 vs 수익

```
Render 유료 플랜: 월 $7 ≈ 9,000원 (연 11만원)
→ 수익의 0.2~1% 수준 = 서버비 걱정 끝! 😎
```

### 마일스톤

| 목표 | 상태 |
|------|------|
| 앱 1개 출시 | ⏳ 준비 중 |
| 다운로드 1,000 달성 | ⬜ |
| 첫 구독 수익 | ⬜ |
| 월 100만원 달성 | ⬜ |
| 10개 앱 출시 완료 | ⬜ |

---

---

## 🚨 즉시 해야 할 작업

### 1. [보안] Gmail 앱 비밀번호 재생성 ⚠️
> NEXT_TASKS.md에 비밀번호가 노출되어 GitHub에 푸시됨 (2026-02-05)

1. https://myaccount.google.com/apppasswords 접속
2. 기존 앱 비밀번호 **삭제**
3. 새 앱 비밀번호 **생성**
4. Render 환경변수 `SMTP_PASS` **업데이트**
5. Save Changes → 자동 재배포

### 2. [보안] Resend API 키 삭제
1. https://resend.com/api-keys 접속
2. 노출된 키 **삭제** (현재 Gmail SMTP 사용 중이라 새로 생성 안 해도 됨)

### 3. 이메일 발송 테스트
1. https://rustic-sage.web.app/admin/announcements 접속
2. 공지사항 이메일 발송 버튼 클릭
3. **Render 로그 확인** (Render Dashboard → Logs)

**성공 시:**
```
[EmailService] SMTP connection verified successfully
[EmailService] Found 3 users to send email to
Email sent successfully to: xxx@xxx.com
```

**실패 시:**
```
[EmailService] SMTP connection failed: Connection timeout
```

### 4. 포트 465도 안 될 경우 대안
Render 무료 플랜에서 SMTP 포트가 차단될 수 있음.

| 대안 | 설명 |
|------|------|
| **Render 유료 플랜** | $7/월, 포트 제한 없음 |
| **SendGrid API** | 무료 100통/일, HTTP API 사용 |
| **Mailgun API** | 무료 5,000통/월 |

---

### 참고: 현재 이메일 설정 상태
- **방식**: Gmail SMTP (포트 465, SSL)
- **환경변수**: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- **코드**: `server/services/emailService.js`

---

## ✅ 2026-02-05 완료된 작업 (공지사항 시스템)

### 공지사항 관리 시스템 구현
- [x] **데이터베이스**: `announcements` 테이블 생성
- [x] **서버 API**:
  - `GET /api/announcements` - 공개 공지사항 목록
  - `GET/POST/PUT/DELETE /api/admin/announcements` - 관리자 CRUD
  - `POST /api/admin/announcements/:id/send-email` - 이메일 발송
  - `POST /api/admin/announcements/:id/reset-email` - 발송 상태 리셋
  - `GET /api/admin/smtp-test` - SMTP 연결 테스트
- [x] **클라이언트**:
  - `ManageAnnouncements.jsx` - 공지사항 관리 페이지
  - 유형별/상태별 필터링
  - 이메일 발송 버튼 (게시됨 상태에서만)
- [x] **Manual 페이지 변경**:
  - 기존: activity, hydration, sleep
  - 변경: **newApp, update, announcement**
- [x] **관리자 대시보드**:
  - 등록 회원 수 표시
  - 이메일 대상 수 표시
- [x] **11개 언어 번역 파일 업데이트**

### 이메일 발송 기능
- [x] **emailService.js** - nodemailer → Resend → Gmail SMTP 465 순으로 변경
- [x] **백그라운드 발송** - 타임아웃 방지
- [x] **오류 로깅** - 발송 성공/실패 로그 출력
- ⏳ **SMTP 연결 테스트 필요** (포트 465)

### 데이터베이스 마이그레이션
- [x] `users` 테이블: `name`, `login_attempts`, `locked_until`, `deleted_at`, `updated_at` 컬럼 추가
- [x] `reviews` 테이블: `user_id` 컬럼 추가
- [x] `contact_submissions` 테이블: `user_id` 컬럼 추가
- [x] `announcements` 테이블 생성

---

*마지막 업데이트: 2026-02-05*
*맥미니 M4 환경 설정 가이드 + API 키 보안 조치 완료 + 수익 목표 + 법적 페이지 완료 + 사용자 계정 시스템 완료 + 공지사항 관리 시스템 완료*
