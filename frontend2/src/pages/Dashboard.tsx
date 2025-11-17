import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { StatsCards } from '@/components/admin/stats-cards'
import { DevicesByDepartmentChart } from '@/components/admin/devices-by-department-chart'
import { DeviceStatusChart } from '@/components/admin/device-status-chart'
import { IncidentTrendChart } from '@/components/admin/incident-trend-chart'
import { RepairMetricsChart } from '@/components/admin/repair-metrics-chart'
import { RecentIncidentsTable } from '@/components/admin/recent-incidents-table'
import { ActiveRepairsTable } from '@/components/admin/active-repairs-table'
import { RiskDevicesTable } from '@/components/admin/risk-devices-table'
import { ReplacementHistoryTable } from '@/components/admin/replacement-history-table'
import { ManagerStatsCards } from '@/components/manager/manager-stats-cards'
import { DepartmentDevicesChart } from '@/components/manager/department-devices-chart'
import { DepartmentIncidentsChart } from '@/components/manager/department-incidents-chart'
import { DepartmentDevicesTable } from '@/components/manager/department-devices-table'
import { DepartmentIncidentsTable } from '@/components/manager/department-incidents-table'
import { DepartmentRepairsTable } from '@/components/manager/department-repairs-table'
import { TechnicianStatsCards } from '@/components/technician/technician-stats-cards'
import { RepairTrendChart } from '@/components/technician/repair-trend-chart'
import { FrequentDevicesChart } from '@/components/technician/frequent-devices-chart'
import { WorkQueueTable } from '@/components/technician/work-queue-table'
import { RepairHistoryTable } from '@/components/technician/repair-history-table'
import { EmployeeStatsCards } from '@/components/employee/employee-stats-cards'
import { MyDevicesStatusChart } from '@/components/employee/my-devices-status-chart'
import { MyIncidentsChart } from '@/components/employee/my-incidents-chart'
import { MyDevicesTable } from '@/components/employee/my-devices-table'
import { MyIncidentsTable } from '@/components/employee/my-incidents-table'
import { NotificationWidget } from '@/components/shared/notification-widget'
import { WarrantyCalendarWidget } from '@/components/shared/warranty-calendar-widget'
import { AIChatDialog } from '@/components/ai'
import { Button } from '@/components/ui/button'
import { Bot } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function Dashboard() {
  const { user } = useAuth()
  const [showAIChat, setShowAIChat] = useState(false)

  // Map role and position from frontend2 to dashboard type
  const isAdmin = user?.role?.toLowerCase() === 'admin'
  const isManager = user?.role?.toLowerCase() === 'user' && user?.position?.toLowerCase() === 'trưởng phòng'
  const isTechnician = user?.role?.toLowerCase() === 'user' && user?.position?.toLowerCase() === 'kỹ thuật viên'
  const isEmployee = user?.role?.toLowerCase() === 'user' && (user?.position?.toLowerCase() === 'nhân viên' || !user?.position)

  if (isAdmin) {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Complete overview of device management system</p>
          </div>

          <StatsCards />

          <div className="grid gap-6 md:grid-cols-2">
            <DevicesByDepartmentChart />
            <DeviceStatusChart />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <IncidentTrendChart />
            <RepairMetricsChart />
          </div>

          <RecentIncidentsTable />

          <ActiveRepairsTable />

          <div className="grid gap-6 md:grid-cols-2">
            <RiskDevicesTable />
            <ReplacementHistoryTable />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <NotificationWidget />
            <WarrantyCalendarWidget />
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
                onClick={() => setShowAIChat(true)}
                aria-label="Chat with AI"
              >
                <Bot className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chat với AI</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AIChatDialog
          open={showAIChat}
          onClose={() => setShowAIChat(false)}
        />
      </>
    )
  }

  if (isManager) {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Department Manager Dashboard</h1>
            <p className="text-muted-foreground">Overview of your department's devices and incidents</p>
          </div>

          <ManagerStatsCards />

          <div className="grid gap-6 md:grid-cols-2">
            <DepartmentDevicesChart />
            <DepartmentIncidentsChart />
          </div>

          <DepartmentDevicesTable />

          <DepartmentIncidentsTable />

          <DepartmentRepairsTable />

          <div className="grid gap-6 md:grid-cols-2">
            <NotificationWidget />
            <WarrantyCalendarWidget />
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
                onClick={() => setShowAIChat(true)}
                aria-label="Chat with AI"
              >
                <Bot className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chat với AI</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AIChatDialog
          open={showAIChat}
          onClose={() => setShowAIChat(false)}
        />
      </>
    )
  }

  if (isTechnician) {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Technician Dashboard</h1>
            <p className="text-muted-foreground">Manage your repair queue and track performance</p>
          </div>

          <TechnicianStatsCards />

          <div className="grid gap-6 md:grid-cols-2">
            <RepairTrendChart />
            <FrequentDevicesChart />
          </div>

          <WorkQueueTable />

          <RepairHistoryTable />

          <div className="grid gap-6 md:grid-cols-2">
            <NotificationWidget />
            <WarrantyCalendarWidget />
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
                onClick={() => setShowAIChat(true)}
                aria-label="Chat with AI"
              >
                <Bot className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chat với AI</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AIChatDialog
          open={showAIChat}
          onClose={() => setShowAIChat(false)}
        />
      </>
    )
  }

  if (isEmployee) {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employee Dashboard</h1>
            <p className="text-muted-foreground">Manage your devices and track incident reports</p>
          </div>

          <EmployeeStatsCards />

          <div className="grid gap-6 md:grid-cols-2">
            <MyDevicesStatusChart />
            <MyIncidentsChart />
          </div>

          <MyDevicesTable />

          <MyIncidentsTable />

          <div className="grid gap-6 md:grid-cols-2">
            <NotificationWidget />
            <WarrantyCalendarWidget />
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
                onClick={() => setShowAIChat(true)}
                aria-label="Chat with AI"
              >
                <Bot className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chat với AI</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AIChatDialog
          open={showAIChat}
          onClose={() => setShowAIChat(false)}
        />
      </>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email || 'User'}!
        </p>
      </div>
      <div className="text-muted-foreground">
        Please contact your administrator to assign a role and position.
      </div>
    </div>
  )
}
