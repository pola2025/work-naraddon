'use client'

import { useEffect } from 'react'
import { HiX } from 'react-icons/hi'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 백드롭 */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* 모달 */}
      <div
        className={`relative bg-white rounded-lg shadow-xl ${sizes[size]} w-full mx-4 max-h-[90vh] overflow-y-auto`}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-neutral-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}
