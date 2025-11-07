# work.naraddon.com

나라똔 내부 업무 관리 시스템

## 주요 기능

- **대시보드**: 개인화 위젯, KPI 차트, 실시간 활동 피드
- **칸반 보드**: 드래그 앤 드롭 업무 관리
- **운영 계정 관리**: 복사 기능, 최근 사용 순 정렬
- **블로그 포스팅 기록**: 네이버 블로그 검색 순위 관리

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **데이터베이스**: MongoDB (Mongoose)
- **인증**: NextAuth.js (Credentials Provider)
- **배포**: Vercel
- **UI 컴포넌트**: React Icons, @dnd-kit

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

### 4. 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
work.naraddon.com/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # 로그인/회원가입
│   ├── dashboard/         # 대시보드
│   ├── tasks/             # 칸반 보드
│   ├── accounts/          # 운영 계정
│   └── blog-posts/        # 블로그 포스팅
├── components/            # React 컴포넌트
│   ├── ui/               # 기본 UI (Button, Input, Card)
│   ├── layout/           # Header, Sidebar
│   ├── dashboard/        # 대시보드 위젯
│   └── providers/        # Context Providers
├── lib/                   # 유틸리티
│   ├── mongodb.ts        # DB 연결
│   └── models/           # Mongoose 모델
└── types/                 # TypeScript 타입
```

## MongoDB 컬렉션

- `work_users` - 사용자
- `work_tasks` - 업무
- `work_operating_accounts` - 운영 계정
- `work_blog_posts` - 블로그 포스팅 기록

## 보안

- 검색 엔진 크롤링 차단 (`robots.txt`, `X-Robots-Tag`)
- 이메일/비밀번호 인증 (bcrypt 해싱)
- 관리자 승인 시스템
- JWT 기반 세션

## 배포 (Vercel)

1. GitHub 리포지토리 연결
2. 환경 변수 설정 (`MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
3. 배포

## 개발 팀

나라똔 개발팀

---

**주의**: 이 시스템은 내부 업무용으로, 외부에 공개되지 않습니다.
