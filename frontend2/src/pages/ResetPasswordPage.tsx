import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, Lock } from 'lucide-react'
import { resetPassword } from '@/services/authService'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  // Function to mask token - show first 12 characters + "..."
  const maskToken = (tokenValue: string): string => {
    if (!tokenValue) return ''
    if (tokenValue.length <= 12) return tokenValue
    return tokenValue.substring(0, 12) + '...'
  }

  useEffect(() => {
    // Pre-fill token and email from URL params if available
    const urlToken = searchParams.get('token')
    const urlEmail = searchParams.get('email')
    if (urlToken) setToken(urlToken)
    if (urlEmail) setEmail(urlEmail)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }

    setIsLoading(true)

    try {
      await resetPassword(token, email, newPassword)
      setSuccess(true)
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      console.error('Reset password failed:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data || 
                          err.message || 
                          'Đã xảy ra lỗi. Vui lòng thử lại.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Lock className="h-5 w-5" />
              Đặt lại mật khẩu thành công
            </CardTitle>
            <CardDescription>
              Mật khẩu của bạn đã được đặt lại thành công. Đang chuyển đến trang đăng nhập...
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Đi đến trang đăng nhập
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Đặt lại mật khẩu
          </CardTitle>
          <CardDescription>
            Nhập thông tin để đặt lại mật khẩu mới
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                readOnly
                required
                disabled={isLoading}
                className="bg-muted cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token">Token đặt lại mật khẩu</Label>
              <Input
                id="token"
                type="text"
                placeholder="Token từ email"
                value={maskToken(token)}
                readOnly
                required
                disabled={isLoading}
                className="bg-muted cursor-not-allowed font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
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

