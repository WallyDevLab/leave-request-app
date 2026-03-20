"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type AuthUser, getCurrentUser, logoutUser, isAdmin } from "@/lib/auth"

export function NavBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getCurrentUser()
    setUser(currentUser)

    // If not logged in and not on login page, redirect to login
    if (!currentUser && pathname !== "/login") {
      router.push("/login")
    }
  }, [pathname, router])

  const handleLogout = async () => {
    await logoutUser()
    setUser(null)
    router.push("/login")
  }

  // Don't show navbar on login page
  if (pathname === "/login") return null

  // Don't show navbar until we've checked auth
  if (pathname !== "/login" && user === null) return null

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            Leave Tracker
          </Link>

          <nav className="hidden md:flex gap-4">
            <Link
              href="/dashboard"
              className={`text-sm ${pathname === "/dashboard" ? "font-medium" : "text-muted-foreground"}`}
            >
              Dashboard
            </Link>

            {isAdmin(user) && (
              <Link
                href="/admin"
                className={`text-sm ${pathname === "/admin" ? "font-medium" : "text-muted-foreground"}`}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="text-xs">
                  Role: <span className="font-medium capitalize">{user.role}</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="text-xs">
                  Leave Balance: <span className="font-medium">{user.remainingLeaveDays}</span> days
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}

