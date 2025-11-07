import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import dbConnect from '@/lib/mongodb'
import UserModel from '@/lib/models/User'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요' }, { status: 400 })
    }

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '유효한 이메일 주소를 입력해주세요' }, { status: 400 })
    }

    // 비밀번호 길이 검사
    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 합니다' },
        { status: 400 }
      )
    }

    await dbConnect()

    // 중복 이메일 확인
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: '이미 사용 중인 이메일입니다' }, { status: 409 })
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10)

    // 사용자 생성 (승인 대기 상태)
    const user = await UserModel.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'user',
      isApproved: false, // 관리자 승인 필요
    })

    return NextResponse.json(
      {
        message: '회원가입이 완료되었습니다. 관리자 승인 후 이용 가능합니다.',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: '회원가입 중 오류가 발생했습니다' }, { status: 500 })
  }
}
