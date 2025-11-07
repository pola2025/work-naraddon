import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth-options'
import dbConnect from '@/lib/mongodb'
import BlogPostModel from '@/lib/models/BlogPost'

// 월별 작성 통계 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    await dbConnect()

    // 모든 포스트를 가져와서 월별, 작성자별로 그룹화
    const posts = await BlogPostModel.find({})
      .select('monthKey author authorId createdAt')
      .lean()

    // 월별, 작성자별로 그룹화
    const statsMap = new Map<string, Map<string, number>>()

    posts.forEach(post => {
      if (!post.author) return

      // monthKey가 없으면 createdAt에서 생성
      let monthKey = post.monthKey
      if (!monthKey && post.createdAt) {
        const date = new Date(post.createdAt)
        monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      }
      if (!monthKey) return

      if (!statsMap.has(monthKey)) {
        statsMap.set(monthKey, new Map())
      }

      const monthMap = statsMap.get(monthKey)!
      const currentCount = monthMap.get(post.author) || 0
      monthMap.set(post.author, currentCount + 1)
    })

    // Map을 배열로 변환
    const stats = Array.from(statsMap.entries())
      .map(([monthKey, authorsMap]) => ({
        monthKey,
        authors: Array.from(authorsMap.entries())
          .map(([author, count]) => ({ author, count }))
          .sort((a, b) => b.count - a.count) // 개수 많은 순으로 정렬
      }))
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey)) // 최신 월 먼저

    console.log('=== 통계 API 응답 ===')
    console.log('반환할 stats 개수:', stats.length)
    console.log('stats 데이터:', JSON.stringify(stats, null, 2))

    return NextResponse.json({ stats }, { status: 200 })
  } catch (error) {
    console.error('Get blog posts stats error:', error)
    return NextResponse.json({ error: '통계 조회 실패' }, { status: 500 })
  }
}
