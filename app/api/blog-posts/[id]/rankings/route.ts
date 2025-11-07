import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth-options'
import dbConnect from '@/lib/mongodb'
import BlogPostModel from '@/lib/models/BlogPost'

// 순위 기록 추가
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    console.log('Session data:', JSON.stringify(session, null, 2))

    const { rank, note } = await req.json()

    if (!rank || rank < 1) {
      return NextResponse.json(
        { error: '올바른 순위를 입력해주세요' },
        { status: 400 }
      )
    }

    await dbConnect()

    const post = await BlogPostModel.findById(params.id)

    if (!post) {
      return NextResponse.json({ error: '블로그 포스팅을 찾을 수 없습니다' }, { status: 404 })
    }

    // 새 순위 기록 추가
    const newRanking = {
      rank,
      checkedAt: new Date(),
      checkedBy: session.user?.name || session.user?.email || 'Unknown',
    }

    const updatedPost = await BlogPostModel.findByIdAndUpdate(
      params.id,
      {
        $push: { rankings: newRanking },
      },
      { new: true }
    )

    return NextResponse.json({ post: updatedPost }, { status: 201 })
  } catch (error) {
    console.error('Add ranking error:', error)
    return NextResponse.json({ error: '순위 기록 추가 실패' }, { status: 500 })
  }
}
