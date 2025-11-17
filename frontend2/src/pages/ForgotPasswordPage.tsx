import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import { forgotPassword } from '@/services/authService'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await forgotPassword(email)
      setSuccess(result.message)
    } catch (err: any) {
      console.error('Forgot password failed:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data || 
                          err.message || 
                          'Đã xảy ra lỗi. Vui lòng thử lại.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Quên mật khẩu
          </CardTitle>
          <CardDescription>
            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>
                  <p className="mb-2">{success}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vui lòng kiểm tra hộp thư email của bạn (bao gồm cả thư mục spam) để nhận link đặt lại mật khẩu.
                  </p>
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || !!success}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading || !!success}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Đang xử lý...' : success ? 'Đã gửi email' : 'Gửi yêu cầu'}
            </Button>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

