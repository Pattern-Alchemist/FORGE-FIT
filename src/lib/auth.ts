/**
 * Forge — NextAuth configuration
 *
 * Credentials provider with bcrypt-hashed passwords.
 * Two roles: coach (sees all clients) and client (sees only their own data).
 *
 * Session strategy: jwt (stateless, works without a session db).
 */
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

// Type augmentation so NextAuth's Session.user includes our custom fields
declare module 'next-auth' {
  interface User {
    role?: 'coach' | 'client'
    coachId?: string | null
    clientId?: string | null
    profileId?: string | null
  }
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: 'coach' | 'client'
      coachId?: string | null
      clientId?: string | null
      profileId?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'coach' | 'client'
    coachId?: string | null
    clientId?: string | null
    profileId?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: {
            coach: { select: { id: true, name: true, avatar: true, businessName: true } },
            client: { select: { id: true, fullName: true, avatar: true, coachId: true } },
          },
        })
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          role: user.role as 'coach' | 'client',
          coachId: user.coachId,
          clientId: user.clientId,
          profileId: user.role === 'coach' ? user.coachId : user.clientId,
          name: user.role === 'coach' ? user.coach?.name : user.client?.fullName,
          image: user.role === 'coach' ? user.coach?.avatar : user.client?.avatar,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: { signIn: '/' },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.coachId = user.coachId
        token.clientId = user.clientId
        token.profileId = user.profileId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role ?? 'coach'
        session.user.coachId = token.coachId ?? null
        session.user.clientId = token.clientId ?? null
        session.user.profileId = token.profileId ?? null
      }
      return session
    },
  },
}
