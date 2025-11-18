'use client'

import React from 'react'
import { TaskHistory } from '@/types'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { formatDistanceToNow } from 'date-fns'

interface HistoryItemProps {
  history: TaskHistory
  isCompact?: boolean // 간략 보기 (목록 펼침용)
  isAdmin?: boolean
  onEdit?: (history: TaskHistory) => void
  onDelete?: (historyId: string) => void
}

const statusConfig = {
  making: { icon: '🔵', label: '제작중', className: 'bg-blue-100 text-blue-700' },
  confirming: { icon: '🟡', label: '컨펌중', className: 'bg-yellow-100 text-yellow-700' },
  in_progress: { icon: '🟠', label: '진행중', className: 'bg-orange-100 text-orange-700' },
  completed: { icon: '🟢', label: '완료', className: 'bg-green-100 text-green-700' },
  on_hold: { icon: '⚪', label: '보류', className: 'bg-gray-100 text-gray-700' },
  cancelled: { icon: '🔴', label: '취소', className: 'bg-red-100 text-red-700' },
}

export function HistoryItem({ history, isCompact = false, isAdmin = false, onEdit, onDelete }: HistoryItemProps) {
  const statusInfo = statusConfig[history.status]

  // 상대 시간 표시 (1시간 전, 어제 등)
  const getRelativeTime = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko })
    } catch {
      return ''
    }
  }

  return (
    <div className={`
      bg-white border border-neutral-200 rounded-lg
      ${isCompact ? 'p-3.5' : 'p-4'}
      transition-all hover:shadow-md
    `}>
      {/* 헤더 */}
      <div className="flex items-center gap-2.5 mb-2">
        <span className="text-lg">{statusInfo.icon}</span>
        <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
        <span className="text-xs text-neutral-500">
          {format(new Date(history.createdAt), 'yyyy-MM-dd HH:mm')} · {history.authorName}
          {!isCompact && <span className="ml-1">· {getRelativeTime(history.createdAt)}</span>}
        </span>
      </div>

      {/* 내용 */}
      <div className="text-sm text-neutral-800 leading-relaxed">
        <strong className="font-semibold">{history.title}</strong>
        {history.content && (
          <div className={`mt-1.5 text-neutral-600 whitespace-pre-wrap ${isCompact ? 'line-clamp-2' : ''}`}>
            {history.content}
          </div>
        )}
      </div>

      {/* 첨부파일 */}
      {!isCompact && history.attachments && history.attachments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {history.attachments.map((file, index) => (
            <a
              key={index}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <span>📎</span>
              <span>{file.filename}</span>
            </a>
          ))}
        </div>
      )}

      {/* 액션 버튼 (관리자 + 비간략 모드) */}
      {!isCompact && isAdmin && (
        <div className="mt-3 pt-3 border-t border-neutral-100 flex gap-2 justify-end">
          <button
            onClick={() => onEdit?.(history)}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition-colors"
          >
            수정
          </button>
          <button
            onClick={() => onDelete?.(history._id)}
            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-200 rounded hover:bg-red-50 transition-colors"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  )
}
