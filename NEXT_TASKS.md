# 다음 작업 목록 - Firebase 통합

## 완료된 작업
- [x] FAQ 수정: "앱은 무료인가요?" 답변 변경
- [x] FAQ 수정: "데이터 백업" 항목 삭제
- [x] "클라우드 백업" → "100% 로컬 저장" 메시지 변경 (11개 언어)
- [x] Hero 섹션 평점/다운로드 숫자 초기화 ("-"로 변경)
- [x] Firebase 관리자 인증 통합 완료!

---

## Firebase 통합 완료 내역 (2026-01-30)

### 설치된 패키지
- 클라이언트: `firebase`
- 서버: `firebase-admin`

### 생성/수정된 파일

**클라이언트:**
- `client/src/config/firebase.js` - Firebase 설정 및 Google 로그인 함수
- `client/src/hooks/useAuth.jsx` - Firebase 인증으로 변경
- `client/src/pages/admin/Login.jsx` - Google 로그인 버튼 UI
- `client/src/pages/admin/Admin.css` - Google 버튼 스타일 추가
- `client/src/utils/api.js` - firebase-login 엔드포인트 추가

**서버:**
- `server/config/firebase.js` - Firebase Admin SDK 초기화
- `server/middleware/auth.js` - Firebase 토큰 검증 지원
- `server/routes/auth.js` - /firebase-login 엔드포인트 추가
- `server/app.js` - Firebase 초기화 코드 추가
- `server/firebase-service-account.json` - 서비스 계정 키 (gitignore됨)

**기타:**
- `.gitignore` - Firebase 서비스 계정 파일 추가

### 인증 방식
- Google OAuth 로그인 (Firebase Authentication)
- 관리자 이메일: `chgykim0@gmail.com`
- 이메일이 일치하면 관리자 권한 부여, 아니면 거부

### 보안
- 서비스 계정 키 파일은 `.gitignore`에 추가됨
- 프로덕션 배포 시 환경변수로 설정 가능

---

## 다음 작업 (선택사항)

### 프로덕션 배포 준비
- [ ] Firebase Hosting 설정 (선택)
- [ ] 환경변수로 서비스 계정 정보 설정
- [ ] CORS 설정 업데이트 (필요시)

### 추가 기능 (선택)
- [ ] 관리자 여러 명 지원 (이메일 목록)
- [ ] 로그인 기록 저장
- [ ] 세션 만료 알림

---

*마지막 업데이트: 2026-01-30*
