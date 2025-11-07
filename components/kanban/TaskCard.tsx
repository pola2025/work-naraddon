import { Task } from '@/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HiOutlineClock, HiOutlineUser } from 'react-icons/hi'
import { format } from 'date-fns'

interface TaskCardProps {
  task: Task
  onClick: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white border border-neutral-200 rounded-lg p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-neutral-900 flex-1 line-clamp-2">{task.title}</h4>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ml-2 flex-shrink-0 ${
            priorityColors[task.priority]
          }`}
        >
          {priorityLabels[task.priority]}
        </span>
      </div>

      {/* 설명 */}
      {task.description && (
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* 푸터 */}
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <div className="flex items-center gap-1">
          <HiOutlineUser className="w-4 h-4" />
          <span className="truncate max-w-[100px]">{task.assignee}</span>
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-1">
            <HiOutlineClock className="w-4 h-4" />
            <span>{format(new Date(task.dueDate), 'MM/dd')}</span>
          </div>
        )}
      </div>

      {/* 댓글 수 */}
      {task.comments.length > 0 && (
        <div className="mt-2 pt-2 border-t border-neutral-100">
          <span className="text-xs text-neutral-500">댓글 {task.comments.length}개</span>
        </div>
      )}
    </div>
  )
}
