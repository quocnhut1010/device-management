import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getAllDevices, getMyDevices, getManagedDevices } from '@/services/deviceService'
import type { DeviceDto } from '@/types'
import { formatDateForTable } from '@/lib/dateUtils'

export function WarrantyCalendarWidget() {
  const { user } = useAuth()
  const [expiringDevices, setExpiringDevices] = useState<{
    within30: DeviceDto[]
    within60: DeviceDto[]
    within90: DeviceDto[]
  }>({
    within30: [],
    within60: [],
    within90: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDevices = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        let devices: DeviceDto[] = []

        const roleLower = user.role?.toLowerCase() || ''
        const positionLower = user.position?.toLowerCase() || ''
        const isAdmin = roleLower === 'admin'
        const isManager = positionLower === 'trưởng phòng'

        if (isAdmin) {
          devices = await getAllDevices(false)
        } else if (isManager) {
          devices = await getManagedDevices()
        } else {
          devices = await getMyDevices()
        }

        const today = new Date()
        const categorized = devices.reduce(
          (acc, device) => {
            if (!device.warrantyExpiry) return acc

            const expiryDate = new Date(device.warrantyExpiry)
            const daysUntilExpiry = Math.floor(
              (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            )

            if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
              acc.within30.push(device)
            } else if (daysUntilExpiry > 30 && daysUntilExpiry <= 60) {
              acc.within60.push(device)
            } else if (daysUntilExpiry > 60 && daysUntilExpiry <= 90) {
              acc.within90.push(device)
            }

            return acc
          },
          { within30: [], within60: [], within90: [] } as typeof expiringDevices
        )

        setExpiringDevices(categorized)
      } catch (error) {
        console.error('Error loading warranty devices:', error)
        setExpiringDevices({ within30: [], within60: [], within90: [] })
      } finally {
        setLoading(false)
      }
    }

    loadDevices()
  }, [user])

  const totalExpiring =
    expiringDevices.within30.length + expiringDevices.within60.length + expiringDevices.within90.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Warranty Calendar
        </CardTitle>
        <CardDescription>Devices with expiring warranties</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground text-center py-4">Loading...</div>
        ) : totalExpiring === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No warranties expiring in the next 90 days
          </p>
        ) : (
          <div className="space-y-4">
            {expiringDevices.within30.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <h4 className="text-sm font-medium">Within 30 Days</h4>
                  <Badge variant="destructive">{expiringDevices.within30.length}</Badge>
                </div>
                <div className="space-y-1 pl-6">
                  {expiringDevices.within30.map((device) => (
                    <div key={device.id} className="text-sm">
                      <span className="font-medium">{device.deviceName}</span>
                      <span className="text-muted-foreground">
                        {' '}
                        - {device.warrantyExpiry && formatDateForTable(device.warrantyExpiry)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expiringDevices.within60.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <h4 className="text-sm font-medium">Within 60 Days</h4>
                  <Badge variant="outline" className="border-orange-500 text-orange-500">
                    {expiringDevices.within60.length}
                  </Badge>
                </div>
                <div className="space-y-1 pl-6">
                  {expiringDevices.within60.map((device) => (
                    <div key={device.id} className="text-sm">
                      <span className="font-medium">{device.deviceName}</span>
                      <span className="text-muted-foreground">
                        {' '}
                        - {device.warrantyExpiry && formatDateForTable(device.warrantyExpiry)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expiringDevices.within90.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <h4 className="text-sm font-medium">Within 90 Days</h4>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                    {expiringDevices.within90.length}
                  </Badge>
                </div>
                <div className="space-y-1 pl-6">
                  {expiringDevices.within90.map((device) => (
                    <div key={device.id} className="text-sm">
                      <span className="font-medium">{device.deviceName}</span>
                      <span className="text-muted-foreground">
                        {' '}
                        - {device.warrantyExpiry && formatDateForTable(device.warrantyExpiry)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
