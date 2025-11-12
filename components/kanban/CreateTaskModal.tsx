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
    category: '기능개발' as '기능개발' | '디자인' | '마케팅' | '기타',
    url: '',
    dueDate: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 날짜 자동 포맷팅 함수 (20251112 -> 2025-11-12)
  const formatDate = (input: string): string => {
    // 숫자만 추출
    const numbers = input.replace(/[^\d]/g, '')

    // 8자리 숫자인 경우 (YYYYMMDD)
    if (numbers.length === 8) {
      const year = numbers.substring(0, 4)
      const month = numbers.substring(4, 6)
      const day = numbers.substring(6, 8)
      return `${year}-${month}-${day}`
    }

    // 이미 포맷팅된 경우 또는 불완전한 입력은 그대로 반환
    return input
  }

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
        category: '기능개발',
        url: '',
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
          <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
            카테고리 <span className="text-red-600">*</span>
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value as any })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="기능개발">기능개발</option>
            <option value="디자인">디자인</option>
            <option value="마케팅">마케팅</option>
            <option value="기타">기타</option>
          </select>
        </div>

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
          label="URL"
          id="url"
          value={formData.url}
          onChange={e => setFormData({ ...formData, url: e.target.value })}
          placeholder="관련 URL을 입력하세요 (선택사항)"
          helperText="예: 프로젝트 링크, 문서 링크 등"
        />

        <Input
          label="마감일"
          id="dueDate"
          type="text"
          value={formData.dueDate}
          onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
          onBlur={e => {
            // 포커스를 벗어날 때 자동 포맷팅
            const formatted = formatDate(e.target.value)
            setFormData({ ...formData, dueDate: formatted })
          }}
          placeholder="YYYYMMDD 또는 YYYY-MM-DD"
          helperText="예: 20251231 또는 2025-12-31 (자동 변환됨)"
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
