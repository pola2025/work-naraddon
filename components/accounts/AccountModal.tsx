'use client'

import { useState, useEffect } from 'react'
import { OperatingAccount } from '@/types'
import { HiOutlineX } from 'react-icons/hi'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  account: OperatingAccount | null
  onSuccess: () => void
}

export function AccountModal({ isOpen, onClose, account, onSuccess }: AccountModalProps) {
  const [formData, setFormData] = useState({
    platform: '',
    accountName: '',
    username: '',
    password: '',
    note: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (account) {
      setFormData({
        platform: account.platform,
        accountName: account.accountName,
        username: account.username,
        password: account.password,
        note: account.note || '',
      })
    } else {
      setFormData({
        platform: '',
        accountName: '',
        username: '',
        password: '',
        note: '',
      })
    }
  }, [account, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = account ? `/api/accounts/${account._id}` : '/api/accounts'
      const method = account ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const data = await response.json()
        alert(data.error || '저장에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to save account:', error)
      alert('저장 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900">
            {account ? '계정 수정' : '계정 추가'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <HiOutlineX className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              플랫폼 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.platform}
              onChange={e => setFormData({ ...formData, platform: e.target.value })}
              placeholder="예: 네이버, 구글, AWS 등"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              계정명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.accountName}
              onChange={e => setFormData({ ...formData, accountName: e.target.value })}
              placeholder="예: 마케팅용 계정, 운영자 계정 등"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              아이디 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              placeholder="로그인 아이디"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="로그인 비밀번호"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              메모 (선택)
            </label>
            <textarea
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              placeholder="추가 정보나 메모를 입력하세요"
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* 버튼 */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '저장 중...' : account ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
