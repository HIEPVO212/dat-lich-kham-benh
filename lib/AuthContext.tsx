'use client'
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getCurrentUser, logoutUser as logoutUserApi } from './auth'

export type AuthUser = {
  id?: string
  email?: string | null
  full_name?: string | null
  phone?: string | null
  role?: string
  avatar_url?: string | null
  [key: string]: any
}

type AuthContextType = {
  user: AuthUser | null
  loading: boolean
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const current = await getCurrentUser()
      setUser(current)
    } catch (e) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const logout = async () => {
    await logoutUserApi()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}