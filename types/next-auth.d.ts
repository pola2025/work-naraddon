import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'admin' | 'user'
      isApproved: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'admin' | 'user'
    isApproved: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'admin' | 'user'
    isApproved: boolean
  }
}
