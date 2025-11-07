# Dev Server Manager Skill

**목적**: 개발 서버를 PowerShell을 통해 안전하게 관리

## 자동 실행 조건

다음 작업 시도 시 이 Skill이 자동으로 실행됩니다:
- `npm run dev`, `npm start`, `yarn dev` 등 개발서버 시작 명령
- `netstat`, `taskkill` 등 포트/프로세스 관리 명령
- 포트 3000~3999 관련 작업

## 실행 순서

### 1. PowerShell로 포트 확인
```powershell
netstat -ano | findstr :3000
```

### 2. 실행 중인 프로세스 확인
- PID 추출
- 프로세스 정보 확인

### 3. 관리자 권한으로 프로세스 종료
```powershell
Stop-Process -Id [PID] -Force
```

### 4. 캐시 정리 (선택)
```bash
rm -rf .next
rm -rf node_modules/.cache
```

### 5. 개발서버 재시작
```bash
npm run dev
```

## 필수 규칙

1. **항상 PowerShell 사용**
   - bash로 taskkill 실행 금지
   - PowerShell 명령어만 사용

2. **권한 확보**
   - Stop-Process는 관리자 권한 필요
   - 권한 부족 시 사용자에게 안내

3. **포트 고정**
   - 항상 3000번 포트 사용
   - 3001, 3002 등으로 넘어가지 말 것

4. **에러 처리**
   - 각 단계별 에러 확인
   - 실패 시 사용자에게 구체적으로 보고

## 위반 감지

다음 명령 시도 시 즉시 중단하고 이 Skill 실행:
- `taskkill` (bash에서)
- `kill` (bash에서)
- `npm run dev` (포트 확인 없이)

## 예시

### ✅ 올바른 실행
```
1. [PowerShell] netstat -ano | findstr :3000
2. [확인] PID 12345가 3000 포트 사용 중
3. [PowerShell] Stop-Process -Id 12345 -Force
4. [Bash] rm -rf .next
5. [Bash] npm run dev
6. [확인] http://localhost:3000 서버 실행 중
```

### ❌ 잘못된 실행
```
❌ [Bash] taskkill /F /PID 12345
   → PowerShell 사용 필요

❌ [Bash] npm run dev
   → 포트 확인 없이 실행 금지

❌ 3001번 포트로 실행
   → 항상 3000번 포트 사용
```

## 사용자 피드백

각 단계별로 사용자에게 명확히 보고:
- "포트 3000 확인 중..."
- "PID 12345 프로세스 종료 중..."
- "캐시 삭제 중..."
- "개발서버 시작 중..."
- "✅ http://localhost:3000 에서 실행 중입니다"
