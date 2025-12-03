import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import ChangePasswordDialog from "@/components/settings/ChangePasswordDialog"

export default function SettingsPage() {
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
          <p className="text-muted-foreground">Quản lý cài đặt tài khoản và tùy chọn của bạn</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Đổi mật khẩu</CardTitle>
              </div>
              <CardDescription>
                Cập nhật mật khẩu của bạn để bảo vệ tài khoản tốt hơn
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => setIsChangePasswordDialogOpen(true)}>
                Đổi mật khẩu
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <ChangePasswordDialog
        open={isChangePasswordDialogOpen}
        onClose={() => setIsChangePasswordDialogOpen(false)}
      />
    </>
  )
}
