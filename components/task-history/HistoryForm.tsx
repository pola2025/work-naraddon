'use client'

import React, { useState, useEffect } from 'react'
import { TaskHistory } from '@/types'

interface HistoryFormProps {
  taskId: string
  editingHistory?: TaskHistory | null // 수정 모드일 때
  onSuccess?: (history: TaskHistory) => void
  onCancel?: () => void
}

const statusOptions = [
  { value: 'making', label: '🔵 제작중', color: 'text-blue-700' },
  { value: 'confirming', label: '🟡 컨펌중', color: 'text-yellow-700' },
  { value: 'in_progress', label: '🟠 진행중', color: 'text-orange-700' },
  { value: 'completed', label: '🟢 완료', color: 'text-green-700' },
  { value: 'on_hold', label: '⚪ 보류', color: 'text-gray-700' },
  { value: 'cancelled', label: '🔴 취소', color: 'text-red-700' },
]

export function HistoryForm({ taskId, editingHistory, onSuccess, onCancel }: HistoryFormProps) {
  const [status, setStatus] = useState<string>('in_progress')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 수정 모드일 때 초기값 설정
  useEffect(() => {
    if (editingHistory) {
      setStatus(editingHistory.status)
      setTitle(editingHistory.title)
      setContent(editingHistory.content || '')
    }
  }, [editingHistory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 유효성 검사
    if (!title.trim()) {
      setError('제목을 입력해주세요')
      return
    }

    setIsSubmitting(true)

    try {
      if (editingHistory) {
        // 수정 모드
        const response = await fetch(`/api/tasks/${taskId}/history/${editingHistory._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status,
            title: title.trim(),
            content: content.trim(),
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || '수정에 실패했습니다')
        }

        const data = await response.json()
        onSuccess?.(data.history)
      } else {
        // 생성 모드
        const response = await fetch(`/api/tasks/${taskId}/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status,
            title: title.trim(),
            content: content.trim(),
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || '추가에 실패했습니다')
        }

        const data = await response.json()
        onSuccess?.(data.history)
      }

      // 폼 초기화
      if (!editingHistory) {
        setStatus('in_progress')
        setTitle('')
        setContent('')
      }
    } catch (error: any) {
      setError(error.message || '오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-lg p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-neutral-900">
          {editingHistory ? '작업 이력 수정' : '새 작업 이력 추가'}
        </h3>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 상태 선택 */}
      <div className="mb-4">
        <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-2">
          상태 <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 제목 입력 */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: UI 컴포넌트 1차 구현 완료"
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
          maxLength={200}
        />
        <p className="mt-1 text-xs text-neutral-500">
          {title.length}/200자
        </p>
      </div>

      {/* 내용 입력 */}
      <div className="mb-5">
        <label htmlFor="content" className="block text-sm font-medium text-neutral-700 mb-2">
          내용
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="작업 내용을 자세히 입력하세요..."
          rows={5}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          disabled={isSubmitting}
          maxLength={2000}
        />
        <p className="mt-1 text-xs text-neutral-500">
          {content.length}/2000자
        </p>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '저장 중...' : editingHistory ? '수정' : '추가'}
        </button>
      </div>
    </form>
  )
}
