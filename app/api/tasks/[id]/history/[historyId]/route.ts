import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth-options'
import dbConnect from '@/lib/mongodb'
import TaskHistoryModel from '@/lib/models/TaskHistory'

// 히스토리 수정
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; historyId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    await dbConnect()

    // 히스토리 조회
    const history = await TaskHistoryModel.findById(params.historyId)
    if (!history) {
      return NextResponse.json({ error: '히스토리를 찾을 수 없습니다' }, { status: 404 })
    }

    // 권한 확인: 작성자 본인 또는 관리자만 수정 가능
    const isAdmin = session.user.role === 'admin' || session.user.role === 'master'
    const isAuthor = history.author === session.user.id

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: '수정 권한이 없습니다' }, { status: 403 })
    }

    const updates = await req.json()

    // 허용된 필드만 업데이트
    const allowedFields = ['status', 'title', 'content', 'attachments']
    const sanitizedUpdates: any = {}

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field]
      }
    }

    // 제목 검증
    if (sanitizedUpdates.title !== undefined) {
      if (!sanitizedUpdates.title || !sanitizedUpdates.title.trim()) {
        return NextResponse.json({ error: '제목은 필수입니다' }, { status: 400 })
      }
      sanitizedUpdates.title = sanitizedUpdates.title.trim()
    }

    const updatedHistory = await TaskHistoryModel.findByIdAndUpdate(
      params.historyId,
      { $set: sanitizedUpdates },
      { new: true, runValidators: true }
    )

    return NextResponse.json({ history: updatedHistory, message: '히스토리가 수정되었습니다' }, { status: 200 })
  } catch (error) {
    console.error('Update task history error:', error)
    return NextResponse.json({ error: '히스토리 수정 실패' }, { status: 500 })
  }
}

// 히스토리 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; historyId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    await dbConnect()

    // 히스토리 조회
    const history = await TaskHistoryModel.findById(params.historyId)
    if (!history) {
      return NextResponse.json({ error: '히스토리를 찾을 수 없습니다' }, { status: 404 })
    }

    // 권한 확인: 작성자 본인 또는 관리자만 삭제 가능
    const isAdmin = session.user.role === 'admin' || session.user.role === 'master'
    const isAuthor = history.author === session.user.id

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: '삭제 권한이 없습니다' }, { status: 403 })
    }

    await TaskHistoryModel.findByIdAndDelete(params.historyId)

    return NextResponse.json({ message: '히스토리가 삭제되었습니다' }, { status: 200 })
  } catch (error) {
    console.error('Delete task history error:', error)
    return NextResponse.json({ error: '히스토리 삭제 실패' }, { status: 500 })
  }
}
