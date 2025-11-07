# Before Bash Hook - Dev Server Management

이 Hook은 Bash 명령어 실행 전에 개발서버 관련 명령어를 감지합니다.

## 감지 대상 명령어

- `npm run dev`
- `npm start`
- `yarn dev`
- `pnpm dev`
- `taskkill`
- `kill`
- `netstat` (포트 3000-3999 관련)

## Hook 실행 조건

다음 패턴 중 하나라도 매칭되면 실행:
- 명령어에 "npm run dev" 포함
- 명령어에 "taskkill" 포함
- 명령어에 ":3000", ":3001" 등 포트 번호 포함

## Hook 동작

### 1. 개발서버 시작 명령 감지 시

**조건**: `npm run dev`, `npm start`, `yarn dev` 등

**동작**:
1. 즉시 명령 차단
2. 사용자에게 경고 메시지 표시
3. dev-server Skill 자동 실행
4. 올바른 순서로 재실행

**메시지**:
```
⚠️ 개발서버 시작 명령 감지

올바른 방법:
1. PowerShell로 포트 확인
2. 관리자 권한으로 프로세스 종료
3. 개발서버 시작

dev-server Skill을 자동으로 실행합니다...
```

### 2. 프로세스 종료 명령 감지 시 (Bash)

**조건**: bash에서 `taskkill`, `kill` 실행 시도

**동작**:
1. 즉시 명령 차단
2. PowerShell 사용 안내
3. dev-server Skill 자동 실행

**메시지**:
```
❌ bash에서 프로세스 종료 시도 감지

개발서버 관련 프로세스는 반드시 PowerShell을 사용해야 합니다.

올바른 방법:
powershell.exe -Command "Stop-Process -Id [PID] -Force"

dev-server Skill을 자동으로 실행합니다...
```

### 3. 포트 확인 명령 감지 시 (Bash)

**조건**: bash에서 `netstat` 실행 시도

**동작**:
1. PowerShell 사용 권장
2. 계속 진행하되 경고 표시

**메시지**:
```
⚠️ 포트 확인은 PowerShell 사용을 권장합니다

PowerShell 명령어:
powershell.exe -Command "netstat -ano | findstr :3000"
```

## 구현 방법

Hook이 실행되면 다음을 수행:

```javascript
// 의사 코드
if (command.includes('npm run dev') || command.includes('npm start')) {
  // 개발서버 시작 명령
  blockCommand()
  showWarning()
  executeSkill('dev-server')
} else if (command.includes('taskkill') || command.includes('kill')) {
  // 프로세스 종료 명령 (bash)
  blockCommand()
  showWarning()
  executeSkill('dev-server')
} else if (command.includes('netstat') && command.includes(':3')) {
  // 포트 확인 명령
  showWarning()
  allowCommand()
}
```

## 예외 처리

다음 경우는 Hook을 실행하지 않음:
- PowerShell을 통한 명령어 실행
- dev-server Skill 내부에서의 명령어 실행
- 사용자가 명시적으로 Hook 비활성화 요청

## 설정

Hook 활성화/비활성화:
- 기본값: 활성화
- 비활성화: `.claude/hooks/before-bash.md` 파일 삭제 또는 이름 변경

## 테스트

Hook이 정상 작동하는지 테스트:
1. `npm run dev` 실행 시도
2. Hook 경고 메시지 확인
3. dev-server Skill 자동 실행 확인
