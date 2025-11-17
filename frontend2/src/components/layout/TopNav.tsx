import React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/ThemeContext"
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover"
import { ProfilePopover } from "@/components/profile/ProfilePopover"

export function TopNav() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 max-w-7xl">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Device Management System</h2>
        </div>

        <div className="flex items-center gap-2">
          <NotificationsPopover />
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <ProfilePopover />
        </div>
      </div>
    </header>
  )
}
