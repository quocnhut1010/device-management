import React from 'react'
import {
  Building2,
  LayoutDashboard,
  Package,
  AlertCircle,
  Wrench,
  HelpCircle,
  FileText,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Shield,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const appVersion = '1.0.0'

  // Contact information - có thể lấy từ config hoặc API trong tương lai
  const contactInfo = {
    email: 'support@devicemanagement.com',
    phone: '+84 123 456 789',
    address: '123 Đường ABC, Quận XYZ, TP.HCM',
  }

  return (
    <footer className="border-t border-border/50 bg-muted/20 mt-auto">
      <div className="container mx-auto px-6 py-6 max-w-7xl">
        {/* Main Footer Content - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          {/* Column 1: System Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold text-base">Device Manager</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Hệ thống quản lý thiết bị chuyên nghiệp
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-2">
              Liên kết nhanh
            </h3>
            <ul className="space-y-1.5">
              <li>
                <Link
                  to="/dashboard"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/devices"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <Package className="h-3.5 w-3.5" />
                  <span>Thiết bị</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/incidents"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Báo cáo sự cố</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/repairs"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  <span>Sửa chữa</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-2">
              Hỗ trợ
            </h3>
            <ul className="space-y-1.5">
              <li>
                <Link
                  to="/dashboard"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Hỗ trợ kỹ thuật</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/reports"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Tài liệu</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Hướng dẫn sử dụng</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-2">
              Liên hệ
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-start gap-1.5"
                >
                  <Mail className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span className="break-all">{contactInfo.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{contactInfo.phone}</span>
                </a>
              </li>
              <li className="text-xs text-muted-foreground flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>{contactInfo.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 pt-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              © {currentYear} Device Management System. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-xs">
              <Link
                to="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Shield className="h-3 w-3" />
                <span>Chính sách bảo mật</span>
              </Link>
              <div className="text-muted-foreground">
                Version {appVersion}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

