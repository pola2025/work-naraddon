'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface CreateBlogPostModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateBlogPostModal({ isOpen, onClose, onSuccess }: CreateBlogPostModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    keyword: '',
    ranking: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || '블로그 포스팅 등록 실패')
        return
      }

      const data = await response.json()
      console.log('=== 생성된 포스트 응답 ===')
      console.log('응답 데이터:', data)
      console.log('monthKey:', data.post?.monthKey)
      console.log('serialNumber:', data.post?.serialNumber)

      // 성공
      setFormData({
        title: '',
        url: '',
        keyword: '',
        ranking: '',
      })
      onSuccess()
      onClose()
    } catch (error) {
      setError('블로그 포스팅 등록 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="블로그 포스팅 등록" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="포스팅 제목"
          id="title"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="블로그 포스팅 제목을 입력하세요"
          required
        />

        <Input
          label="포스팅 URL"
          id="url"
          type="text"
          value={formData.url}
          onChange={e => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://..."
          helperText="블로그 포스팅의 전체 URL을 입력하세요"
          required
        />

        <Input
          label="검색키워드"
          id="keyword"
          value={formData.keyword}
          onChange={e => setFormData({ ...formData, keyword: e.target.value })}
          placeholder="검색키워드 입력"
          helperText="모바일 검색 키워드를 작성해주세요."
          required
        />

        <Input
          label="검색순위"
          id="ranking"
          type="number"
          value={formData.ranking}
          onChange={e => setFormData({ ...formData, ranking: e.target.value })}
          placeholder="검색순위 입력"
          helperText="모바일 검색키워드의 검색 순위를 작성해주세요."
          required
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
            {isLoading ? '등록 중...' : '등록'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
