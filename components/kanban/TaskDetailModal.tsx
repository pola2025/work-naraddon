'use client'

import { useState } from 'react'
import { Task } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { HiOutlineClock, HiOutlineUser, HiOutlineTrash } from 'react-icons/hi'

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onUpdate: () => void
}

export function TaskDetailModal({ isOpen, onClose, task, onUpdate }: TaskDetailModalProps) {
  const [comment, setComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!task) return null

  const priorityLabels = {
    low: '낮음',
    medium: '보통',
    high: '높음',
    urgent: '긴급',
  }

  const statusLabels = {
    requested: '요청',
    in_progress: '진행중',
    review: '검토',
    completed: '완료',
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return

    setIsAddingComment(true)
    try {
      const response = await fetch(`/api/tasks/${task._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment }),
      })

      if (response.ok) {
        setComment('')
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setIsAddingComment(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 이 업무를 삭제하시겠습니까?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onUpdate()
        onClose()
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="업무 상세" size="lg">
      <div className="space-y-6">
        {/* 헤더 정보 */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">{task.title}</h2>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-neutral-600">상태:</span>
              <span className="px-2 py-1 bg-neutral-100 rounded font-medium">
                {statusLabels[task.status]}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-600">우선순위:</span>
              <span className="px-2 py-1 bg-neutral-100 rounded font-medium">
                {priorityLabels[task.priority]}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <HiOutlineUser className="w-4 h-4 text-neutral-600" />
              <span>담당자: {task.assignee}</span>
            </div>

            {task.dueDate && (
              <div className="flex items-center gap-2">
                <HiOutlineClock className="w-4 h-4 text-neutral-600" />
                <span>마감: {format(new Date(task.dueDate), 'yyyy-MM-dd')}</span>
              </div>
            )}
          </div>
        </div>

        {/* 설명 */}
        {task.description && (
          <div>
            <h3 className="font-semibold text-neutral-900 mb-2">설명</h3>
            <p className="text-neutral-700 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {/* 댓글 */}
        <div>
          <h3 className="font-semibold text-neutral-900 mb-4">댓글 ({task.comments.length})</h3>

          {/* 댓글 목록 */}
          <div className="space-y-3 mb-4">
            {task.comments.map((comment, index) => (
              <div key={index} className="bg-neutral-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm text-neutral-900">{comment.author}</span>
                  <span className="text-xs text-neutral-500">
                    {format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm')}
                  </span>
                </div>
                <p className="text-neutral-700 text-sm">{comment.content}</p>
              </div>
            ))}

            {task.comments.length === 0 && (
              <p className="text-neutral-500 text-sm text-center py-4">댓글이 없습니다</p>
            )}
          </div>

          {/* 댓글 작성 */}
          <div className="space-y-2">
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex justify-end">
              <Button onClick={handleAddComment} disabled={isAddingComment || !comment.trim()}>
                {isAddingComment ? '추가 중...' : '댓글 추가'}
              </Button>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-between pt-4 border-t border-neutral-200">
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            <HiOutlineTrash className="w-5 h-5 mr-2" />
            {isDeleting ? '삭제 중...' : '삭제'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  )
}
