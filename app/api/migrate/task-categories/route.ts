import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth-options'
import dbConnect from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'

// 업무 카테고리 마이그레이션 API (관리자 전용)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // 관리자 권한 확인
    const isAdmin = session?.user.role === 'admin' || session?.user.role === 'master'
    if (!session || !isAdmin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    await dbConnect()

    // category 필드가 없는 업무들 조회
    const tasksWithoutCategory = await TaskModel.find({
      $or: [
        { category: { $exists: false } },
        { category: null }
      ]
    }).sort({ createdAt: 1 })

    if (tasksWithoutCategory.length === 0) {
      return NextResponse.json({
        message: '마이그레이션이 필요한 업무가 없습니다.',
        migrated: 0
      }, { status: 200 })
    }

    const migratedTasks = []

    // 각 업무에 기본 카테고리 '기능개발' 부여
    for (const task of tasksWithoutCategory) {
      await TaskModel.updateOne(
        { _id: task._id },
        { $set: { category: '기능개발' } }
      )
      migratedTasks.push({
        number: task.number,
        title: task.title,
        category: '기능개발'
      })
    }

    return NextResponse.json({
      message: '카테고리 마이그레이션 완료',
      migrated: migratedTasks.length,
      tasks: migratedTasks
    }, { status: 200 })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: '마이그레이션 실패' }, { status: 500 })
  }
}
