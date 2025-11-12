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

    // 필터 조건
    const filter: any = {}
    if (status) filter.status = status

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

    const body = await req.json()
    const { title, description, category, url, attachments, dueDate } = body

    console.log('📥 서버에서 받은 데이터:', body)
    console.log('📦 category 값:', category, typeof category)

    if (!title) {
      return NextResponse.json(
        { error: '제목은 필수입니다' },
        { status: 400 }
      )
    }

    if (!category) {
      console.log('❌ 카테고리 없음!')
      return NextResponse.json(
        { error: '카테고리는 필수입니다' },
        { status: 400 }
      )
    }

    await dbConnect()

    // 자동 넘버링: 현재 업무 개수 + 1
    const taskCount = await TaskModel.countDocuments()
    const taskNumber = taskCount + 1

    const task = await TaskModel.create({
      number: taskNumber,
      title,
      description: description || '',
      category,
      url: url || '',
      attachments: attachments || [],
      status: 'preparing',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      comments: [],
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json({ error: '업무 생성 실패' }, { status: 500 })
  }
}
