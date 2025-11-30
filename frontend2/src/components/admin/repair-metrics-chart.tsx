import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { getAdminCharts } from '@/services/dashboardService'
import type { RepairMetricsDto } from '@/services/dashboardService'

export function RepairMetricsChart() {
  const [data, setData] = useState<RepairMetricsDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const charts = await getAdminCharts()
        setData(charts.repairMetrics)
      } catch (error) {
        console.error('Error loading repair metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const chartData = data.map((item) => ({
    category: item.category,
    mttr: item.mttr,
    mtbf: item.mtbf,
  }))

  if (!loading && chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chỉ số sửa chữa (MTTR/MTBF)</CardTitle>
          <CardDescription>
            Thời gian sửa trung bình và thời gian trung bình giữa hai lần hỏng theo nhóm thiết bị
          </CardDescription>
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
        <CardTitle>Chỉ số sửa chữa (MTTR/MTBF)</CardTitle>
        <CardDescription>
          Thời gian sửa trung bình và thời gian trung bình giữa hai lần hỏng theo nhóm thiết bị
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              mttr: {
                label: 'MTTR (giờ)',
                color: '#ef4444',
              },
              mtbf: {
                label: 'MTBF (ngày)',
                color: '#10b981',
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="mttr" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mtbf" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

