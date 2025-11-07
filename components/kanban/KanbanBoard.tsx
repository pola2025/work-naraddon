'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { Button } from '@/components/ui/Button'
import { HiPlus } from 'react-icons/hi'
import { Spinner } from '@/components/ui/Spinner'

interface KanbanBoardProps {
  onTaskClick: (task: Task) => void
  onCreateTask: () => void
}

const columns = [
  { id: 'requested', title: '요청' },
  { id: 'in_progress', title: '진행중' },
  { id: 'review', title: '검토' },
  { id: 'completed', title: '완료' },
]

export function KanbanBoard({ onTaskClick, onCreateTask }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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

  // 드래그 시작
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t._id === event.active.id)
    setActiveTask(task || null)
  }

  // 드래그 종료 (상태 변경)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveTask(null)
      return
    }

    const taskId = active.id as string
    const newStatus = over.id as string

    // 상태가 변경되지 않았으면 무시
    const task = tasks.find(t => t._id === taskId)
    if (!task || task.status === newStatus) {
      setActiveTask(null)
      return
    }

    // 낙관적 업데이트 (UI 즉시 반영)
    setTasks(prev =>
      prev.map(t => (t._id === taskId ? { ...t, status: newStatus as Task['status'] } : t))
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

    setActiveTask(null)
  }

  // 상태별로 업무 그룹화
  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.id] = tasks.filter(task => task.status === column.id)
    return acc
  }, {} as Record<string, Task[]>)

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
          <p className="text-neutral-600 mt-1">드래그하여 상태를 변경하세요</p>
        </div>
        <Button onClick={onCreateTask}>
          <HiPlus className="w-5 h-5 mr-2" />
          새 업무
        </Button>
      </div>

      {/* 칸반 보드 */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={tasksByStatus[column.id] || []}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>

        {/* 드래그 오버레이 */}
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
