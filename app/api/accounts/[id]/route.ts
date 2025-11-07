import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth-options'
import dbConnect from '@/lib/mongodb'
import OperatingAccountModel from '@/lib/models/OperatingAccount'

// 계정 수정
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 관리자만 수정 가능
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { platform, accountName, username, password, note } = await req.json()

    await dbConnect()

    const account = await OperatingAccountModel.findByIdAndUpdate(
      params.id,
      {
        platform,
        accountName,
        username,
        password,
        note: note || '',
      },
      { new: true }
    )

    if (!account) {
      return NextResponse.json({ error: '계정을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ account }, { status: 200 })
  } catch (error) {
    console.error('Update account error:', error)
    return NextResponse.json({ error: '계정 수정 실패' }, { status: 500 })
  }
}

// 계정 삭제
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 관리자만 삭제 가능
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    await dbConnect()

    const account = await OperatingAccountModel.findByIdAndDelete(params.id)

    if (!account) {
      return NextResponse.json({ error: '계정을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ message: '계정이 삭제되었습니다' }, { status: 200 })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: '계정 삭제 실패' }, { status: 500 })
  }
}

// 최근 사용 시간 업데이트
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    await dbConnect()

    const account = await OperatingAccountModel.findByIdAndUpdate(
      params.id,
      { lastUsedAt: new Date() },
      { new: true }
    )

    if (!account) {
      return NextResponse.json({ error: '계정을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ account }, { status: 200 })
  } catch (error) {
    console.error('Update lastUsedAt error:', error)
    return NextResponse.json({ error: '사용 시간 업데이트 실패' }, { status: 500 })
  }
}
