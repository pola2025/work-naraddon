'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Task } from '@/types'
import { Button } from '@/components/ui/Button'
import { HiPlus, HiOutlineClock, HiOutlineLink, HiChevronDown, HiChevronUp } from 'react-icons/hi'
import { Spinner } from '@/components/ui/Spinner'
import { format } from 'date-fns'
import { HistoryList } from '@/components/task-history/HistoryList'

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
  completed: 'bg-neutral-200 text-neutral-700',
}

type SortOption = 'latest' | 'oldest' | 'status-asc' | 'status-desc' | 'number-asc' | 'number-desc' | 'duedate-asc' | 'duedate-desc'

const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'status-asc', label: '상태순 (준비중→완료)' },
  { value: 'status-desc', label: '상태순 (완료→준비중)' },
  { value: 'number-asc', label: '번호순 (오름차순)' },
  { value: 'number-desc', label: '번호순 (내림차순)' },
  { value: 'duedate-asc', label: '마감일순 (빠른순)' },
  { value: 'duedate-desc', label: '마감일순 (늦은순)' },
]

export function KanbanBoard({ onTaskClick, onCreateTask, isAdmin }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set())

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

  // 정렬 로직
  const sortedTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()

        case 'status-asc':
          const statusOrder = { preparing: 0, in_progress: 1, completed: 2 }
          return statusOrder[a.status] - statusOrder[b.status]

        case 'status-desc':
          const statusOrderDesc = { preparing: 2, in_progress: 1, completed: 0 }
          return statusOrderDesc[a.status] - statusOrderDesc[b.status]

        case 'number-asc':
          return a.number - b.number

        case 'number-desc':
          return b.number - a.number

        case 'duedate-asc':
          if (!a.expectedDueDate) return 1
          if (!b.expectedDueDate) return -1
          return new Date(a.expectedDueDate).getTime() - new Date(b.expectedDueDate).getTime()

        case 'duedate-desc':
          if (!a.expectedDueDate) return 1
          if (!b.expectedDueDate) return -1
          return new Date(b.expectedDueDate).getTime() - new Date(a.expectedDueDate).getTime()

        default:
          return 0
      }
    })
    return sorted
  }, [tasks, sortBy])

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

  // 마감일 초과 체크
  const isOverdue = (task: Task) => {
    if (!task.expectedDueDate || task.status === 'completed') return false
    return new Date(task.expectedDueDate) < new Date()
  }

  // 히스토리 펼침/접기 토글
  const toggleHistory = (taskId: string) => {
    setExpandedTaskIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">업무 관리</h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-1">
            {isAdmin ? '업무 목록을 관리하고 상태를 변경하세요' : '업무 목록을 확인하세요'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={onCreateTask} className="w-full sm:w-auto">
            <HiPlus className="w-5 h-5 mr-2" />
            새 업무
          </Button>
        )}
      </div>

      {/* 정렬 드롭다운 */}
      <div className="flex items-center gap-2 sm:gap-3">
        <label htmlFor="sort" className="text-sm sm:text-base font-medium text-neutral-700 whitespace-nowrap">
          정렬:
        </label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 border border-neutral-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 업무 목록 */}
      {sortedTasks.length === 0 ? (
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
          {/* 데스크톱 테이블 헤더 */}
          <div className="hidden md:grid gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 font-medium text-sm text-neutral-700" style={{ gridTemplateColumns: '60px 100px 90px minmax(250px, 2fr) 110px 80px 80px 120px 80px' }}>
            <div className="text-center">번호</div>
            <div>날짜</div>
            <div>카테고리</div>
            <div>제목</div>
            <div>상태</div>
            <div>예상마감</div>
            <div>완료일</div>
            <div>URL</div>
            <div className="text-center">이력</div>
          </div>

          {/* 업무 목록 */}
          <div className="divide-y divide-neutral-200">
            {sortedTasks.map(task => (
              <React.Fragment key={task._id}>
                {/* 데스크톱 뷰 */}
                <div
                  className="hidden md:grid gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                  style={{ gridTemplateColumns: '60px 100px 90px minmax(250px, 2fr) 110px 80px 80px 120px 80px' }}
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

                {/* 카테고리 */}
                <div className="flex items-center">
                  {task.category ? (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                      task.category === '기능개발' ? 'bg-blue-100 text-blue-700' :
                      task.category === '디자인' ? 'bg-purple-100 text-purple-700' :
                      task.category === '마케팅' ? 'bg-green-100 text-green-700' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {task.category}
                    </span>
                  ) : (
                    <span className="text-neutral-400 text-xs">-</span>
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

                {/* 예상마감일 */}
                <div className="flex items-center text-sm">
                  {task.expectedDueDate ? (
                    <span className={isOverdue(task) ? 'text-red-600 font-semibold' : 'text-neutral-600'}>
                      {format(new Date(task.expectedDueDate), 'MM-dd')}
                    </span>
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </div>

                {/* 완료일 */}
                <div className="flex items-center text-sm text-neutral-600">
                  {task.completedAt ? (
                    <span>{format(new Date(task.completedAt), 'MM-dd')}</span>
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

                {/* 히스토리 펼침/접기 */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleHistory(task._id)
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      expandedTaskIds.has(task._id)
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {expandedTaskIds.has(task._id) ? (
                      <span className="flex items-center gap-1">
                        <HiChevronUp className="w-3.5 h-3.5" />
                        접기
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <HiChevronDown className="w-3.5 h-3.5" />
                        펼치기
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* 히스토리 섹션 (펼쳐진 상태) */}
              {expandedTaskIds.has(task._id) && (
                <div className="hidden md:block px-6 py-5 bg-neutral-50 border-t border-neutral-100">
                  <HistoryList
                    taskId={task._id}
                    isCompact={true}
                    isAdmin={isAdmin}
                    onViewAll={() => onTaskClick(task)}
                  />
                </div>
              )}

              {/* 모바일 뷰 */}
              <div
                className="md:hidden p-5 hover:bg-neutral-50 transition-colors cursor-pointer border-b border-neutral-100 last:border-0"
                onClick={() => onTaskClick(task)}
              >
                {/* 번호 + 날짜 */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center justify-center min-w-[32px] h-7 px-2.5 rounded-full bg-primary text-white text-sm font-bold">
                    {task.number}
                  </span>
                  {task.createdAt && (
                    <span className="text-sm text-neutral-500 font-medium">
                      {format(new Date(task.createdAt), 'yyyy-MM-dd')}
                    </span>
                  )}
                </div>

                {/* 제목 */}
                <h3 className="font-semibold text-neutral-900 text-base mb-3 leading-snug">
                  {task.title}
                </h3>

                {/* 카테고리 + 상태 */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {task.category && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                      task.category === '기능개발' ? 'bg-blue-100 text-blue-700' :
                      task.category === '디자인' ? 'bg-purple-100 text-purple-700' :
                      task.category === '마케팅' ? 'bg-green-100 text-green-700' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {task.category}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status]}`}>
                    {statusLabels[task.status]}
                  </span>
                </div>

                {/* 마감일 정보 */}
                {(task.expectedDueDate || task.completedAt) && (
                  <div className="flex items-center gap-3 mb-3 flex-wrap text-sm">
                    {task.expectedDueDate && (
                      <div className={`flex items-center gap-1.5 ${isOverdue(task) ? 'text-red-600 font-bold' : 'text-neutral-700'}`}>
                        <HiOutlineClock className="w-4 h-4" />
                        <span>예상 {format(new Date(task.expectedDueDate), 'MM-dd')}</span>
                      </div>
                    )}
                    {task.completedAt && (
                      <div className="flex items-center gap-1.5 text-neutral-700">
                        <span className="text-base">✓</span>
                        <span>완료 {format(new Date(task.completedAt), 'MM-dd')}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 하단 정보 (URL + 댓글 + 펼침 버튼) */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    {task.url && (
                      <a
                        href={task.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline truncate"
                      >
                        <HiOutlineLink className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">링크</span>
                      </a>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleHistory(task._id)
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                      expandedTaskIds.has(task._id)
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {expandedTaskIds.has(task._id) ? '▲ 접기' : '▼ 펼치기'}
                  </button>
                </div>
              </div>

              {/* 모바일 히스토리 섹션 (펼쳐진 상태) */}
              {expandedTaskIds.has(task._id) && (
                <div className="md:hidden px-5 py-4 bg-neutral-50 border-t border-neutral-100">
                  <HistoryList
                    taskId={task._id}
                    isCompact={true}
                    isAdmin={isAdmin}
                    onViewAll={() => onTaskClick(task)}
                  />
                </div>
              )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
