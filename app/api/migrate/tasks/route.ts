import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth-options'
import dbConnect from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'

// 업무 넘버링 마이그레이션 API (관리자 전용)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // 관리자 권한 확인
    const isAdmin = session?.user.role === 'admin' || session?.user.role === 'master'
    if (!session || !isAdmin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    await dbConnect()

    // number 필드가 없는 업무들 조회 (createdAt 순서로)
    const tasksWithoutNumber = await TaskModel.find({
      $or: [
        { number: { $exists: false } },
        { number: null }
      ]
    }).sort({ createdAt: 1 })

    if (tasksWithoutNumber.length === 0) {
      return NextResponse.json({
        message: '마이그레이션이 필요한 업무가 없습니다.',
        migrated: 0
      }, { status: 200 })
    }

    // 현재 최대 number 값 찾기
    const maxNumberTask = await TaskModel.findOne({ number: { $exists: true } })
      .sort({ number: -1 })
      .lean()

    let nextNumber = maxNumberTask?.number ? maxNumberTask.number + 1 : 1

    const migratedTasks = []

    // 각 업무에 순차적으로 번호 부여
    for (const task of tasksWithoutNumber) {
      await TaskModel.updateOne(
        { _id: task._id },
        { $set: { number: nextNumber } }
      )
      migratedTasks.push({
        number: nextNumber,
        title: task.title,
        createdAt: task.createdAt
      })
      nextNumber++
    }

    // 전체 결과 확인
    const allTasks = await TaskModel.find({}).sort({ number: 1 }).lean()

    return NextResponse.json({
      message: '마이그레이션 완료',
      migrated: migratedTasks.length,
      tasks: migratedTasks,
      total: allTasks.length,
      numberRange: {
        min: allTasks[0]?.number,
        max: allTasks[allTasks.length - 1]?.number
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: '마이그레이션 실패' }, { status: 500 })
  }
}
