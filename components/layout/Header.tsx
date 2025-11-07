'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface HeaderProps {
  user?: {
    name: string
    email: string
    role: string
  }
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary">work.naraddon.com</h1>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium text-neutral-900">{user.name}</p>
              <p className="text-neutral-500">{user.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
