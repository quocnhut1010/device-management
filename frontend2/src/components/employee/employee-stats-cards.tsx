import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { getEmployeeStats } from '@/services/dashboardService'

export function EmployeeStatsCards() {
  const [stats, setStats] = useState({
    myDevices: 0,
    activeIssues: 0,
    pendingReview: 0,
    resolved: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await getEmployeeStats()
        setStats({
          myDevices: data.myDevices,
          activeIssues: data.activeIssues,
          pendingReview: data.myIncidentsPending,
          resolved: data.resolvedIncidents,
        })
      } catch (error) {
        console.error('Error loading employee stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const cards = [
    {
      title: 'My Devices',
      value: stats.myDevices,
      icon: Package,
      color: 'text-blue-500',
    },
    {
      title: 'Active Issues',
      value: stats.activeIssues,
      icon: AlertCircle,
      color: 'text-orange-500',
    },
    {
      title: 'Pending Review',
      value: stats.pendingReview,
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      title: 'Resolved',
      value: stats.resolved,
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
