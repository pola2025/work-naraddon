import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth-options'
import dbConnect from '@/lib/mongodb'
import TaskHistoryModel from '@/lib/models/TaskHistory'
import TaskModel from '@/lib/models/Task'
import { sendTaskHistoryNotification } from '@/lib/telegram/notification'

// 업무의 히스토리 목록 조회
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    await dbConnect()

    // URL 파라미터 파싱
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 0 // 0 = 전체
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    // 업무 존재 여부 확인
    const task = await TaskModel.findById(params.id)
    if (!task) {
      return NextResponse.json({ error: '업무를 찾을 수 없습니다' }, { status: 404 })
    }

    // 히스토리 조회 (최신순)
    let query = TaskHistoryModel.find({ taskId: params.id }).sort({ createdAt: -1 })

    if (offset > 0) {
      query = query.skip(offset)
    }

    if (limit > 0) {
      query = query.limit(limit)
    }

    const histories = await query.lean()

    // 전체 개수
    const total = await TaskHistoryModel.countDocuments({ taskId: params.id })

    return NextResponse.json({ histories, total }, { status: 200 })
  } catch (error) {
    console.error('Get task histories error:', error)
    return NextResponse.json({ error: '히스토리 조회 실패' }, { status: 500 })
  }
}

// 새 히스토리 추가
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 관리자만 히스토리 추가 가능
    const isAdmin = session.user.role === 'admin' || session.user.role === 'master'
    if (!isAdmin) {
      return NextResponse.json({ error: '히스토리 추가 권한이 없습니다' }, { status: 403 })
    }

    const body = await req.json()
    const { status, title, content, attachments } = body

    // 필수 필드 검증
    if (!title || !title.trim()) {
      return NextResponse.json({ error: '제목은 필수입니다' }, { status: 400 })
    }

    await dbConnect()

    // 업무 존재 여부 확인
    const task = await TaskModel.findById(params.id)
    if (!task) {
      return NextResponse.json({ error: '업무를 찾을 수 없습니다' }, { status: 404 })
    }

    // 히스토리 생성
    const history = await TaskHistoryModel.create({
      taskId: params.id,
      status: status || 'in_progress',
      title: title.trim(),
      content: content || '',
      attachments: attachments || [],
      author: session.user.id,
      authorName: session.user.name,
    })

    // 텔레그램 알림 전송 (비동기, 실패해도 히스토리 생성은 성공)
    const taskUrl = `https://work.naraddon.com/tasks` // 또는 실제 배포 URL
    sendTaskHistoryNotification({
      taskNumber: task.number,
      taskTitle: task.title,
      historyStatus: history.status,
      historyTitle: history.title,
      historyContent: history.content,
      authorName: session.user.name,
      taskUrl,
    }).catch((error) => {
      console.error('Failed to send Telegram notification:', error)
    })

    return NextResponse.json({ history, message: '작업 이력이 추가되었습니다' }, { status: 201 })
  } catch (error) {
    console.error('Create task history error:', error)
    return NextResponse.json({ error: '히스토리 추가 실패' }, { status: 500 })
  }
}
