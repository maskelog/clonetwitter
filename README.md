# clonetwitter

## 프로젝트 개요

이 프로젝트는 실시간 채팅과 소셜 미디어 기능을 결합한 웹 애플리케이션입니다. 사용자는 메시지를 주고받을 수 있을 뿐만 아니라, 타임라인을 통해 소식을 공유하고, 프로필 페이지에서 개인 정보를 관리할 수 있습니다. 본 애플리케이션은 React, TypeScript 및 Vite를 사용하여 개발되었으며, Firebase를 사용하여 인증, 데이터베이스, 스토리지 기능을 구현했습니다. GitHub 로그인 기능을 포함하여 다양한 인증 옵션을 제공합니다.

## 바로 사용하기

프로젝트를 바로 체험해 보고 싶다면, [여기](https://nwitter-reloaded-5757c.firebaseapp.com/)에서 접속하세요. 테스트 계정으로 로그인할 수 있습니다:

- **Email**: test@test.com
- **Password**: qwer1234

또한 GitHub 계정을 사용하여 로그인할 수도 있습니다.

## 주요 기능

- 실시간 채팅
- 타임라인
- 프로필 페이지
- 트윗 작성
- 메시지에 사진 전송
- GitHub 로그인
- 리트윗 기능: 사용자는 타임라인의 트윗을 리트윗할 수 있습니다. 리트윗은 원본 트윗 아래에 사용자의 이름과 함께 표시됩니다.
- 좋아요 기능: 사용자는 타임라인의 트윗이나 상세 페이지에서 "트윗 좋아요"할 수 있습니다. 각 트윗에는 좋아요 수가 표시됩니다.

## 리트윗 기능 구현 세부 정보

리트윗 기능은 Firebase Firestore의 `retweets` 컬렉션을 사용하여 구현됩니다. 사용자가 트윗을 리트윗할 때, 해당 트윗의 ID와 리트윗한 사용자의 ID 및 이름이 `retweets` 컬렉션에 문서로 저장됩니다. 타임라인 또는 트윗 상세 페이지에서 리트윗을 표시할 때는 원본 트윗과 함께 이 정보를 불러와 표시합니다.

## 좋아요 기능 구현 세부 정보

좋아요 기능은 Firebase Firestore의 `likes` 컬렉션을 사용하여 구현됩니다. 사용자가 트윗을 좋아요할 때, 해당 트윗의 ID와 좋아요한 사용자의 ID가 `likes` 컬렉션에 문서로 저장됩니다. 타임라인 또는 트윗 상세 페이지에서 좋아요를 표시할 때는 원본 트윗과 함께 이 정보를 불러와 표시합니다.

## 기술 스택

- **Frontend**:
  - React: UI 구축
  - TypeScript: 정적 타입 지원을 통한 개발 생산성 및 안정성 향상
  - Vite: 빠른 빌드 도구 및 HMR 지원
  - Styled-components: 컴포넌트 스타일링
- **Backend**:
  - **Firebase**:
    - **Authentication**: 사용자 인증을 위한 Firebase의 기능을 활용하여 이메일, 비밀번호 기반의 인증 및 Google, GitHub 등의 소셜 로그인 기능 구현
    - **Firestore**: NoSQL 클라우드 데이터베이스 서비스로, 실시간 데이터 동기화 기능을 제공합니다. Firestore를 통해 애플리케이션의 데이터 저장, 조회, 관리를 수행합니다.
    - **Storage**: Firebase의 클라우드 파일 저장 서비스입니다. 사용자가 생성한 이미지와 같은 미디어 파일을 저장하고 관리합니다.
- **Deployment**: Netlify, Firebase Hosting
- **Other Tools**: Git

## 설치 및 실행 방법

1. **레포지토리 복제**

```bash
git clone https://github.com/maskelog/clonetwitter.git
cd clonetwitter
```

2. **의존성 설치**

Vite와 함께 React 및 TypeScript 프로젝트를 위한 의존성을 설치합니다.

```bash
npm install
```

3. **환경 변수 설정**

`firestore.ts` 파일을 프로젝트 루트에 생성하고, Firebase 프로젝트 설정을 추가합니다.

```import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "apiKey",
  authDomain: "projectId.firebaseapp.com",
  projectId: "projectId",
  storageBucket: "projectId.appspot.com",
  messagingSenderId: "messagingSenderId",
  appId: "appId"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
```

4. **애플리케이션 실행**

Vite를 사용하여 개발 서버를 시작합니다.

```bash
npm run dev
```
