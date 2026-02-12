&nbsp;WayMoments — Claude Code MAX 개발용 전체 명세서

1\) 프로젝트 개요

프로젝트명: WayMoments

개발환경: macOS (Mac mini M4), Android Studio, Flutter

타겟 플랫폼: iOS + Android

백엔드: Firebase (Auth, Firestore, Storage, Functions)

AI 엔진: Google Gemini API (Cloud Functions 통해 호출)

비즈니스 모델: 무료 버전 없음 → 2주 무료 체험 → 월/연간 구독

핵심 가치:

• 	자동 기록

• 	감성 기반 타임라인

• 	음성/사진/대화/분위기 자동 수집

• 	AI 감성 에세이

• 	자연 확산 구조(모임에서 자동 노출)



2\) 앱의 목적

WayMoments는 사용자가 아무 행동도 하지 않아도

모임·대화·사진·감정·분위기·일정을 자동으로 기록하고

세션 종료 시 감성 타임라인 + 감성 에세이를 생성하는 앱이다.

이 앱은 “기록은 기술이 하고, 감성은 사람이 느낀다”라는 철학을 기반으로 한다.



3\) 전체 기능 명세 (Claude가 구현해야 할 기능)



A. 세션 관리

• 	세션 시작/종료

• 	세션 ID 생성

• 	세션별 타임라인 데이터 저장

• 	세션별 사진/음성/텍스트 묶음 처리



B. 음성 처리

1\) 로컬 녹음

• 	Flutter audio recorder 사용

• 	세션 동안 자동 녹음

2\) STT (Gemini)

• 	Cloud Functions → Gemini Speech-to-Text

• 	대화 텍스트 생성

• 	타임라인에 자동 배치

3\) 대화 분석

• 	주요 주제 추출

• 	감정 분석

• 	분위기 태그 생성



C. 사진 처리

• 	세션 시간대에 찍힌 사진 자동 감지

• 	자동 리사이즈

• 	감성 스타일 적용(톤 조정)

• 	타임라인에 자동 배치



D. AI 감성 기능

1\) 감성 에세이 생성

• 	세션 전체 내용을 기반으로 감성 문장 생성

2\) AI 삽화 생성

• 	Gemini Image Generation

• 	감성 일러스트 자동 생성

• 	타임라인 카드에 삽입



E. 타임라인 UI

• 	시간순 카드 구조

• 	대화 카드

• 	사진 카드

• 	감성 카드

• 	AI 삽화 카드

• 	감성 에세이 블록



F. 동의 시스템 (Voice Consent)

• 	최소 2명 이상의 음성 동의 필요

• 	녹음 재생/AI 음성/대신 말하기 차단

• 	동의 실패 시 세션 시작 불가



G. 위치 기반 자동 차단

• 	집/숙소/병원/민감 장소 자동 차단

• 	카페/식당/여행지 등은 동의 기반 허용



\[개발 지침서]

당신은 Flutter + Firebase + Gemini 기반의 앱 WayMoments를 개발하는 엔지니어입니다.

아래 명세에 따라 전체 프로젝트 구조, 코드, 아키텍처, 모듈, UI, API 연동을 설계하고 구현하십시오.



1\. 프로젝트 구조 설계

Flutter 클린 아키텍처 기반으로 다음 구조를 생성하십시오:



lib/

&nbsp;├─ presentation/

&nbsp;│   ├─ screens/

&nbsp;│   ├─ widgets/

&nbsp;│   └─ state/

&nbsp;├─ application/

&nbsp;│   ├─ usecases/

&nbsp;│   └─ services/

&nbsp;├─ domain/

&nbsp;│   ├─ entities/

&nbsp;│   └─ repositories/

&nbsp;└─ infrastructure/

&nbsp;    ├─ firebase/

&nbsp;    ├─ ai/

&nbsp;    ├─ audio/

&nbsp;    ├─ media/

&nbsp;    └─ subscription/



2\. Firebase 연동

• 	Auth: 익명 로그인 또는 이메일 로그인

• 	Firestore: 세션/타임라인 저장

• 	Storage: 음성/사진 저장

• 	Functions: Gemini API 호출

Cloud Functions는 다음 엔드포인트를 포함해야 합니다:

• 	/speechToText

• 	/summarize

• 	/emotion

• 	/essay

• 	/imageGenerate



3\. 세션 기능 구현

• 	 생성

• 	세션 시작 시:

• 	세션 ID 생성

• 	로컬 녹음 시작

• 	타임라인 초기화

• 	세션 종료 시:

• 	녹음 종료

• 	STT 요청

• 	요약/감정 분석 요청

• 	감성 에세이 생성

• 	타임라인 완성



4\. 음성 녹음 + STT

Flutter 패키지:

• 	record

• 	just\_audio

STT는 Cloud Functions → Gemini API로 처리.



5\. 사진 처리

• 	갤러리 접근 권한 요청

• 	세션 시간대 사진 필터링

• 	자동 리사이즈

• 	감성 스타일 적용(간단한 필터)



6\. 타임라인 UI

Flutter로 다음 카드 위젯을 생성:

• 	ConversationCard

• 	PhotoCard

• 	EmotionCard

• 	IllustrationCard

• 	EassayCard



7\. 구독 시스템

Flutter 패키지:

• 	in\_app\_purchase

구독 플로우:

• 	앱 설치 → 2주 체험 자동 시작

• 	체험 종료 → 구독 화면 강제 표시

• 	구독 없으면 앱 기능 잠금



8\. 다국어 지원

Flutter Intl 사용

기본 언어: 한국어/영어

문자열은 모두  폴더로 분리



9\. 설정 화면

• 	개발자 홈페이지 링크

• 	사용 설명서 링크

• 	언어 변경

• 	구독 상태 표시



10\. 전체 UI 와이어프레임 생성 요청

Claude는 다음 화면의 와이어프레임을 생성해야 합니다:

• 	홈 화면

• 	세션 진행 화면

• 	세션 요약 화면

• 	설정 화면

• 	구독 화면



“위 명세서를 기반으로 전체 프로젝트 구조, 코드 템플릿, Firebase 연동 코드, Cloud Functions 코드, UI 위젯, 모델, 서비스, 리포지토리, 라우팅, pubspec.yaml 의존성까지 모두 생성하라.”













