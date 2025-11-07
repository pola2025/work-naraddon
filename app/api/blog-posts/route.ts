import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth-options'
import dbConnect from '@/lib/mongodb'
import BlogPostModel from '@/lib/models/BlogPost'

// 블로그 포스팅 목록 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get('keyword')

    // 필터 조건
    const filter: any = {}
    if (keyword) {
      filter.keyword = { $regex: keyword, $options: 'i' }
    }

    const posts = await BlogPostModel.find(filter)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ posts }, { status: 200 })
  } catch (error) {
    console.error('Get blog posts error:', error)
    return NextResponse.json({ error: '블로그 포스팅 목록 조회 실패' }, { status: 500 })
  }
}

// 블로그 포스팅 생성
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { title, url, keyword, ranking } = await req.json()

    if (!title || !url || !keyword || !ranking) {
      return NextResponse.json(
        { error: '제목, URL, 키워드, 검색순위는 필수입니다' },
        { status: 400 }
      )
    }

    await dbConnect()

    // 현재 월 키 생성 (예: 2025-01)
    const now = new Date()
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const authorId = session.user?.id || session.user?.email || 'unknown'

    console.log('=== 포스팅 생성 디버그 ===')
    console.log('monthKey:', monthKey)
    console.log('authorId:', authorId)
    console.log('author:', session.user?.name || session.user?.email || 'unknown')

    // 해당 작성자의 해당 월 마지막 일련번호 조회
    const lastPost = await BlogPostModel.findOne({
      monthKey,
      authorId,
      serialNumber: { $exists: true, $ne: null }
    })
      .sort({ serialNumber: -1 })
      .lean()

    console.log('lastPost:', lastPost)
    const serialNumber = lastPost && lastPost.serialNumber ? lastPost.serialNumber + 1 : 1
    console.log('새 serialNumber:', serialNumber)

    const post = await BlogPostModel.create({
      title,
      url,
      keyword,
      rankings: [
        {
          rank: parseInt(ranking),
          checkedAt: new Date(),
          checkedBy: authorId,
        }
      ],
      author: session.user?.name || session.user?.email || 'unknown',
      authorId,
      monthKey,
      serialNumber,
    })

    console.log('생성된 포스트:', JSON.stringify(post, null, 2))

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Create blog post error:', error)
    return NextResponse.json({ error: '블로그 포스팅 생성 실패' }, { status: 500 })
  }
}
