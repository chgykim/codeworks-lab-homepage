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

### 관리자 로그인
- **URL**: https://rustic-sage.web.app/admin/login
- **방법**: Google 계정 로그인 (등록된 관리자 이메일만 가능)

---

## ⚠️ 관리자 로그인 주의사항 (중요!)

### ✅ 올바른 관리자 로그인
```
https://rustic-sage.web.app/admin/login
```

### ❌ 작동하지 않는 URL
```
https://codeworks-lab-homepage.onrender.com/admin/login  ← 안됨!
```

### 시스템 구조
```
[사용자] → rustic-sage.web.app (Firebase) → API 호출 → Render 서버 → PostgreSQL
```

| 서비스 | URL | 역할 |
|--------|-----|------|
| **Firebase Hosting** | `rustic-sage.web.app` | 웹사이트 (클라이언트) |
| **Render** | `codeworks-lab-homepage.onrender.com` | API 서버만 |

---

## 로컬 개발 실행

```bash
# 터미널 1: 서버 실행
cd server && npm run dev
# → http://localhost:5000

# 터미널 2: 클라이언트 실행
cd client && npm run dev
# → http://localhost:5173
```

---

## 배포 방법

### 클라이언트 배포 (Firebase Hosting)
```bash
cd client && npm run build && cd .. && firebase deploy --only hosting
# → https://rustic-sage.web.app
```

### 서버 배포 (Render)
```bash
# GitHub에 푸시하면 자동 배포
git add . && git commit -m "설명" && git push origin master

# Build Command: cd server && npm install
```

---

## Render 환경 변수

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

---

## 프로젝트 구조

```
codeworks-lab-homepage/
├── client/                     # React 클라이언트 (Vite)
│   ├── src/
│   │   ├── components/         # UI 컴포넌트
│   │   ├── pages/              # 페이지 컴포넌트
│   │   │   └── admin/          # 관리자 페이지
│   │   ├── hooks/useAuth.jsx   # 인증 훅 (관리자 Google 로그인)
│   │   ├── locales/            # 다국어 번역 (14개 언어)
│   │   └── utils/api.js        # API 통신
│   └── dist/                   # 빌드 결과물
│
├── server/                     # Express.js 서버
│   ├── routes/                 # API 라우트
│   ├── models/db.js            # PostgreSQL 연결
│   ├── middleware/             # 인증, 검증, 에러 처리
│   └── config/                 # 보안, Firebase 설정
│
├── firebase.json               # Firebase 설정
└── NEXT_TASKS.md               # 이 파일
```

---

## 홈페이지 관리

### 관리자 페이지 기능 (/admin)
| 기능 | 설명 |
|------|------|
| 대시보드 | 리뷰, 블로그, 방문자 통계 |
| 리뷰 관리 | 승인/거절/삭제 |
| 블로그 관리 | 작성/수정/삭제/발행 |
| 공지사항 관리 | 신규 앱/업데이트/공지 |
| 문의 관리 | 문의 내역 확인 |

### 다국어 지원 (14개 언어)
ko, en, ja, zh-CN, es, pt, fr, de, ru, ar, hi, th, id, vi

**번역 파일 위치**: `client/src/locales/{언어코드}/translation.json`

### 현재 인증 구조
- **관리자**: `/admin/login` (Google 로그인)
- **일반 사용자**: 로그인 없이 사용 (리뷰 작성, 문의 가능)

---

## 향후 작업 체크리스트

### 앱 출시 준비
- [ ] 앱 스크린샷 촬영 및 업로드
- [ ] 앱 설명 작성 (14개 언어)
- [ ] App Store / Play Store 링크 연결
- [ ] Hero 섹션 평점/다운로드 수 업데이트

### 콘텐츠 관리
- [ ] 블로그 포스트 작성
- [ ] 사용자 리뷰 승인 관리
- [ ] 문의 답변

### 선택 작업
- [ ] 커스텀 도메인 연결
- [ ] Google Analytics 설정
- [ ] SEO 최적화

---

## 문제 해결

### Render 서버가 응답하지 않음
- 무료 플랜은 15분 비활성 시 sleep → 첫 요청 30초~1분 대기
- Logs 탭에서 오류 확인
- Manual Deploy로 재배포

### CORS 오류 발생
- Render 환경 변수 `ALLOWED_ORIGINS` 확인
- Firebase 도메인이 포함되어 있는지 확인

### 관리자 로그인 안됨
1. URL이 `rustic-sage.web.app`인지 확인 (Render URL 아님!)
2. 브라우저 캐시 삭제 (`Ctrl + Shift + R`)
3. Firebase Console → Authentication → 승인된 도메인 확인

---

## 🔐 보안 주의사항

### 절대 GitHub에 올리지 말 것
- DATABASE_URL, FIREBASE_PRIVATE_KEY, JWT_SECRET
- 기타 API 키, 비밀번호

### 환경변수 파일 구조
```
client/.env          # 클라이언트 (VITE_* 접두사)
client/.env.example  # 템플릿 (Git에 포함)
server/.env          # 서버 (Git 제외)
```

### credential 노출 시 대응
1. 즉시 새 credential 생성
2. 서버 환경 변수 업데이트
3. 기존 노출된 credential 삭제

---

## 💰 수익 목표

### 마일스톤
| 목표 | 상태 |
|------|------|
| 앱 1개 출시 | ⏳ 준비 중 |
| 다운로드 1,000 달성 | ⬜ |
| 첫 구독 수익 | ⬜ |
| 월 100만원 달성 | ⬜ |
| 10개 앱 출시 완료 | ⬜ |

### 예상 수익 (10개 앱, 앱당 1,000 다운로드 기준)
- 보수적 (5% 전환): 월 105~210만원
- 낙관적 (10% 전환): 월 210~420만원

---

## 완료된 작업 요약

| 날짜 | 주요 작업 |
|------|-----------|
| 2026-01-30 | 프로젝트 초기 설정, GitHub 레포 생성 |
| 2026-02-02 | Render 배포, PostgreSQL 마이그레이션 |
| 2026-02-03 | 개인정보 처리방침, 이용약관 페이지 추가 |
| 2026-02-04 | API 키 보안 강화, Git 히스토리 정리 |
| 2026-02-05 | 공지사항 시스템 구현 |
| 2026-02-06 | 기능 간소화 (이메일/회원가입/마이페이지 제거), 11개 언어 번역 완료, Render 환경 정리 |
| 2026-02-07 | 다국어 3개 추가 (Thai, Indonesian, Vietnamese) → 14개 언어 지원 |

---

*마지막 업데이트: 2026-02-07*
