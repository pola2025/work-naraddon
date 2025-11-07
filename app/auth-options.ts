import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import UserModel from '@/lib/models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('🔐 Login attempt:', credentials?.email)

          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing credentials')
            throw new Error('이메일과 비밀번호를 입력해주세요')
          }

          console.log('⏳ Connecting to DB...')
          await dbConnect()
          console.log('✅ DB connected')

          console.log('⏳ Finding user...')
          const user = await UserModel.findOne({
            email: credentials.email.toLowerCase(),
          })

          console.log('User found:', user ? `${user.email} (${user.role})` : 'null')

          if (!user) {
            console.log('❌ User not found')
            throw new Error('존재하지 않는 계정입니다')
          }

          console.log('⏳ Comparing password...')
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          console.log('Password valid:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('❌ Invalid password')
            throw new Error('비밀번호가 일치하지 않습니다')
          }

          if (!user.isApproved) {
            console.log('❌ User not approved')
            throw new Error('관리자 승인 대기 중입니다')
          }

          console.log('✅ Login successful:', user.email)

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            isApproved: user.isApproved,
          }
        } catch (error) {
          console.error('💥 Authorization error:', error)
          throw error
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isApproved = user.isApproved
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'admin' | 'user'
        session.user.isApproved = token.isApproved as boolean
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
