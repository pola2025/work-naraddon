import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth-options'
import dbConnect from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'

// 업무 목록 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const assignee = searchParams.get('assignee')

    // 필터 조건
    const filter: any = {}
    if (status) filter.status = status
    if (assignee) filter.assignee = assignee

    const tasks = await TaskModel.find(filter)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ tasks }, { status: 200 })
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json({ error: '업무 목록 조회 실패' }, { status: 500 })
  }
}

// 업무 생성
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { title, description, assignee, priority, dueDate } = await req.json()

    if (!title || !assignee) {
      return NextResponse.json(
        { error: '제목과 담당자는 필수입니다' },
        { status: 400 }
      )
    }

    await dbConnect()

    const task = await TaskModel.create({
      title,
      description: description || '',
      assignee,
      requester: session.user.id,
      priority: priority || 'medium',
      status: 'requested',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      comments: [],
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json({ error: '업무 생성 실패' }, { status: 500 })
  }
}
