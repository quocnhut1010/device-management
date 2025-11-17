import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { getManagerCharts } from '@/services/dashboardService'
import { getUserProfile } from '@/services/userService'
import type { DevicesByStatusDto } from '@/services/dashboardService'

export function DepartmentDevicesChart() {
  const [data, setData] = useState<DevicesByStatusDto[]>([])
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
        setData(charts.devicesByStatus)
      } catch (error) {
        console.error('Error loading department devices chart:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const chartData = data.map((item) => ({
    status: item.status,
    count: item.count,
  }))

  if (!loading && chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Department Devices by Status</CardTitle>
          <CardDescription>Device distribution in your department</CardDescription>
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
        <CardTitle>Department Devices by Status</CardTitle>
        <CardDescription>Device distribution in your department</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              count: {
                label: 'Devices',
                color: '#8b5cf6',
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="status" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

