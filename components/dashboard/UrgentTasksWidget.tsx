'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types'
import { HiOutlineClock, HiOutlineExclamation } from 'react-icons/hi'
import { format, isToday, isTomorrow, isPast } from 'date-fns'

export function UrgentTasksWidget() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    fetchUrgentTasks()
  }, [])

  const fetchUrgentTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        // 긴급 또는 마감 임박 업무 필터링
        const urgentTasks = data.tasks
          .filter((task: Task) => {
            const isUrgent = task.priority === 'urgent' || task.priority === 'high'
            const isDueSoon = task.dueDate && (isToday(new Date(task.dueDate)) || isTomorrow(new Date(task.dueDate)) || isPast(new Date(task.dueDate)))
            const isNotCompleted = task.status !== 'completed'
            return (isUrgent || isDueSoon) && isNotCompleted
          })
          .sort((a: Task, b: Task) => {
            // 우선순위 정렬: urgent > high > 마감일 순
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
            return priorityOrder[b.priority] - priorityOrder[a.priority]
          })
          .slice(0, 5)

        setTasks(urgentTasks)
      }
    } catch (error) {
      console.error('Failed to fetch urgent tasks:', error)
    }
  }

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  }

  const priorityLabels = {
    low: '낮음',
    medium: '보통',
    high: '높음',
    urgent: '긴급',
  }

  return (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <HiOutlineExclamation className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
          <p className="text-neutral-500 text-sm">긴급 업무가 없습니다</p>
        </div>
      ) : (
        tasks.map(task => (
          <div
            key={task._id}
            className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-neutral-900 flex-1">{task.title}</h4>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ml-2 flex-shrink-0 ${
                  priorityColors[task.priority]
                }`}
              >
                {priorityLabels[task.priority]}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm text-neutral-600">
              <span>담당자: {task.assignee}</span>
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <HiOutlineClock className="w-4 h-4" />
                  <span className={isPast(new Date(task.dueDate)) && task.status !== 'completed' ? 'text-red-600 font-medium' : ''}>
                    {format(new Date(task.dueDate), 'MM/dd')}
                    {isPast(new Date(task.dueDate)) && task.status !== 'completed' && ' (지연)'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
