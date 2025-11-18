'use client'

import React, { useState, useEffect } from 'react'
import { TaskHistory } from '@/types'
import { HistoryItem } from './HistoryItem'
import { Spinner } from '@/components/ui/Spinner'

interface HistoryListProps {
  taskId: string
  isCompact?: boolean // 간략 보기 (최근 3개만)
  isAdmin?: boolean
  onViewAll?: () => void // 전체보기 버튼 클릭
  onEdit?: (history: TaskHistory) => void
  onDelete?: (historyId: string) => void
  refreshTrigger?: number // 외부에서 목록 새로고침 트리거
}

export function HistoryList({
  taskId,
  isCompact = false,
  isAdmin = false,
  onViewAll,
  onEdit,
  onDelete,
  refreshTrigger = 0,
}: HistoryListProps) {
  const [histories, setHistories] = useState<TaskHistory[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // 히스토리 목록 불러오기
  const fetchHistories = async () => {
    try {
      setIsLoading(true)
      const limit = isCompact ? 3 : 0 // 간략 모드: 3개, 전체 모드: 전체
      const response = await fetch(`/api/tasks/${taskId}/history?limit=${limit}`)

      if (response.ok) {
        const data = await response.json()
        setHistories(data.histories)
        setTotal(data.total)
      } else {
        console.error('Failed to fetch histories')
      }
    } catch (error) {
      console.error('Error fetching histories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistories()
  }, [taskId, isCompact, refreshTrigger])

  // 삭제 핸들러
  const handleDelete = async (historyId: string) => {
    if (!confirm('이 작업 이력을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}/history/${historyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // 목록에서 제거
        setHistories((prev) => prev.filter((h) => h._id !== historyId))
        setTotal((prev) => prev - 1)
        onDelete?.(historyId)
      } else {
        const error = await response.json()
        alert(error.error || '삭제에 실패했습니다')
      }
    } catch (error) {
      console.error('Delete history error:', error)
      alert('삭제 중 오류가 발생했습니다')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" />
      </div>
    )
  }

  if (histories.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 text-sm">
        작업 이력이 없습니다
      </div>
    )
  }

  return (
    <div>
      {/* 헤더 (간략 모드) */}
      {isCompact && (
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-neutral-700">
            📋 최근 작업 이력 ({Math.min(3, total)}개)
          </div>
          {total > 3 && onViewAll && (
            <button
              onClick={onViewAll}
              className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition-colors"
            >
              전체보기 →
            </button>
          )}
        </div>
      )}

      {/* 히스토리 목록 */}
      <div className="flex flex-col gap-3">
        {histories.map((history) => (
          <HistoryItem
            key={history._id}
            history={history}
            isCompact={isCompact}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* 더보기 정보 (간략 모드) */}
      {isCompact && total > 3 && (
        <div className="mt-3 text-center text-xs text-neutral-500">
          외 {total - 3}개의 작업 이력
        </div>
      )}
    </div>
  )
}
