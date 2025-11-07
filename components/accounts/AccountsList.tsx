'use client'

import { useState, useEffect } from 'react'
import { OperatingAccount } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineClipboardCopy,
  HiOutlineKey,
} from 'react-icons/hi'
import { format } from 'date-fns'

interface AccountsListProps {
  onEdit: (account: OperatingAccount) => void
  onCreate: () => void
  onUpdate: () => void
}

export function AccountsList({ onEdit, onCreate, onUpdate }: AccountsListProps) {
  const [accounts, setAccounts] = useState<OperatingAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts)
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldId)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 계정을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchAccounts()
        onUpdate()
      } else {
        alert('계정 삭제에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
      alert('계정 삭제 중 오류가 발생했습니다')
    }
  }

  const handleUpdateLastUsed = async (id: string) => {
    try {
      await fetch(`/api/accounts/${id}`, {
        method: 'PATCH',
      })
      fetchAccounts()
    } catch (error) {
      console.error('Failed to update lastUsedAt:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HiOutlineKey className="w-6 h-6 text-primary" />
            <CardTitle>운영 계정 관리</CardTitle>
          </div>
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span>계정 추가</span>
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineKey className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">등록된 운영 계정이 없습니다</p>
            <button
              onClick={onCreate}
              className="mt-4 text-primary hover:underline"
            >
              첫 계정 추가하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 데스크톱: 테이블 형식 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                      플랫폼
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                      계정명
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                      아이디
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                      비밀번호
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                      메모
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                      최근 사용
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-neutral-700">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(account => (
                    <tr
                      key={account._id}
                      className="border-b border-neutral-100 hover:bg-neutral-50"
                    >
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-primary-50 text-primary text-sm rounded">
                          {account.platform}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-900">{account.accountName}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-neutral-700 bg-neutral-100 px-2 py-1 rounded">
                            {account.username}
                          </code>
                          <button
                            onClick={() => {
                              handleCopy(account.username, `username-${account._id}`)
                              handleUpdateLastUsed(account._id)
                            }}
                            className="p-1 hover:bg-neutral-200 rounded transition-colors"
                            title="아이디 복사"
                          >
                            <HiOutlineClipboardCopy
                              className={`w-4 h-4 ${
                                copiedField === `username-${account._id}`
                                  ? 'text-green-600'
                                  : 'text-neutral-500'
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-neutral-700 bg-neutral-100 px-2 py-1 rounded">
                            {'•'.repeat(8)}
                          </code>
                          <button
                            onClick={() => {
                              handleCopy(account.password, `password-${account._id}`)
                              handleUpdateLastUsed(account._id)
                            }}
                            className="p-1 hover:bg-neutral-200 rounded transition-colors"
                            title="비밀번호 복사"
                          >
                            <HiOutlineClipboardCopy
                              className={`w-4 h-4 ${
                                copiedField === `password-${account._id}`
                                  ? 'text-green-600'
                                  : 'text-neutral-500'
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-600 max-w-xs truncate">
                        {account.note || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-500">
                        {account.lastUsedAt
                          ? format(new Date(account.lastUsedAt), 'MM/dd HH:mm')
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEdit(account)}
                            className="p-2 hover:bg-neutral-200 rounded transition-colors"
                            title="수정"
                          >
                            <HiOutlinePencil className="w-4 h-4 text-neutral-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(account._id)}
                            className="p-2 hover:bg-red-100 rounded transition-colors"
                            title="삭제"
                          >
                            <HiOutlineTrash className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일: 카드 형식 */}
            <div className="md:hidden space-y-4">
              {accounts.map(account => (
                <div
                  key={account._id}
                  className="border border-neutral-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-1 bg-primary-50 text-primary text-xs rounded">
                        {account.platform}
                      </span>
                      <h3 className="font-medium text-neutral-900 mt-2">
                        {account.accountName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(account)}
                        className="p-2 hover:bg-neutral-100 rounded"
                      >
                        <HiOutlinePencil className="w-4 h-4 text-neutral-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(account._id)}
                        className="p-2 hover:bg-red-100 rounded"
                      >
                        <HiOutlineTrash className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">아이디</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-neutral-700 bg-neutral-100 px-2 py-1 rounded flex-1">
                          {account.username}
                        </code>
                        <button
                          onClick={() => {
                            handleCopy(account.username, `username-${account._id}`)
                            handleUpdateLastUsed(account._id)
                          }}
                          className="p-2 hover:bg-neutral-200 rounded"
                        >
                          <HiOutlineClipboardCopy
                            className={`w-4 h-4 ${
                              copiedField === `username-${account._id}`
                                ? 'text-green-600'
                                : 'text-neutral-500'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-neutral-500 mb-1">비밀번호</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-neutral-700 bg-neutral-100 px-2 py-1 rounded flex-1">
                          {'•'.repeat(8)}
                        </code>
                        <button
                          onClick={() => {
                            handleCopy(account.password, `password-${account._id}`)
                            handleUpdateLastUsed(account._id)
                          }}
                          className="p-2 hover:bg-neutral-200 rounded"
                        >
                          <HiOutlineClipboardCopy
                            className={`w-4 h-4 ${
                              copiedField === `password-${account._id}`
                                ? 'text-green-600'
                                : 'text-neutral-500'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {account.note && (
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">메모</p>
                        <p className="text-sm text-neutral-700">{account.note}</p>
                      </div>
                    )}

                    {account.lastUsedAt && (
                      <p className="text-xs text-neutral-500 mt-2">
                        최근 사용: {format(new Date(account.lastUsedAt), 'MM/dd HH:mm')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
