'use client'

import { useState } from 'react'
import { Task } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { HiOutlineClock, HiOutlineLink, HiOutlineTrash, HiOutlinePaperClip, HiOutlinePencil } from 'react-icons/hi'
import { Input } from '@/components/ui/Input'

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onUpdate: () => void
  isAdmin: boolean
}

export function TaskDetailModal({ isOpen, onClose, task, onUpdate, isAdmin }: TaskDetailModalProps) {
  const [comment, setComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    url: '',
    status: '' as Task['status'],
    dueDate: '',
  })
  const [isUpdating, setIsUpdating] = useState(false)

  if (!task) return null

  // 수정 모드 시작
  const handleStartEdit = () => {
    setEditForm({
      title: task.title,
      description: task.description,
      url: task.url || '',
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    })
    setIsEditing(true)
  }

  // 수정 취소
  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  // 업무 수정 저장
  const handleSaveEdit = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          url: editForm.url,
          status: editForm.status,
          dueDate: editForm.dueDate ? new Date(editForm.dueDate) : undefined,
        }),
      })

      if (response.ok) {
        setIsEditing(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const statusLabels = {
    preparing: '준비중',
    in_progress: '진행중',
    completed: '진행완료',
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? '업무 수정' : '업무 상세'} size="lg">
      <div className="space-y-6">
        {/* 수정 모드 */}
        {isEditing ? (
          <div className="space-y-4">
            <Input
              label="업무 제목"
              id="edit-title"
              value={editForm.title}
              onChange={e => setEditForm({ ...editForm, title: e.target.value })}
              required
            />

            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-neutral-700 mb-2">
                설명
              </label>
              <textarea
                id="edit-description"
                value={editForm.description}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Input
              label="URL"
              id="edit-url"
              value={editForm.url}
              onChange={e => setEditForm({ ...editForm, url: e.target.value })}
              placeholder="관련 URL을 입력하세요"
            />

            <div>
              <label htmlFor="edit-status" className="block text-sm font-medium text-neutral-700 mb-2">
                상태
              </label>
              <select
                id="edit-status"
                value={editForm.status}
                onChange={e => setEditForm({ ...editForm, status: e.target.value as Task['status'] })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="preparing">준비중</option>
                <option value="in_progress">진행중</option>
                <option value="completed">진행완료</option>
              </select>
            </div>

            <Input
              label="마감일"
              id="edit-dueDate"
              type="date"
              value={editForm.dueDate}
              onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="ghost" onClick={handleCancelEdit}>
                취소
              </Button>
              <Button onClick={handleSaveEdit} disabled={isUpdating}>
                {isUpdating ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* 헤더 정보 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-neutral-900">{task.title}</h2>
                {isAdmin && (
                  <Button variant="ghost" onClick={handleStartEdit}>
                    <HiOutlinePencil className="w-5 h-5 mr-2" />
                    수정
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-600">상태:</span>
                  <span className="px-2 py-1 bg-neutral-100 rounded font-medium">
                    {statusLabels[task.status]}
                  </span>
                </div>

                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <HiOutlineClock className="w-4 h-4 text-neutral-600" />
                    <span>마감: {format(new Date(task.dueDate), 'yyyy-MM-dd')}</span>
                  </div>
                )}

                {task.url && (
                  <div className="flex items-center gap-2">
                    <HiOutlineLink className="w-4 h-4 text-neutral-600" />
                    <a
                      href={task.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {task.url}
                    </a>
                  </div>
                )}

                {task.attachments && task.attachments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <HiOutlinePaperClip className="w-4 h-4 text-neutral-600" />
                    <span>첨부파일: {task.attachments.length}개</span>
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
          </>
        )}

        {/* 댓글 - 수정 모드가 아닐 때만 표시 */}
        {!isEditing && (
          <>
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
            <div className={`flex ${isAdmin ? 'justify-between' : 'justify-end'} pt-4 border-t border-neutral-200`}>
              {isAdmin && (
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  <HiOutlineTrash className="w-5 h-5 mr-2" />
                  {isDeleting ? '삭제 중...' : '삭제'}
                </Button>
              )}
              <Button variant="ghost" onClick={onClose}>
                닫기
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
