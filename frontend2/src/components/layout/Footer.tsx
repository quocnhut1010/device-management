import React from 'react'
import { Building2, HelpCircle, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const appVersion = '1.0.0'

  return (
    <footer className="border-t bg-muted/40 mt-auto">
      <div className="container mx-auto px-6 py-4 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Copyright and Brand */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>
              © {currentYear} Device Management System. All rights reserved.
            </span>
          </div>

          {/* Center: Support Links */}
          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Hỗ trợ</span>
            </Link>
            <Link
              to="/reports"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Tài liệu</span>
            </Link>
          </div>

          {/* Right: Version */}
          <div className="text-sm text-muted-foreground">
            Version {appVersion}
          </div>
        </div>
      </div>
    </footer>
  )
}

