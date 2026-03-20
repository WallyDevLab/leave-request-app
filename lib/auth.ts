"use client"

import type { User } from "./types"

// In a real application, this would be stored in a database
const users = [
  {
    id: "1",
    email: "admin@company.com",
    name: "Admin User",
    password: "password", // In a real app, this would be hashed
    role: "admin",
    totalLeaveDays: 30,
    usedLeaveDays: 5,
    remainingLeaveDays: 25,
  },
  {
    id: "2",
    email: "intern@company.com",
    name: "John Intern",
    password: "password", // In a real app, this would be hashed
    role: "intern",
    totalLeaveDays: 20,
    usedLeaveDays: 3,
    remainingLeaveDays: 17,
  },
  {
    id: "3",
    email: "intern2@company.com",
    name: "Jane Intern",
    password: "password", // In a real app, this would be hashed
    role: "intern",
    totalLeaveDays: 20,
    usedLeaveDays: 8,
    remainingLeaveDays: 12,
  },
]

// Mock localStorage for client-side storage
// In a real app, you would use a proper auth solution like NextAuth.js
const AUTH_KEY = "leave_tracker_auth"

export interface AuthUser extends User {
  id: string
  role: "admin" | "intern"
  password?: string
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null

  const authData = localStorage.getItem(AUTH_KEY)
  if (!authData) return null

  try {
    const user = JSON.parse(authData) as AuthUser
    return user
  } catch (error) {
    console.error("Failed to parse auth data", error)
    return null
  }
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const user = users.find((u) => u.email === email && u.password === password)

  if (!user) {
    throw new Error("Invalid credentials")
  }

  // Remove password before storing
  const { password: _, ...userWithoutPassword } = user

  // Store in localStorage
  localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword))

  return userWithoutPassword as AuthUser
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem(AUTH_KEY)
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === "admin"
}

