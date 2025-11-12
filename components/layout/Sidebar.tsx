'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineKey,
  HiOutlineDocumentText,
  HiOutlineLightBulb,
  HiOutlineUsers,
} from 'react-icons/hi'

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: HiOutlineHome, adminOnly: false, masterOnly: false },
  { name: '업무 관리', href: '/tasks', icon: HiOutlineClipboardList, adminOnly: false, masterOnly: false },
  { name: '운영 계정', href: '/accounts', icon: HiOutlineKey, adminOnly: true, masterOnly: false },
  { name: '블로그 포스팅', href: '/blog-posts', icon: HiOutlineDocumentText, adminOnly: false, masterOnly: false },
  { name: '콘텐츠 제작 Tip', href: '/content-tips', icon: HiOutlineLightBulb, adminOnly: false, masterOnly: false },
  { name: '사용자 관리', href: '/users', icon: HiOutlineUsers, adminOnly: false, masterOnly: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // 사용자 권한에 따라 메뉴 필터링
  const filteredNavigation = navigation.filter(item => {
    // 마스터 관리자 전용 메뉴
    if (item.masterOnly) {
      return session?.user?.role === 'master'
    }
    // 관리자 전용 메뉴
    if (item.adminOnly) {
      return session?.user?.role === 'admin' || session?.user?.role === 'master'
    }
    return true
  })

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {filteredNavigation.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-colors
                ${
                  isActive
                    ? 'bg-primary-50 text-primary font-medium'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
