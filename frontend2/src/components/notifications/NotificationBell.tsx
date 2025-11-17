import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import NotificationDropdown from './NotificationDropdown'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
  className?: string
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const { unreadCount, isLoading, refreshNotifications } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    setIsOpen(!isOpen)
    // Refresh notifications when bell is clicked to ensure latest data
    if (!isOpen) {
      refreshNotifications()
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const getBadgeContent = () => {
    if (isLoading) return undefined
    if (unreadCount === 0) return undefined
    if (unreadCount > 99) return '99+'
    return unreadCount
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'relative transition-all hover:bg-accent',
          unreadCount > 0 && 'animate-pulse',
          className
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="Thông báo"
      >
        <Bell
          className={cn(
            'h-5 w-5 transition-all',
            (unreadCount > 0 || isHovered) && 'scale-110'
          )}
        />
        {getBadgeContent() !== undefined && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {getBadgeContent()}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      <NotificationDropdown open={isOpen} onClose={handleClose} />
    </div>
  )
}

export default NotificationBell

