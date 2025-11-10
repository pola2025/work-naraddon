import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth-options'
import dbConnect from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'

// 댓글 추가
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { content } = await req.json()

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: '댓글 내용을 입력해주세요' }, { status: 400 })
    }

    await dbConnect()

    const task = await TaskModel.findById(params.id)

    if (!task) {
      return NextResponse.json({ error: '업무를 찾을 수 없습니다' }, { status: 404 })
    }

    // 자동 넘버링: 현재 댓글 개수 + 1
    const commentNumber = task.comments.length + 1

    const newComment = {
      number: commentNumber,
      author: session.user.id,
      content: content.trim(),
      createdAt: new Date(),
    }

    task.comments.push(newComment)
    await task.save()

    return NextResponse.json({ comment: newComment }, { status: 201 })
  } catch (error) {
    console.error('Add comment error:', error)
    return NextResponse.json({ error: '댓글 추가 실패' }, { status: 500 })
  }
}
