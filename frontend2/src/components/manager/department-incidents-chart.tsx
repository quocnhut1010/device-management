import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { getManagerCharts } from '@/services/dashboardService'
import { getUserProfile } from '@/services/userService'
import type { DepartmentIncidentsTrendDto } from '@/services/dashboardService'

export function DepartmentIncidentsChart() {
  const [data, setData] = useState<DepartmentIncidentsTrendDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const profileResponse = await getUserProfile()
        const departmentId = profileResponse.data.departmentId
        if (!departmentId) {
          console.error('No department ID found for manager')
          return
        }
        const charts = await getManagerCharts(departmentId)
        setData(charts.departmentIncidentsTrend)
      } catch (error) {
        console.error('Error loading department incidents chart:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const chartData = data.map((item) => ({
    month: item.period,
    incidents: item.count,
  }))

  if (!loading && chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Department Incidents Trend</CardTitle>
          <CardDescription>Monthly incidents over the last 6 months</CardDescription>
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
        <CardTitle>Department Incidents Trend</CardTitle>
        <CardDescription>Monthly incidents over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              incidents: {
                label: 'Incidents',
                color: '#8b5cf6',
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="incidents"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#8b5cf6' }}
                  activeDot={{ r: 6, fill: '#7c3aed' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

