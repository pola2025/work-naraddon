'use client'

import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatsWidget } from './StatsWidget'
import { RecentTasksWidget } from './RecentTasksWidget'
import { ActivityFeed } from './ActivityFeed'

export function DashboardContent() {
  const { data: session } = useSession()

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">
          안녕하세요, {session?.user.name}님
        </h1>
        <p className="text-neutral-600 mt-2">오늘의 업무 현황을 확인하세요</p>
      </div>

      {/* 통계 위젯 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsWidget
          title="나에게 요청된 업무"
          value={5}
          subtitle="진행중"
          color="blue"
        />
        <StatsWidget
          title="내가 요청한 업무"
          value={3}
          subtitle="대기중"
          color="purple"
        />
        <StatsWidget
          title="오늘까지 마감"
          value={2}
          subtitle="긴급"
          color="red"
        />
        <StatsWidget
          title="완료된 업무"
          value={12}
          subtitle="이번 주"
          color="green"
        />
      </div>

      {/* 콘텐츠 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 업무 */}
        <Card>
          <CardHeader>
            <CardTitle>나에게 요청된 업무</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTasksWidget />
          </CardContent>
        </Card>

        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
