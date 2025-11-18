'use client'

import { useState } from 'react'
import { Task, TaskHistory } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { HiOutlineClock, HiOutlineLink, HiOutlineTrash, HiOutlinePaperClip, HiOutlinePencil } from 'react-icons/hi'
import { Input } from '@/components/ui/Input'
import { HistoryList } from '@/components/task-history/HistoryList'
import { HistoryForm } from '@/components/task-history/HistoryForm'

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onUpdate: () => void
  isAdmin: boolean
}

type TabType = 'info' | 'history'

export function TaskDetailModal({ isOpen, onClose, task, onUpdate, isAdmin }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('history')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '기능개발' as Task['category'],
    url: '',
    status: '' as Task['status'],
    dueDate: '',
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [showHistoryForm, setShowHistoryForm] = useState(false)
  const [editingHistory, setEditingHistory] = useState<TaskHistory | null>(null)
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0)

  if (!task) return null

  // 수정 모드 시작
  const handleStartEdit = () => {
    setEditForm({
      title: task.title,
      description: task.description,
      category: task.category || '기능개발', // 카테고리가 없으면 기본값 사용
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
          category: editForm.category,
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

  // 히스토리 추가/수정 성공 핸들러
  const handleHistorySuccess = () => {
    setShowHistoryForm(false)
    setEditingHistory(null)
    setHistoryRefreshTrigger(prev => prev + 1)
  }

  // 히스토리 수정 시작
  const handleEditHistory = (history: TaskHistory) => {
    setEditingHistory(history)
    setShowHistoryForm(true)
  }

  // 히스토리 삭제 핸들러
  const handleDeleteHistory = () => {
    setHistoryRefreshTrigger(prev => prev + 1)
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
              <label htmlFor="edit-category" className="block text-sm font-medium text-neutral-700 mb-2">
                카테고리 <span className="text-red-600">*</span>
              </label>
              <select
                id="edit-category"
                name="category"
                value={editForm.category}
                defaultValue="기능개발"
                onChange={e => setEditForm({ ...editForm, category: e.target.value as Task['category'] })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                required
              >
                <option value="기능개발">기능개발</option>
                <option value="디자인">디자인</option>
                <option value="마케팅">마케팅</option>
                <option value="기타">기타</option>
              </select>
            </div>

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
              <div className="flex items-start gap-3 mb-2">
                <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-3 rounded-full bg-primary text-white text-sm font-bold">
                  {task.number}
                </span>
                <span className="text-sm text-neutral-500 mt-1">
                  작성일: {format(new Date(task.createdAt), 'yyyy-MM-dd HH:mm')}
                </span>
              </div>
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
                  <span className="text-neutral-600">카테고리:</span>
                  <span className={`px-2 py-1 rounded font-medium ${
                    task.category === '기능개발' ? 'bg-blue-100 text-blue-700' :
                    task.category === '디자인' ? 'bg-purple-100 text-purple-700' :
                    task.category === '마케팅' ? 'bg-green-100 text-green-700' :
                    'bg-neutral-100 text-neutral-700'
                  }`}>
                    {task.category}
                  </span>
                </div>

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

        {/* 탭 + 콘텐츠 - 수정 모드가 아닐 때만 표시 */}
        {!isEditing && (
          <>
            {/* 탭 네비게이션 */}
            <div className="flex gap-1 border-b border-neutral-200 -mx-6 px-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === 'info'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-neutral-600 border-transparent hover:text-neutral-900'
                }`}
              >
                업무정보
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === 'history'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-neutral-600 border-transparent hover:text-neutral-900'
                }`}
              >
                작업이력
              </button>
            </div>

            {/* 탭 콘텐츠 */}
            <div className="min-h-[300px]">
              {/* 업무정보 탭 */}
              {activeTab === 'info' && (
                <div>
                  {/* 설명 */}
                  {task.description && (
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">설명</h3>
                      <p className="text-neutral-700 whitespace-pre-wrap">{task.description}</p>
                    </div>
                  )}

                  {!task.description && (
                    <p className="text-neutral-500 text-sm text-center py-12">업무 설명이 없습니다</p>
                  )}
                </div>
              )}

              {/* 작업이력 탭 */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {/* 히스토리 추가 버튼 */}
                  {isAdmin && !showHistoryForm && (
                    <div className="flex justify-end">
                      <Button onClick={() => setShowHistoryForm(true)} size="sm">
                        + 새 이력 추가
                      </Button>
                    </div>
                  )}

                  {/* 히스토리 폼 */}
                  {showHistoryForm && isAdmin && (
                    <HistoryForm
                      taskId={task._id}
                      editingHistory={editingHistory}
                      onSuccess={handleHistorySuccess}
                      onCancel={() => {
                        setShowHistoryForm(false)
                        setEditingHistory(null)
                      }}
                    />
                  )}

                  {/* 히스토리 목록 */}
                  <HistoryList
                    taskId={task._id}
                    isCompact={false}
                    isAdmin={isAdmin}
                    onEdit={handleEditHistory}
                    onDelete={handleDeleteHistory}
                    refreshTrigger={historyRefreshTrigger}
                  />
                </div>
              )}

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
