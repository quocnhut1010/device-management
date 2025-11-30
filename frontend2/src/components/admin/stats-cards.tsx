import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertCircle, Wrench, TrendingUp } from 'lucide-react'
import { getAdminStats } from '@/services/dashboardService'

export function StatsCards() {
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeIncidents: 0,
    activeRepairs: 0,
    availableDevices: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await getAdminStats()
        setStats({
          totalDevices: data.totalDevices,
          activeIncidents: data.openIncidents,
          activeRepairs: data.activeRepairs,
          availableDevices: data.devicesAvailable,
        })
      } catch (error) {
        console.error('Error loading admin stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const cards = [
    {
      title: 'Tổng số thiết bị',
      value: stats.totalDevices,
      icon: Package,
      color: 'text-blue-500',
    },
    {
      title: 'Sự cố đang mở',
      value: stats.activeIncidents,
      icon: AlertCircle,
      color: 'text-orange-500',
    },
    {
      title: 'Lệnh sửa đang hoạt động',
      value: stats.activeRepairs,
      icon: Wrench,
      color: 'text-purple-500',
    },
    {
      title: 'Thiết bị sẵn sàng',
      value: stats.availableDevices,
      icon: TrendingUp,
      color: 'text-green-500',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : card.value}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
