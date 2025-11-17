import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { getEmployeeCharts } from '@/services/dashboardService'
import type { IncidentTrendDto } from '@/services/dashboardService'

export function MyIncidentsChart() {
  const [data, setData] = useState<IncidentTrendDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const charts = await getEmployeeCharts()
        setData(charts.myIncidentsTrend)
      } catch (error) {
        console.error('Error loading my incidents chart:', error)
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
          <CardTitle>My Incident Reports</CardTitle>
          <CardDescription>Incidents I've reported over time</CardDescription>
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
        <CardTitle>My Incident Reports</CardTitle>
        <CardDescription>Incidents I've reported over time</CardDescription>
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
                color: '#f59e0b',
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
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#f59e0b' }}
                  activeDot={{ r: 6, fill: '#d97706' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

