import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { getTechnicianCharts } from '@/services/dashboardService'
import type { FrequentDevicesDto } from '@/services/dashboardService'

export function FrequentDevicesChart() {
  const [data, setData] = useState<FrequentDevicesDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const charts = await getTechnicianCharts()
        setData(charts.frequentDevices)
      } catch (error) {
        console.error('Error loading frequent devices:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const chartData = data.map((item) => ({
    device: item.deviceName,
    repairs: item.repairCount,
  }))

  if (!loading && chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Most Repaired Devices</CardTitle>
          <CardDescription>Devices I've repaired most frequently</CardDescription>
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
        <CardTitle>Most Repaired Devices</CardTitle>
        <CardDescription>Devices I've repaired most frequently</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              repairs: {
                label: 'Repairs',
                color: '#f59e0b',
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="device" type="category" width={100} stroke="#6b7280" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="repairs" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

