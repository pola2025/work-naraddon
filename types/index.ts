// 사용자
export interface User {
  _id: string
  email: string
  name: string
  role: 'master' | 'admin' | 'user'
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

// 업무 (칸반 보드)
export interface Task {
  _id: string
  number: number // 업무 넘버링 (1, 2, 3...)
  title: string
  description: string
  category: '기능개발' | '디자인' | '마케팅' | '기타'
  status: 'preparing' | 'in_progress' | 'completed'
  url?: string
  attachments?: Attachment[]
  expectedDueDate?: Date // 예상마감일
  completedAt?: Date // 완료일 (자동 기록)
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
}

// 첨부파일
export interface Attachment {
  _id?: string
  filename: string
  url: string
  size: number
  mimeType: string
  uploadedAt: Date
}

// 댓글
export interface Comment {
  _id: string
  author: string // user _id
  content: string
  createdAt: Date
}

// 업무 히스토리 (작업 이력)
export interface TaskHistory {
  _id: string
  taskId: string // 연결된 업무 ID
  status: 'making' | 'confirming' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  title: string // 히스토리 제목 (필수)
  content?: string // 상세 내용 (선택)
  attachments?: Attachment[] // 첨부파일
  author: string // 작성자 ID (user._id)
  authorName: string // 작성자 이름 (스냅샷)
  createdAt: Date
  updatedAt: Date
}

// 운영 계정
export interface OperatingAccount {
  _id: string
  platform: string // 플랫폼 (네이버, 구글, AWS 등)
  accountName: string // 계정 이름
  username: string // 아이디
  password: string // 비밀번호
  note?: string // 메모
  lastUsedAt?: Date
  createdBy: string // user _id
  createdAt: Date
  updatedAt: Date
}

// 블로그 포스팅 기록
export interface BlogPost {
  _id: string
  title: string // 포스팅 제목
  url: string // 포스팅 URL
  keyword: string // 검색 키워드
  rankings: Ranking[] // 순위 기록
  author: string // 작성자 이름 (user.name)
  authorId?: string // user _id
  monthKey?: string // 월별 구분 (예: 2025-01)
  serialNumber?: number // 월별 일련번호 (예: 1, 2, 3...)
  createdAt: Date
  updatedAt: Date
}

// 순위 기록
export interface Ranking {
  rank: number
  checkedAt: Date
  checkedBy: string // user _id
}

// NextAuth 세션
export interface Session {
  user: {
    id: string
    email: string
    name: string
    role: 'master' | 'admin' | 'user'
    isApproved: boolean
  }
}
