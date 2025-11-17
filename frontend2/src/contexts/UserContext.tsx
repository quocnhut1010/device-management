import React, { createContext, useContext, useState, ReactNode } from "react"
import type { User, UserRole } from "@/types"

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  setUserRole: (role: UserRole) => void
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const setUserRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role })
    }
  }

  const isAuthenticated = !!user

  return (
    <UserContext.Provider value={{ user, setUser, setUserRole, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within UserProvider")
  }
  return context
}
