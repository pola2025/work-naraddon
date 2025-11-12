import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import UserModel from '@/lib/models/User'

// 일회성 API: mkt@polarad.co.kr을 master로 설정
export async function GET() {
  try {
    await dbConnect()

    const email = 'mkt@polarad.co.kr'
    const user = await UserModel.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: '사용자를 찾을 수 없습니다. 먼저 회원가입을 진행해주세요.',
      })
    }

    const before = {
      email: user.email,
      name: user.name,
      role: user.role,
      isApproved: user.isApproved,
    }

    if (user.role === 'master' && user.isApproved) {
      return NextResponse.json({
        success: true,
        message: '이미 master 역할이며 승인된 상태입니다',
        before,
        after: before,
      })
    }

    await UserModel.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          role: 'master',
          isApproved: true,
          updatedAt: new Date(),
        },
      }
    )

    const updatedUser = await UserModel.findOne({ email: email.toLowerCase() })

    return NextResponse.json({
      success: true,
      message: 'master 역할 및 승인 완료',
      before,
      after: {
        email: updatedUser?.email,
        name: updatedUser?.name,
        role: updatedUser?.role,
        isApproved: updatedUser?.isApproved,
      },
    })
  } catch (error) {
    console.error('Setup master error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
