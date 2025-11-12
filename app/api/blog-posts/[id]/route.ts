import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth-options'
import dbConnect from '@/lib/mongodb'
import BlogPostModel from '@/lib/models/BlogPost'

// 블로그 포스팅 상세 조회
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    await dbConnect()

    const post = await BlogPostModel.findById(params.id).lean()

    if (!post) {
      return NextResponse.json({ error: '블로그 포스팅을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ post }, { status: 200 })
  } catch (error) {
    console.error('Get blog post error:', error)
    return NextResponse.json({ error: '블로그 포스팅 조회 실패' }, { status: 500 })
  }
}

// 블로그 포스팅 수정
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const updates = await req.json()

    await dbConnect()

    const post = await BlogPostModel.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!post) {
      return NextResponse.json({ error: '블로그 포스팅을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ post }, { status: 200 })
  } catch (error) {
    console.error('Update blog post error:', error)
    return NextResponse.json({ error: '블로그 포스팅 수정 실패' }, { status: 500 })
  }
}

// 블로그 포스팅 삭제
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    await dbConnect()

    const post = await BlogPostModel.findById(params.id)

    if (!post) {
      return NextResponse.json({ error: '블로그 포스팅을 찾을 수 없습니다' }, { status: 404 })
    }

    // 작성자 또는 관리자만 삭제 가능
    const userId = session.user?.id || session.user?.email
    const isAdmin = session.user?.role === 'admin' || session.user?.role === 'master'
    if (post.author !== userId && !isAdmin) {
      return NextResponse.json({ error: '삭제 권한이 없습니다' }, { status: 403 })
    }

    await BlogPostModel.findByIdAndDelete(params.id)

    return NextResponse.json({ message: '블로그 포스팅이 삭제되었습니다' }, { status: 200 })
  } catch (error) {
    console.error('Delete blog post error:', error)
    return NextResponse.json({ error: '블로그 포스팅 삭제 실패' }, { status: 500 })
  }
}
