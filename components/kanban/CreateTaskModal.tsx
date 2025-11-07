'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    dueDate: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || '업무 생성 실패')
        return
      }

      // 성공
      setFormData({
        title: '',
        description: '',
        assignee: '',
        priority: 'medium',
        dueDate: '',
      })
      onSuccess()
      onClose()
    } catch (error) {
      setError('업무 생성 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="새 업무 생성" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="업무 제목"
          id="title"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="업무 제목을 입력하세요"
          required
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
            설명
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="업무에 대한 상세 설명을 입력하세요"
            rows={4}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <Input
          label="담당자"
          id="assignee"
          value={formData.assignee}
          onChange={e => setFormData({ ...formData, assignee: e.target.value })}
          placeholder="담당자 ID를 입력하세요"
          helperText="나중에 사용자 선택 기능으로 개선 예정"
          required
        />

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-neutral-700 mb-2">
            우선순위
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={e => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="low">낮음</option>
            <option value="medium">보통</option>
            <option value="high">높음</option>
            <option value="urgent">긴급</option>
          </select>
        </div>

        <Input
          label="마감일"
          id="dueDate"
          type="text"
          value={formData.dueDate}
          onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
          placeholder="YYYY-MM-DD"
          helperText="예: 2025-12-31"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '생성 중...' : '생성'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
