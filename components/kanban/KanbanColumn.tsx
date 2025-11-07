import { Task } from '@/types'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

const statusColors = {
  requested: 'bg-blue-50 border-blue-200',
  in_progress: 'bg-purple-50 border-purple-200',
  review: 'bg-yellow-50 border-yellow-200',
  completed: 'bg-green-50 border-green-200',
}

export function KanbanColumn({ id, title, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div className="flex-1 min-w-[280px]">
      <div
        className={`border-2 rounded-lg p-4 h-full ${
          statusColors[id as keyof typeof statusColors]
        }`}
      >
        {/* 컬럼 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900">{title}</h3>
          <span className="bg-white px-2 py-1 rounded text-sm font-medium text-neutral-600">
            {tasks.length}
          </span>
        </div>

        {/* 카드 목록 */}
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="space-y-3 min-h-[200px]">
            {tasks.map(task => (
              <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
            ))}
            {tasks.length === 0 && (
              <p className="text-sm text-neutral-400 text-center py-8">업무가 없습니다</p>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
