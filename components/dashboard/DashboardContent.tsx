'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatsWidget } from './StatsWidget'
import { RecentTasksWidget } from './RecentTasksWidget'

export function DashboardContent() {
  const [stats, setStats] = useState({
    preparing: 0,
    in_progress: 0,
    completed: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        const tasks = data.tasks

        setStats({
          preparing: tasks.filter((t: any) => t.status === 'preparing').length,
          in_progress: tasks.filter((t: any) => t.status === 'in_progress').length,
          completed: tasks.filter((t: any) => t.status === 'completed').length,
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">나라똔 업무 진행 현황</h1>
        <p className="text-neutral-600 mt-2">전체 업무 진행 상황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 위젯 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsWidget title="준비중" value={stats.preparing} subtitle="신규 업무" color="yellow" />
        <StatsWidget
          title="진행중"
          value={stats.in_progress}
          subtitle="작업 중"
          color="blue"
        />
        <StatsWidget title="진행완료" value={stats.completed} subtitle="처리 완료" color="green" />
      </div>

      {/* 전체 업무 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 업무</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentTasksWidget />
        </CardContent>
      </Card>
    </div>
  )
}
