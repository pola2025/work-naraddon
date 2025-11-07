'use client'

import { useState } from 'react'
import { BlogPost } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { format } from 'date-fns'
import { HiOutlineExternalLink, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi'

interface BlogPostDetailModalProps {
  isOpen: boolean
  onClose: () => void
  post: BlogPost | null
  onUpdate: () => void
}

export function BlogPostDetailModal({ isOpen, onClose, post, onUpdate }: BlogPostDetailModalProps) {
  const [ranking, setRanking] = useState('')
  const [isAddingRanking, setIsAddingRanking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', url: '', keyword: '' })

  if (!post) return null

  const handleAddRanking = async () => {
    const rankNum = parseInt(ranking)
    if (!ranking.trim() || isNaN(rankNum) || rankNum < 1) {
      alert('올바른 순위를 입력해주세요 (1 이상의 숫자)')
      return
    }

    setIsAddingRanking(true)
    try {
      const response = await fetch(`/api/blog-posts/${post._id}/rankings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rank: rankNum }),
      })

      if (response.ok) {
        setRanking('')
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to add ranking:', error)
    } finally {
      setIsAddingRanking(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 이 블로그 포스팅 기록을 삭제하시겠습니까?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/blog-posts/${post._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onUpdate()
        onClose()
      }
    } catch (error) {
      console.error('Failed to delete blog post:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = async () => {
    if (!editForm.title || !editForm.url || !editForm.keyword) {
      alert('모든 필드를 입력해주세요')
      return
    }

    try {
      const response = await fetch(`/api/blog-posts/${post._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        setIsEditing(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to edit blog post:', error)
    }
  }

  const handleDeleteRanking = async (rankingIndex: number) => {
    if (!confirm('이 순위 기록을 삭제하시겠습니까?')) return

    try {
      // 순위 기록 배열에서 해당 인덱스 제거
      const updatedRankings = post.rankings.filter((_, index) => {
        const sortedIndex = sortedRankings.indexOf(post.rankings[index])
        return sortedIndex !== rankingIndex
      })

      const response = await fetch(`/api/blog-posts/${post._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rankings: updatedRankings }),
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to delete ranking:', error)
    }
  }

  const startEdit = () => {
    setEditForm({
      title: post.title,
      url: post.url,
      keyword: post.keyword,
    })
    setIsEditing(true)
  }

  const sortedRankings = [...post.rankings].sort(
    (a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="블로그 포스팅 상세" size="lg">
      <div className="space-y-6">
        {/* 헤더 정보 */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold text-neutral-900 flex-1">{post.title}</h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={startEdit}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <HiOutlinePencil className="mr-1" />
                수정
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <HiOutlineTrash className="mr-1" />
                {isDeleting ? '삭제 중...' : '삭제'}
              </Button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4 p-4 bg-neutral-50 rounded-lg">
              <Input
                label="포스팅 제목"
                id="edit-title"
                value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                required
              />
              <Input
                label="포스팅 URL"
                id="edit-url"
                value={editForm.url}
                onChange={e => setEditForm({ ...editForm, url: e.target.value })}
                required
              />
              <Input
                label="검색 키워드"
                id="edit-keyword"
                value={editForm.keyword}
                onChange={e => setEditForm({ ...editForm, keyword: e.target.value })}
                required
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  취소
                </Button>
                <Button onClick={handleEdit}>
                  저장
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-neutral-600">작성자{post.monthKey && post.serialNumber !== undefined ? ' & 번호' : ''}:</span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded font-bold">
                  {post.author}
                  {post.monthKey && post.serialNumber !== undefined &&
                    ` (${post.monthKey}-${String(post.serialNumber).padStart(3, '0')})`
                  }
                </span>
                {post.monthKey && post.serialNumber !== undefined && (
                  <span className="text-xs text-neutral-500">
                    (작성자의 {post.monthKey} 월 {post.serialNumber}번째 포스팅)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-neutral-600">URL:</span>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {post.url}
                  <HiOutlineExternalLink />
                </a>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-neutral-600">검색 키워드:</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded font-medium">
                  {post.keyword}
                </span>
                <span className="text-xs text-neutral-500">
                  (이 키워드로 모바일 검색순위를 체크하세요)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-neutral-600">등록일:</span>
                <span>{format(new Date(post.createdAt), 'yyyy-MM-dd HH:mm')}</span>
              </div>
            </div>
          )}
        </div>

        {/* 순위 기록 추가 */}
        <div className="border-t border-neutral-200 pt-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">순위 기록 추가</h3>

          <div className="space-y-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  label="검색 순위"
                  id="ranking"
                  type="number"
                  value={ranking}
                  onChange={e => setRanking(e.target.value)}
                  placeholder="순위 입력 (예: 1, 2, 3...)"
                  min="1"
                  helperText="목표 키워드 검색 시 순위를 여기 작성해주세요"
                />
              </div>
              <Button
                onClick={handleAddRanking}
                disabled={isAddingRanking || !ranking}
                className="whitespace-nowrap mb-0.5"
              >
                {isAddingRanking ? '기록 중...' : '순위 기록'}
              </Button>
            </div>
          </div>
        </div>

        {/* 순위 기록 히스토리 */}
        <div className="border-t border-neutral-200 pt-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            순위 기록 ({post.rankings.length})
          </h3>

          {sortedRankings.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">아직 순위 기록이 없습니다</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sortedRankings.map((r, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">{r.rank}위</span>
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                        {post.keyword}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-600">
                      <div>{format(new Date(r.checkedAt), 'yyyy-MM-dd HH:mm')}</div>
                      <div className="text-xs text-neutral-500">기록자: {r.checkedBy}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                        최신
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteRanking(index)}
                      className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                      title="삭제"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
