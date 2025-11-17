import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AIChatService, aiChatService } from '@/services/aiChatService';
import { cn } from '@/lib/utils';

interface APIKeySettingsProps {
  open: boolean;
  onClose: (apiKeySaved: boolean) => void;
}

const APIKeySettings: React.FC<APIKeySettingsProps> = ({ open, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Load existing API key if available
      const storedKey = AIChatService.getStoredApiKey();
      if (storedKey) {
        setApiKey(storedKey);
      }
    }
  }, [open]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('Vui lòng nhập API key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Test the API key by making a simple request
      const testService = new AIChatService(apiKey.trim());
      const testResponse = await testService.sendMessage([
        {
          role: 'user',
          content: 'Hello, this is a test message',
          timestamp: new Date(),
        }
      ]);

      if (testResponse.error) {
        setError(testResponse.error);
        setIsLoading(false);
        return;
      }

      // Save the API key if test successful
      AIChatService.saveApiKey(apiKey.trim());
      onClose(true);
    } catch (error) {
      console.error('Error testing API key:', error);
      setError('Không thể kết nối với Google AI. Vui lòng kiểm tra API key.');
      setIsLoading(false);
    }
  };

  const handleUseDefault = () => {
    // Clear stored key to use default from env
    AIChatService.clearStoredApiKey();
    
    // Get default key from env and set it to instance
    const defaultKey = import.meta.env.VITE_AI_API_KEY;
    if (defaultKey && defaultKey.trim()) {
      // Update instance with default key
      aiChatService.setApiKey(defaultKey.trim());
      console.log('✅ Using default API key from environment');
    } else {
      console.warn('⚠️ No default API key found in VITE_AI_API_KEY environment variable');
      // Still close, but user will see error if they try to chat
    }
    
    onClose(false);
  };

  const handleClose = () => {
    setApiKey('');
    setError(null);
    onClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <DialogTitle>Cài đặt Google API Key</DialogTitle>
          </div>
          <DialogDescription>
            Để sử dụng tính năng chat với AI, bạn cần có Google API Key.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-4 py-4">
          <Alert>
            <AlertDescription className="text-sm">
              Để sử dụng tính năng chat với AI, bạn cần có Google API Key. 
              Bạn có thể sử dụng API key mặc định hoặc nhập API key của riêng bạn.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="api-key">Google API Key (Tùy chọn)</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                placeholder="Nhập Google API Key của bạn (AIza...)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
                disabled={isLoading}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Để lấy API key miễn phí, truy cập{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription className="text-sm">
              <p className="font-medium mb-1">💡 Mẹo:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Nếu bạn không có API key riêng, hệ thống sẽ sử dụng key mặc định</li>
                <li>API key được lưu trữ an toàn trên thiết bị của bạn</li>
                <li>Bạn có thể thay đổi API key bất cứ lúc nào</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <Separator />

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleUseDefault}
            disabled={isLoading}
            className="flex-1"
          >
            Sử dụng mặc định
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Đang kiểm tra...' : 'Lưu & Sử dụng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default APIKeySettings;

