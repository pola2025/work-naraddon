'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AccountsList } from '@/components/accounts/AccountsList'
import { AccountModal } from '@/components/accounts/AccountModal'
import { OperatingAccount } from '@/types'

export default function AccountsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<OperatingAccount | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleEdit = (account: OperatingAccount) => {
    setSelectedAccount(account)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAccount(null)
  }

  // 로딩 중
  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  // 관리자가 아니면 접근 거부
  if (!session || session.user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">접근 권한이 없습니다</h2>
            <p className="text-neutral-600 mb-6">
              운영 계정 관리는 관리자만 접근할 수 있습니다.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              대시보드로 돌아가기
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AccountsList
          key={refreshKey}
          onEdit={handleEdit}
          onCreate={() => setIsModalOpen(true)}
          onUpdate={handleRefresh}
        />
      </div>

      <AccountModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        account={selectedAccount}
        onSuccess={handleRefresh}
      />
    </DashboardLayout>
  )
}
