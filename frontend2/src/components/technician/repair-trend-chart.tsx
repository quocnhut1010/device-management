import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { getTechnicianCharts } from '@/services/dashboardService'
import type { RepairTrendDto } from '@/services/dashboardService'

export function RepairTrendChart() {
  const [data, setData] = useState<RepairTrendDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const charts = await getTechnicianCharts()
        setData(charts.repairTrend)
      } catch (error) {
        console.error('Error loading repair trend:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const chartData = data.map((item) => ({
    week: item.week,
    assigned: item.assigned,
    completed: item.completed,
  }))

  if (!loading && chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Repair Trend</CardTitle>
          <CardDescription>Repair orders assigned vs completed per week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Repair Trend</CardTitle>
        <CardDescription>Repair orders assigned vs completed per week</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              assigned: {
                label: 'Assigned',
                color: '#3b82f6',
              },
              completed: {
                label: 'Completed',
                color: '#10b981',
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="assigned"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6, fill: '#2563eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6, fill: '#059669' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

