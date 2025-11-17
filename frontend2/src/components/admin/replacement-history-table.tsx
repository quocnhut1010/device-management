import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowRight } from 'lucide-react'
import { getAdminTables } from '@/services/dashboardService'
import type { ReplacementHistoryDto } from '@/services/dashboardService'

export function ReplacementHistoryTable() {
  const [replacements, setReplacements] = useState<ReplacementHistoryDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const tables = await getAdminTables()
        setReplacements(tables.replacementHistory)
      } catch (error) {
        console.error('Error loading replacement history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Replacements</CardTitle>
        <CardDescription>Device replacement and liquidation history</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Old Device</TableHead>
                <TableHead></TableHead>
                <TableHead>New Device</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {replacements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No replacements found
                  </TableCell>
                </TableRow>
              ) : (
                replacements.map((replacement) => (
                  <TableRow key={replacement.id}>
                    <TableCell className="font-medium">
                      {replacement.replacedDeviceName} ({replacement.replacedDeviceCode})
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-medium">
                      {replacement.deviceName} ({replacement.deviceCode})
                    </TableCell>
                    <TableCell>
                      {new Date(replacement.replacementDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{replacement.reason || 'N/A'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

