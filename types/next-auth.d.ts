import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'master' | 'admin' | 'user'
      isApproved: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'master' | 'admin' | 'user'
    isApproved: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'master' | 'admin' | 'user'
    isApproved: boolean
  }
}
