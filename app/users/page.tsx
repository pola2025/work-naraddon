'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { User } from '@/types'

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'master' | 'admin' | 'user') => {
    if (!confirm(`역할을 "${getRoleLabel(newRole)}"로 변경하시겠습니까?`)) return

    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })

      const data = await response.json()

      if (data.success) {
        alert('역할이 변경되었습니다')
        fetchUsers()
      } else {
        alert(data.error || '역할 변경 실패')
      }
    } catch (error) {
      console.error('역할 변경 실패:', error)
      alert('역할 변경 중 오류가 발생했습니다')
    }
  }

  const handleApprovalToggle = async (userId: string, currentApproval: boolean) => {
    if (!confirm(`승인 상태를 ${currentApproval ? '거부' : '승인'}로 변경하시겠습니까?`)) return

    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isApproved: !currentApproval }),
      })

      const data = await response.json()

      if (data.success) {
        alert('승인 상태가 변경되었습니다')
        fetchUsers()
      } else {
        alert(data.error || '승인 상태 변경 실패')
      }
    } catch (error) {
      console.error('승인 상태 변경 실패:', error)
      alert('승인 상태 변경 중 오류가 발생했습니다')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) return

    try {
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (data.success) {
        alert('사용자가 삭제되었습니다')
        fetchUsers()
      } else {
        alert(data.error || '사용자 삭제 실패')
      }
    } catch (error) {
      console.error('사용자 삭제 실패:', error)
      alert('사용자 삭제 중 오류가 발생했습니다')
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'master':
        return '마스터 관리자'
      case 'admin':
        return '관리자'
      case 'user':
        return '일반 사용자'
      default:
        return role
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'master':
        return 'bg-purple-100 text-purple-800'
      case 'admin':
        return 'bg-blue-100 text-blue-800'
      case 'user':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  // 마스터 관리자가 아니면 접근 불가
  if (session?.user?.role !== 'master') {
    return (
      <DashboardLayout>
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">접근 권한이 없습니다</p>
              <p className="text-neutral-600">마스터 관리자만 사용자 관리에 접근할 수 있습니다</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              사용자 관리
              <span className="text-sm font-normal text-neutral-500 ml-2">
                (총 {users.length}명)
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                      이메일
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                      이름
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                      역할
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                      승인 상태
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                      가입일
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-neutral-500">
                        등록된 사용자가 없습니다
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr
                        key={user._id}
                        className="border-b border-neutral-100 hover:bg-neutral-50"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-neutral-900">{user.email}</div>
                          {user.email === 'mkt@polarad.co.kr' && (
                            <span className="text-xs text-purple-600">마스터 계정</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-neutral-700">{user.name}</td>
                        <td className="py-3 px-4">
                          <select
                            value={user.role}
                            onChange={e =>
                              handleRoleChange(
                                user._id,
                                e.target.value as 'master' | 'admin' | 'user'
                              )
                            }
                            disabled={user.role === 'master'}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                              user.role
                            )} ${user.role === 'master' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <option value="user">일반 사용자</option>
                            <option value="admin">관리자</option>
                            {user.email === 'mkt@polarad.co.kr' && (
                              <option value="master">마스터 관리자</option>
                            )}
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleApprovalToggle(user._id, user.isApproved)}
                            disabled={user.role === 'master'}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              user.isApproved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            } ${
                              user.role === 'master'
                                ? 'cursor-not-allowed'
                                : 'hover:opacity-80 cursor-pointer'
                            }`}
                          >
                            {user.isApproved ? '승인됨' : '대기중'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-sm text-neutral-600">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          {user.role !== 'master' && (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              삭제
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 안내 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📌 사용자 관리 안내</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>마스터 관리자</strong>: mkt@polarad.co.kr 계정만 가능 (삭제 및 역할 변경 불가)</li>
              <li>• <strong>관리자</strong>: 모든 기능 접근 가능 (사용자 관리 제외)</li>
              <li>• <strong>일반 사용자</strong>: 제한된 기능만 접근 가능</li>
              <li>• 승인 상태를 "대기중"으로 설정하면 해당 사용자는 로그인할 수 없습니다</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
