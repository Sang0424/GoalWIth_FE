---
trigger: always_on
---

# React Native 개발 규칙

## 프로젝트 구조
- `src/` 폴더 하위에 모든 소스코드 구성
- `src/components/` - 재사용 가능한 컴포넌트
- `src/screens/` - 화면별 컴포넌트
- `src/navigation/` - 네비게이션 설정
- `src/services/` - API 호출 및 외부 서비스
- `src/utils/` - 유틸리티 함수
- `src/hooks/` - 커스텀 훅
- `src/constants/` - 상수 정의
- `src/types/` - TypeScript 타입 정의

## 워크플로우 선호도 - “이런 방식으로 작업하세요”
- 기본 과정
  - 초점: 지정된 코드만 수정하고, 다른 부분은 그대로 두세요.
  - 단계: 큰 작업을 단계로 나누고, 각 단계 후에는 승인을 기다리세요.
  - 계획: 큰 변경 전에는 설계 및 작업개요 문서 [이슈명]_design.md 와 구현 계획 문서 [이슈명]_plan.md를 작성하고 확인을 기다리세요.
  - 추적: 완료된 작업은 progress.md에 기록하고, 다음 단계는 TODO.txt에 기록하세요.
- 고급 워크플로우
  - 테스팅: 주요 기능에 대한 포괄적인 테스트를 포함하고, 엣지 케이스 테스트를 제안하세요.
  - 컨텍스트 관리: 컨텍스트가 100k 토큰을 초과하면 context-summary.md로 요약하고 세션을 재시작하세요.
  - 적응성: 피드백에 따라 체크포인트 빈도를 조정하세요(더 많거나 적은 세분화).

## 커뮤니케이션 선호도 - “이렇게 소통하세요”
- 기본 소통
  - 요약: 각 컴포넌트 후에 완료된 작업을 요약하세요.
  - 변경 규모: 변경을 작은, 중간, 큰 규모로 분류하세요.
  - 명확화: 요청이 불명확하면 진행 전에 질문하세요.
- 정밀 소통
  - 계획: 큰 변경의 경우 구현 계획을 제공하고 승인을 기다리세요.
  - 추적: 항상 완료된 작업과 대기 중인 작업을 명시하세요.
  - 감정적 신호: 긴급성이 표시되면(예: “이것은 중요합니다—집중해주세요!”) 주의와 정확성을 우선시하세요.

## 코딩 스타일
- TypeScript 사용 필수
- 함수형 컴포넌트와 React Hooks 사용
- 컴포넌트명은 PascalCase
- 파일명은 PascalCase (컴포넌트), camelCase (유틸리티)
- 상수는 UPPER_SNAKE_CASE
- 최대한 중복을 피하고 기존 기능 재사용 지향
- 컴포넌트는 최소한의 책임을 가지도록 분리
- type 정의는 별도 파일로 분리
- 최대한 any 사용을 피하고 타입을 명확하게 정의하세요
- expo를 사용하지 않으니 expo에 관련된 패키지는 절대 사용하지 마세요

## 스타일링
- StyleSheet.create() 사용하여 스타일 정의
- 인라인 스타일 지양
- 공통 스타일은 별도 파일로 분리
- Flexbox 레이아웃 우선 사용
- 반응형 디자인을 위해 Dimensions API 활용
- 키보드가 올라오는 것을 고려해서 적절한 마진, 패딩값 또는 키보드를 피하기 위한 방법 활용

## 상태 관리
- 로컬 상태: useState, useReducer
- 전역 상태: zustand
- 서버 상태: React Query, tanstack query 사용

## 네비게이션
- React Navigation v6 사용
- Stack, Tab, Drawer 네비게이션 적절히 조합
- 타입 안전한 네비게이션을 위해 navigation typing 설정

## API 통신
- Axios 사용
- 환경별 base URL 설정
- 에러 처리 및 로딩 상태 관리
- 인터셉터를 통한 공통 헤더 설정

## 성능 최적화
- FlatList, VirtualizedList 사용으로 긴 리스트 최적화
- React.memo, useMemo, useCallback 적절히 활용
- 이미지 최적화: react-native-fast-image 고려
- 번들 크기 최적화를 위한 dynamic import

## 플랫폼별 고려사항
- Platform.OS로 iOS/Android 분기 처리
- 플랫폼별 스타일 분리 (styles.ios.ts, styles.android.ts)
- 안전 영역 처리: react-native-safe-area-context
- 키보드 처리: KeyboardAvoidingView, react-native-keyboard-aware-scroll-view

## 테스팅
- Jest + React Native Testing Library 사용
- 컴포넌트 단위 테스트 작성
- E2E 테스트: Detox 또는 Maestro
- Flipper를 통한 디버깅

## 코드 품질
- ESLint + Prettier 설정
- Husky + lint-staged로 pre-commit 훅 설정
- 절대 경로 import 설정 (babel-plugin-module-resolver)

## 권한 처리
- react-native-permissions 라이브러리 사용
- 권한 요청 전 사용자에게 설명 제공
- 권한 거부 시 대체 플로우 제공

## 빌드 및 배포
- Fastlane을 통한 자동화된 빌드/배포
- 환경별 설정 분리 (development, staging, production)
- 코드 사이닝 및 프로비저닝 프로필 관리

## 에러 처리
- ErrorBoundary 컴포넌트 구현
- 크래시 리포팅: Crashlytics 또는 Sentry
- 사용자 친화적 에러 메시지 제공

## 보안
- 민감한 정보는 Keychain/Keystore에 저장
- API 키는 환경변수로 관리
- SSL Pinning 고려 (react-native-ssl-pinning)

## 국제화
- react-native-localize 사용
- 다국어 지원을 위한 i18n 설정
- 날짜, 숫자, 통화 포맷팅

## 추천 라이브러리
- Navigation: @react-navigation/native
- UI: react-native-elements, NativeBase, 또는 Tamagui
- Icons: react-native-vector-icons
- Animation: react-native-reanimated
- Form: react-hook-form
- HTTP: axios
- 상태관리: zustand
- 데이터 fetching: @tanstack/react-query