'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { CreateTaskModal } from '@/components/kanban/CreateTaskModal'
import { TaskDetailModal } from '@/components/kanban/TaskDetailModal'
import { Task } from '@/types'

export default function TasksPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <DashboardLayout>
      <KanbanBoard
        key={refreshKey}
        onTaskClick={task => setSelectedTask(task)}
        onCreateTask={() => setIsCreateModalOpen(true)}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleRefresh}
      />

      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onUpdate={handleRefresh}
      />
    </DashboardLayout>
  )
}
