import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertCircle, Wrench, CheckCircle } from 'lucide-react'
import { getManagerStats } from '@/services/dashboardService'
import { getUserProfile } from '@/services/userService'

export function ManagerStatsCards() {
  const [stats, setStats] = useState({
    departmentDevices: 0,
    activeIncidents: 0,
    ongoingRepairs: 0,
    availableDevices: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const profileResponse = await getUserProfile()
        const departmentId = profileResponse.data.departmentId
        if (!departmentId) {
          console.error('No department ID found for manager')
          return
        }
        const data = await getManagerStats(departmentId)
        setStats({
          departmentDevices: data.departmentDevices,
          activeIncidents: data.openIncidents,
          ongoingRepairs: data.ongoingRepairs,
          availableDevices: data.availableDevices,
        })
      } catch (error) {
        console.error('Error loading manager stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const cards = [
    {
      title: 'Department Devices',
      value: stats.departmentDevices,
      icon: Package,
      color: 'text-blue-500',
    },
    {
      title: 'Active Incidents',
      value: stats.activeIncidents,
      icon: AlertCircle,
      color: 'text-orange-500',
    },
    {
      title: 'Ongoing Repairs',
      value: stats.ongoingRepairs,
      icon: Wrench,
      color: 'text-purple-500',
    },
    {
      title: 'Available',
      value: stats.availableDevices,
      icon: CheckCircle,
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
              <div className="text-2xl font-bold">{loading ? '...' : card.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
