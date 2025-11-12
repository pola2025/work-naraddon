import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'

// GET: 모든 사용자 조회 (마스터 관리자만)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    // 마스터 관리자만 접근 가능
    if (!session || session.user.role !== 'master') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db()

    const users = await db
      .collection('users')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    })
  } catch (error) {
    console.error('사용자 조회 실패:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH: 사용자 역할/승인 변경 (마스터 관리자만)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession()

    // 마스터 관리자만 접근 가능
    if (!session || session.user.role !== 'master') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { userId, role, isApproved } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (role !== undefined) {
      // 마스터 관리자 이메일 검증
      const user = await db.collection('users').findOne({ _id: userId })
      if (role === 'master' && user?.email !== 'mkt@polarad.co.kr') {
        return NextResponse.json(
          { error: '마스터 관리자는 mkt@polarad.co.kr만 가능합니다' },
          { status: 403 }
        )
      }
      updateData.role = role
    }

    if (isApproved !== undefined) {
      updateData.isApproved = isApproved
    }

    const result = await db.collection('users').updateOne({ _id: userId }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: '사용자 정보가 업데이트되었습니다',
    })
  } catch (error) {
    console.error('사용자 업데이트 실패:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: 사용자 삭제 (마스터 관리자만)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()

    // 마스터 관리자만 접근 가능
    if (!session || session.user.role !== 'master') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // 마스터 관리자는 삭제 불가
    const user = await db.collection('users').findOne({ _id: userId })
    if (user?.role === 'master') {
      return NextResponse.json({ error: '마스터 관리자는 삭제할 수 없습니다' }, { status: 403 })
    }

    const result = await db.collection('users').deleteOne({ _id: userId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: '사용자가 삭제되었습니다',
    })
  } catch (error) {
    console.error('사용자 삭제 실패:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
