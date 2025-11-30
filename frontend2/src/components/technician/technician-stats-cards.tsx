import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, Clock, CheckCircle, TrendingUp } from 'lucide-react'
import { getTechnicianStats } from '@/services/dashboardService'

export function TechnicianStatsCards() {
  const [stats, setStats] = useState({
    pendingRepairs: 0,
    inProgress: 0,
    completedToday: 0,
    avgTime: 'N/A',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await getTechnicianStats()
        setStats({
          pendingRepairs: data.repairsPending,
          inProgress: data.repairsInProgress,
          completedToday: data.repairsCompletedThisWeek,
          avgTime: data.avgRepairTime,
        })
      } catch (error) {
        console.error('Error loading technician stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const cards = [
    {
      title: 'Hàng chờ xử lý',
      value: stats.pendingRepairs,
      icon: ClipboardList,
      color: 'text-blue-500',
    },
    {
      title: 'Đang thực hiện',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-orange-500',
    },
    {
      title: 'Đã hoàn thành tuần này',
      value: stats.completedToday,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Thời gian sửa TB',
      value: stats.avgTime,
      icon: TrendingUp,
      color: 'text-purple-500',
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
