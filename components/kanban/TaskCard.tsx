import { Task } from '@/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HiOutlineClock, HiOutlineLink } from 'react-icons/hi'
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
      <div className="mb-2">
        <div className="flex items-start gap-2 mb-1">
          <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-primary text-white text-xs font-bold">
            {task.number}
          </span>
          {task.createdAt && (
            <span className="text-xs text-neutral-500 mt-0.5">
              {format(new Date(task.createdAt), 'yyyy-MM-dd')}
            </span>
          )}
        </div>
        <h4 className="font-medium text-neutral-900 line-clamp-2">{task.title}</h4>
      </div>

      {/* 설명 */}
      {task.description && (
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* URL */}
      {task.url && (
        <div className="flex items-center gap-1 text-sm text-blue-600 mb-2">
          <HiOutlineLink className="w-4 h-4" />
          <span className="truncate">{task.url}</span>
        </div>
      )}

      {/* 푸터 */}
      <div className="flex items-center justify-between text-sm text-neutral-500">
        {/* 첨부파일 */}
        {task.attachments && task.attachments.length > 0 && (
          <span className="text-xs">📎 {task.attachments.length}개</span>
        )}

        {/* 마감일 */}
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
