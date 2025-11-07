'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

interface MonthlyStats {
  monthKey: string
  authors: {
    author: string
    count: number
  }[]
}

export function BlogPostsStats() {
  const [stats, setStats] = useState<MonthlyStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      console.log('=== BlogPostsStats fetchStats 호출 ===')
      const response = await fetch('/api/blog-posts/stats')
      if (response.ok) {
        const data = await response.json()
        console.log('받은 stats 데이터:', data.stats)
        console.log('stats 개수:', data.stats.length)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      </Card>
    )
  }

  if (stats.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-neutral-500">통계 데이터가 없습니다</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-neutral-900 mb-4">월별 작성 통계</h2>
      <div className="space-y-6">
        {stats.map(monthData => (
          <div key={monthData.monthKey} className="border-b border-neutral-200 pb-4 last:border-b-0">
            <h3 className="text-lg font-semibold text-neutral-800 mb-3">
              {monthData.monthKey.replace('-', '년 ')}월
            </h3>
            <div className="space-y-2">
              {monthData.authors.map(authorData => (
                <div
                  key={authorData.author}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-neutral-900">
                      {authorData.author}
                    </span>
                    <span className="text-sm text-neutral-600">
                      {monthData.monthKey}-001 ~ {monthData.monthKey}-{String(authorData.count).padStart(3, '0')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {authorData.count}
                    </span>
                    <span className="text-sm text-neutral-600">개</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
