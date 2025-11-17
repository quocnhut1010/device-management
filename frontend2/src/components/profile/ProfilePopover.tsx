import { useState, useEffect } from 'react'
import { Settings, LogOut, Bell, Shield, Mail, Building, Calendar, Edit } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { getUserProfile } from '@/services/userService'
import { getAllDevices, getMyDevices, getManagedDevices } from '@/services/deviceService'
import { getAllIncidents, getMyIncidents } from '@/services/incidentService'
import { getAllRepairs, getMyRepairs, getDeviceRepairHistory } from '@/services/repairService'
import type { UserDto } from '@/types'
import ProfileModal from './ProfileModal'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export function ProfilePopover() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<UserDto | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    devices: 0,
    incidents: 0,
    repairs: 0,
  })
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        const response = await getUserProfile()
        const data = response.data
        setProfile(data)
      } catch (error) {
        console.error('Error loading profile:', error)
        // Fallback to user from auth context
        if (user) {
          setProfile({
            id: user.nameid || '',
            fullName: user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role: user.role || 'User',
            position: user.position,
            departmentName: undefined,
            isDeleted: false,
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user])

  // Load statistics based on user role and position
  useEffect(() => {
    const loadStatistics = async () => {
      if (!user) return

      try {
        setIsLoadingStats(true)
        const roleLower = user.role?.toLowerCase() || ''
        const positionLower = user.position?.toLowerCase() || ''
        const isAdmin = roleLower === 'admin'
        const isManager = positionLower === 'trưởng phòng'
        const isTechnician = roleLower === 'user' && positionLower === 'kỹ thuật viên'

        // Load devices count
        try {
          let devicesCount = 0
          if (isAdmin) {
            const devices = await getAllDevices(false)
            devicesCount = devices?.length || 0
          } else if (isManager) {
            const devices = await getManagedDevices()
            devicesCount = devices?.length || 0
          } else {
            const devices = await getMyDevices()
            devicesCount = devices?.length || 0
          }
          setStats((prev) => ({ ...prev, devices: devicesCount }))
        } catch (error) {
          console.error('Error loading devices count:', error)
          setStats((prev) => ({ ...prev, devices: 0 }))
        }

        // Load incidents count
        try {
          let incidentsCount = 0
          if (isAdmin) {
            const response = await getAllIncidents()
            incidentsCount = response.data?.length || 0
          } else {
            const response = await getMyIncidents()
            incidentsCount = response.data?.length || 0
          }
          setStats((prev) => ({ ...prev, incidents: incidentsCount }))
        } catch (error) {
          console.error('Error loading incidents count:', error)
          setStats((prev) => ({ ...prev, incidents: 0 }))
        }

        // Load repairs count
        try {
          let repairsCount = 0
          if (isAdmin) {
            const response = await getAllRepairs()
            repairsCount = response.data?.length || 0
          } else if (isTechnician) {
            const response = await getMyRepairs()
            repairsCount = response.data?.length || 0
          } else {
            // Manager/Employee: Count repairs of devices they are using
            try {
              // Get user's devices
              let userDevices: any[] = []
              if (isManager) {
                userDevices = await getManagedDevices()
              } else {
                userDevices = await getMyDevices()
              }

              // Count active repairs for each device
              // Active repairs are those with status: 0 (ChoThucHien), 1 (DangSua), 2 (ChoDuyetHoanTat)
              const activeStatuses = [0, 1, 2]
              let totalActiveRepairs = 0

              // Process devices in parallel but limit concurrency
              const devicePromises = userDevices.map(async (device) => {
                try {
                  const repairHistory = await getDeviceRepairHistory(device.id)
                  const activeRepairs = repairHistory.data?.filter(
                    (repair: any) => activeStatuses.includes(repair.status)
                  ) || []
                  return activeRepairs.length
                } catch (error) {
                  // If error getting repair history for a device, skip it
                  console.error(`Error loading repair history for device ${device.id}:`, error)
                  return 0
                }
              })

              const repairCounts = await Promise.all(devicePromises)
              totalActiveRepairs = repairCounts.reduce((sum: number, count: number) => sum + count, 0)
              repairsCount = totalActiveRepairs
            } catch (error) {
              console.error('Error loading repairs count for employee:', error)
              repairsCount = 0
            }
          }
          setStats((prev) => ({ ...prev, repairs: repairsCount }))
        } catch (error) {
          console.error('Error loading repairs count:', error)
          setStats((prev) => ({ ...prev, repairs: 0 }))
        }
      } catch (error) {
        console.error('Error loading statistics:', error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    loadStatistics()
  }, [user])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'destructive'
      case 'manager':
        return 'default'
      case 'technician':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Quản trị viên'
      case 'manager':
        return 'Trưởng phòng'
      case 'technician':
        return 'Kỹ thuật viên'
      case 'employee':
      case 'user':
        return 'Nhân viên'
      default:
        return role || 'Nhân viên'
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const displayUser = profile || (user ? {
    id: user.nameid || '',
    fullName: user.email?.split('@')[0] || 'User',
    email: user.email || '',
    role: user.role || 'User',
    position: user.position,
    departmentName: undefined,
    isDeleted: false,
  } : null)

  if (!displayUser) return null

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-auto py-2 px-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`/placeholder.svg?height=32&width=32&query=user+avatar`} />
              <AvatarFallback className="text-xs">{getInitials(displayUser.fullName)}</AvatarFallback>
            </Avatar>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium leading-none">{displayUser.fullName}</p>
              <p className="text-xs text-muted-foreground capitalize mt-1">
                {getRoleLabel(displayUser.position)}
              </p>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          {/* Profile Header */}
          <div className="relative p-6 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-background shadow-lg">
                <AvatarImage src={`/placeholder.svg?height=64&width=64&query=user+avatar`} />
                <AvatarFallback className="text-lg">{getInitials(displayUser.fullName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight mb-1">{displayUser.fullName}</h3>
                <Badge variant={getRoleBadgeVariant(displayUser.role)} className="mb-2">
                  <Shield className="h-3 w-3 mr-1" />
                  {getRoleLabel(displayUser.position)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{displayUser.email}</span>
            </div>
            {displayUser.departmentName && (
              <div className="flex items-center gap-3 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{displayUser.departmentName}</span>
              </div>
            )}
            {displayUser.createdAt && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Tham gia từ {format(new Date(displayUser.createdAt), 'dd/MM/yyyy', { locale: vi })}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Quick Stats */}
          <div className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Thống kê nhanh</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-accent/50">
                <p className="text-2xl font-bold">
                  {isLoadingStats ? (
                    <span className="text-muted-foreground">-</span>
                  ) : (
                    stats.devices
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Thiết bị</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/50">
                <p className="text-2xl font-bold">
                  {isLoadingStats ? (
                    <span className="text-muted-foreground">-</span>
                  ) : (
                    stats.incidents
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Sự cố</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/50">
                <p className="text-2xl font-bold">
                  {isLoadingStats ? (
                    <span className="text-muted-foreground">-</span>
                  ) : (
                    stats.repairs
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Sửa chữa</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              size="sm"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa hồ sơ
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Cài đặt
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Tùy chọn thông báo
            </Button>
            <Separator className="my-2" />
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <ProfileModal
        open={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={profile}
        onSuccess={() => {
          setIsProfileModalOpen(false)
          // Reload profile
          if (user) {
            getUserProfile()
              .then((response: { data: UserDto }) => {
                setProfile(response.data)
              })
              .catch(console.error)
          }
        }}
      />
    </>
  )
}

