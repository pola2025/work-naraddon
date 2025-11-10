'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types'
import { Button } from '@/components/ui/Button'
import { HiPlus, HiOutlineClock, HiOutlineLink } from 'react-icons/hi'
import { Spinner } from '@/components/ui/Spinner'
import { format } from 'date-fns'

interface KanbanBoardProps {
  onTaskClick: (task: Task) => void
  onCreateTask: () => void
  isAdmin: boolean
}

const statusLabels = {
  preparing: '준비중',
  in_progress: '진행중',
  completed: '진행완료',
}

const statusColors = {
  preparing: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
}

export function KanbanBoard({ onTaskClick, onCreateTask, isAdmin }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 업무 목록 불러오기
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // 상태 변경
  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    // 낙관적 업데이트
    setTasks(prev =>
      prev.map(t => (t._id === taskId ? { ...t, status: newStatus } : t))
    )

    // API 호출
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        // 실패 시 롤백
        fetchTasks()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
      fetchTasks()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">업무 관리</h2>
          <p className="text-neutral-600 mt-1">
            {isAdmin ? '업무 목록을 관리하고 상태를 변경하세요' : '업무 목록을 확인하세요'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={onCreateTask}>
            <HiPlus className="w-5 h-5 mr-2" />
            새 업무
          </Button>
        )}
      </div>

      {/* 업무 목록 */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-lg">
          <p className="text-neutral-600 mb-4">등록된 업무가 없습니다</p>
          {isAdmin && (
            <Button onClick={onCreateTask}>
              <HiPlus className="w-5 h-5 mr-2" />
              첫 업무 만들기
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          {/* 테이블 헤더 */}
          <div className="grid gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 font-medium text-sm text-neutral-700" style={{ gridTemplateColumns: '60px 110px 1fr 140px 90px 200px 70px' }}>
            <div className="text-center">번호</div>
            <div>날짜</div>
            <div>제목</div>
            <div>상태</div>
            <div>마감일</div>
            <div>URL</div>
            <div className="text-center">댓글</div>
          </div>

          {/* 업무 목록 */}
          <div className="divide-y divide-neutral-200">
            {tasks.map(task => (
              <div
                key={task._id}
                className="grid gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                style={{ gridTemplateColumns: '60px 110px 1fr 140px 90px 200px 70px' }}
                onClick={() => onTaskClick(task)}
              >
                {/* 번호 */}
                <div className="flex items-center justify-center">
                  <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full bg-primary text-white text-xs font-bold">
                    {task.number}
                  </span>
                </div>

                {/* 날짜 */}
                <div className="flex items-center text-sm text-neutral-600">
                  {task.createdAt ? (
                    <span>{format(new Date(task.createdAt), 'yyyy-MM-dd')}</span>
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </div>

                {/* 제목 */}
                <div className="flex items-center">
                  <h3 className="font-medium text-neutral-900 line-clamp-1">{task.title}</h3>
                </div>

                {/* 상태 */}
                <div className="flex items-center">
                  {isAdmin ? (
                    <select
                      value={task.status}
                      onChange={e => {
                        e.stopPropagation()
                        handleStatusChange(task._id, e.target.value as Task['status'])
                      }}
                      onClick={e => e.stopPropagation()}
                      className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${statusColors[task.status]}`}
                    >
                      <option value="preparing">준비중</option>
                      <option value="in_progress">진행중</option>
                      <option value="completed">진행완료</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status]}`}>
                      {statusLabels[task.status]}
                    </span>
                  )}
                </div>

                {/* 마감일 */}
                <div className="flex items-center text-sm text-neutral-600">
                  {task.dueDate ? (
                    <span>{format(new Date(task.dueDate), 'MM-dd')}</span>
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </div>

                {/* URL */}
                <div className="flex items-center text-sm">
                  {task.url ? (
                    <a
                      href={task.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1 text-blue-600 hover:underline truncate"
                    >
                      <HiOutlineLink className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{task.url}</span>
                    </a>
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </div>

                {/* 댓글 수 */}
                <div className="flex items-center justify-center">
                  <span className="text-sm text-neutral-600">
                    {task.comments.length > 0 ? task.comments.length : '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
