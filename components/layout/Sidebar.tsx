'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineKey,
  HiOutlineDocumentText,
} from 'react-icons/hi'

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: HiOutlineHome },
  { name: '업무 관리', href: '/tasks', icon: HiOutlineClipboardList },
  { name: '운영 계정', href: '/accounts', icon: HiOutlineKey },
  { name: '블로그 포스팅', href: '/blog-posts', icon: HiOutlineDocumentText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navigation.map(item => {
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
