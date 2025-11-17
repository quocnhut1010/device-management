import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Pie, PieChart, Cell, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { getAdminCharts } from '@/services/dashboardService'
import type { DevicesByStatusDto } from '@/services/dashboardService'

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
]

export function DeviceStatusChart() {
  const [data, setData] = useState<DevicesByStatusDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const charts = await getAdminCharts()
        setData(charts.devicesByStatus)
      } catch (error) {
        console.error('Error loading device status:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Status Distribution</CardTitle>
        <CardDescription>Current status of all devices</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              value: {
                label: 'Count',
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

