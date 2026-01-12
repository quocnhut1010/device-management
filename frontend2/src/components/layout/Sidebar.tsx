import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  AlertCircle,
  Wrench,
  Users,
  Settings,
  Building2,
  Boxes,
  Layers,
  Store,
  Building,
  UserCheck,
  RefreshCw,
  Trash2,
  History,
  FileText,
  Bell,
  ChevronDown,
  ChevronRight,
  Smartphone,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface MenuItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  section?: string
  nested?: boolean
}

interface MenuSection {
  label: string
  items: MenuItem[]
}

export function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()
  
  // Check if we're on a submenu page to keep submenu open
  const isSubmenuPage = location.pathname === "/device-models" || 
                        location.pathname === "/device-types" || 
                        location.pathname === "/suppliers"
  const [openSubmenu, setOpenSubmenu] = useState(isSubmenuPage)

  // Update submenu state when location changes
  useEffect(() => {
    if (isSubmenuPage) {
      setOpenSubmenu(true)
    }
  }, [location.pathname, isSubmenuPage])

  // Get menu sections based on user role and position
  const getMenuSections = (): MenuSection[] => {
    if (!user) return []

    const userRole = user.role
    const userPosition = user.position?.toLowerCase() || ""
    const isAdmin = userRole.toLowerCase() === "admin"
    const isManager = userRole.toLowerCase() === "user" && userPosition === "trưởng phòng"
    const isEmployee = userRole.toLowerCase() === "user" && userPosition === "nhân viên"
    const isTechnician = userRole.toLowerCase() === "user" && userPosition === "kỹ thuật viên"

    const sections: MenuSection[] = []

    // Section 1: Bảng điều khiển (Dashboard)
    sections.push({
      label: "Bảng điều khiển",
      items: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          section: "Bảng điều khiển",
        },
      ],
    })

    // Section 2: Quản lý thiết bị (Device Management)
    // Devices is shown to everyone
    const deviceManagementItems: MenuItem[] = [
      {
        href: "/devices",
        label: "Danh sách thiết bị",
        icon: Package,
        section: "Quản lý thiết bị",
      },
    ]

    // Admin: Add submenu for Device Models, Types, Suppliers
    if (isAdmin) {
      deviceManagementItems.push({
        href: "#",
        label: "Danh mục thiết bị",
        icon: Boxes,
        section: "Quản lý thiết bị",
      })
    }

    sections.push({
      label: "Quản lý thiết bị",
      items: deviceManagementItems,
    })

    // Section 3: Cơ cấu tổ chức (Organizational Structure)
    // Departments is shown to everyone
    sections.push({
      label: "Cơ cấu tổ chức",
      items: [
        {
          href: "/departments",
          label: "Phòng ban",
          icon: Building,
          section: "Cơ cấu tổ chức",
        },
      ],
    })

    // Section 4: Vận hành & Lịch sử (Operations & History)
    const operationsItems: MenuItem[] = []

    // My Devices (Employee only) - Thiết bị của tôi

    // Assignments (Admin only)
    if (isAdmin) {
      operationsItems.push({
        href: "/assignments",
        label: "Cấp phát",
        icon: UserCheck,
        section: "Vận hành & Lịch sử",
      })
    }

    // Incidents (Admin, Trưởng phòng, Nhân viên)
    if (isAdmin || isManager || isEmployee) {
      operationsItems.push({
        href: "/incidents",
        label: "Báo cáo sự cố",
        icon: AlertCircle,
        section: "Vận hành & Lịch sử",
      })
    }

    // Repairs (Admin, Kỹ thuật viên)
    if (isAdmin || isTechnician) {
      operationsItems.push({
        href: "/repairs",
        label: "Sửa chữa",
        icon: Wrench,
        section: "Vận hành & Lịch sử",
      })
    }

    // Replacements (Admin, Trưởng phòng, Nhân viên)
    if (isAdmin || isManager || isEmployee) {
      operationsItems.push({
        href: "/replacements",
        label: "Thay thế",
        icon: RefreshCw,
        section: "Vận hành & Lịch sử",
      })
    }

    // Device History (Admin only)
    if (isAdmin) {
      operationsItems.push({
        href: "/device-history",
        label: "Lịch sử hệ thống",
        icon: History,
        section: "Vận hành & Lịch sử",
      })
    }

    // Liquidation (Admin only)
    if (isAdmin) {
      operationsItems.push({
        href: "/liquidations",
        label: "Thanh lý",
        icon: Trash2,
        section: "Vận hành & Lịch sử",
      })
    }

    if (operationsItems.length > 0) {
      sections.push({
        label: "Vận hành & Lịch sử",
        items: operationsItems,
      })
    }

    // Section 5: Người dùng & Hệ thống (Users & System) - Admin only
    if (isAdmin) {
      sections.push({
        label: "Người dùng & Hệ thống",
        items: [
          {
            href: "/users",
            label: "Người dùng",
            icon: Users,
            section: "Người dùng & Hệ thống",
          },
          // {
          //   href: "/notifications",
          //   label: "Thông báo",
          //   icon: Bell,
          //   section: "Người dùng & Hệ thống",
          // },
          {
            href: "/reports",
            label: "Báo cáo",
            icon: FileText,
            section: "Người dùng & Hệ thống",
          },
        ],
      })
    }

    return sections
  }

  const menuSections = getMenuSections()
  const isActive = (path: string) => location.pathname === path

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen border-r bg-muted/40 z-40">
      <div className="flex h-16 items-center border-b px-6">
        <Building2 className="h-6 w-6 mr-2" />
        <span className="font-semibold">Device Manager</span>
      </div>
      <nav className="space-y-1 p-4 overflow-y-auto h-[calc(100vh-4rem)]">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-4">
            {/* Section Header */}
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.label}
            </div>

            {/* Section Items */}
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => {
                // Special handling for collapsible "Danh mục thiết bị" submenu
                if (item.href === "#" && item.label === "Danh mục thiết bị") {
                  return (
                    <Collapsible
                      key={itemIndex}
                      open={openSubmenu}
                      onOpenChange={setOpenSubmenu}
                    >
                      <CollapsibleTrigger
                        className={cn(
                          "w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                        {openSubmenu ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-4 space-y-1">
                        <Link
                          to="/device-models"
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            isActive("/device-models")
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          )}
                        >
                          <Boxes className="h-4 w-4" />
                          <span>Mẫu thiết bị</span>
                        </Link>
                        <Link
                          to="/device-types"
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            isActive("/device-types")
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          )}
                        >
                          <Layers className="h-4 w-4" />
                          <span>Loại thiết bị</span>
                        </Link>
                        <Link
                          to="/suppliers"
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            isActive("/suppliers")
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          )}
                        >
                          <Store className="h-4 w-4" />
                          <span>Nhà cung cấp</span>
                        </Link>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                }

                // Regular menu items
                const Icon = item.icon
                return (
                  <Link
                    key={itemIndex}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* Settings - Always visible at bottom */}
      </nav>
    </aside>
  )
}
