import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth-options'
import dbConnect from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'

// 업무 상세 조회
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    await dbConnect()

    const task = await TaskModel.findById(params.id).lean()

    if (!task) {
      return NextResponse.json({ error: '업무를 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ task }, { status: 200 })
  } catch (error) {
    console.error('Get task error:', error)
    return NextResponse.json({ error: '업무 조회 실패' }, { status: 500 })
  }
}

// 업무 수정 (상태 변경 포함)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const updates = await req.json()

    await dbConnect()

    const task = await TaskModel.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!task) {
      return NextResponse.json({ error: '업무를 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ task }, { status: 200 })
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json({ error: '업무 수정 실패' }, { status: 500 })
  }
}

// 업무 삭제
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    await dbConnect()

    const task = await TaskModel.findById(params.id)

    if (!task) {
      return NextResponse.json({ error: '업무를 찾을 수 없습니다' }, { status: 404 })
    }

    // 관리자만 삭제 가능
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: '삭제 권한이 없습니다' }, { status: 403 })
    }

    await TaskModel.findByIdAndDelete(params.id)

    return NextResponse.json({ message: '업무가 삭제되었습니다' }, { status: 200 })
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json({ error: '업무 삭제 실패' }, { status: 500 })
  }
}
