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

---

## 프로젝트 구조

```
codeworks-lab-homepage/
├── client/                     # React 클라이언트 (Vite)
│   ├── src/
│   │   ├── components/         # UI 컴포넌트
│   │   ├── pages/              # 페이지 컴포넌트
│   │   ├── locales/            # 다국어 번역 (11개 언어)
│   │   └── utils/api.js        # API 통신
│   ├── dist/                   # 빌드 결과물
│   └── package.json
│
├── server/                     # Express.js 서버
│   ├── routes/                 # API 라우트
│   ├── models/db.js            # PostgreSQL 연결 및 모델
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

---

## 홈페이지 관리 작업

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

*마지막 업데이트: 2026-02-02*
*맥미니 M4 환경 설정 가이드 + 보안 조치 + 수익 목표 완료*
