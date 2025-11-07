'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types'
import Link from 'next/link'

export function RecentTasksWidget() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        // 완료되지 않은 최근 업무 10개
        const recentTasks = data.tasks
          .filter((task: Task) => task.status !== 'completed')
          .sort((a: Task, b: Task) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
        setTasks(recentTasks)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  const statusColors = {
    preparing: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  }

  const statusLabels = {
    preparing: '준비중',
    in_progress: '진행중',
    completed: '진행완료',
  }

  return (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <p className="text-neutral-500 text-sm text-center py-4">업무가 없습니다</p>
      ) : (
        <>
          {tasks.map(task => (
            <Link key={task._id} href="/tasks">
              <div className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-900 mb-2">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-neutral-600 mb-2 line-clamp-1">{task.description}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                    {statusLabels[task.status]}
                  </span>
                </div>
              </div>
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href="/tasks"
              className="text-sm text-primary hover:underline flex items-center justify-center"
            >
              전체 업무 보기 →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
