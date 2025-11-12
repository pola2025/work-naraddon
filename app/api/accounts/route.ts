import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth-options'
import dbConnect from '@/lib/mongodb'
import OperatingAccountModel from '@/lib/models/OperatingAccount'

// 운영계정 목록 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const platform = searchParams.get('platform')

    // 필터 조건
    const filter: any = {}
    if (platform) filter.platform = platform

    const accounts = await OperatingAccountModel.find(filter)
      .sort({ lastUsedAt: -1, createdAt: -1 })
      .lean()

    return NextResponse.json({ accounts }, { status: 200 })
  } catch (error) {
    console.error('Get accounts error:', error)
    return NextResponse.json({ error: '계정 목록 조회 실패' }, { status: 500 })
  }
}

// 운영계정 추가
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 관리자만 계정 추가 가능
    const isAdmin = session.user.role === 'admin' || session.user.role === 'master'
    if (!isAdmin) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { platform, accountName, username, password, note } = await req.json()

    if (!platform || !accountName || !username || !password) {
      return NextResponse.json(
        { error: '플랫폼, 계정명, 아이디, 비밀번호는 필수입니다' },
        { status: 400 }
      )
    }

    await dbConnect()

    const account = await OperatingAccountModel.create({
      platform,
      accountName,
      username,
      password,
      note: note || '',
      createdBy: session.user.id,
    })

    return NextResponse.json({ account }, { status: 201 })
  } catch (error) {
    console.error('Create account error:', error)
    return NextResponse.json({ error: '계정 추가 실패' }, { status: 500 })
  }
}
