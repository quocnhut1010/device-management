import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
  Send,
  Bot,
  User,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { aiChatService, AIChatService } from '@/services/aiChatService';
import type { ChatMessage } from '@/services/aiChatService';
import APIKeySettings from './APIKeySettings';
import { cn } from '@/lib/utils';

interface AIChatDialogProps {
  open: boolean;
  onClose: () => void;
}

const AIChatDialog: React.FC<AIChatDialogProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if we have API key on mount
  useEffect(() => {
    if (open) {
      const storedKey = AIChatService.getStoredApiKey();
      if (!storedKey) {
        setShowSettings(true);
      }
    }
  }, [open]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiChatService.sendMessage([...messages, userMessage]);
      
      if (response.error) {
        setError(response.error);
      } else {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.text,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleCloseDialog = () => {
    setMessages([]);
    setError(null);
    setShowSettings(false);
    onClose();
  };

  const handleSettingsClose = (apiKeySaved: boolean) => {
    setShowSettings(false);
    // Clear any existing errors when settings close
    setError(null);
    
    if (apiKeySaved) {
      // Initialize with new API key from localStorage
      const storedKey = AIChatService.getStoredApiKey();
      if (storedKey) {
        aiChatService.setApiKey(storedKey);
      }
    } else {
      // If not saved (e.g., "Use default" was clicked), try to use default from env
      const defaultKey = import.meta.env.VITE_AI_API_KEY;
      if (defaultKey) {
        aiChatService.setApiKey(defaultKey);
        console.log('✅ Default API key set from environment');
      } else {
        console.warn('⚠️ No default API key found in environment variables');
      }
    }
  };

  // Welcome messages for first time
  const welcomeMessages = [
    "👋 Xin chào! Tôi là trợ lý AI chuyên về quản lý thiết bị IT.",
    "🔧 Tôi có thể giúp bạn:",
    "• Tư vấn thiết bị máy tính, laptop, máy in",
    "• Hướng dẫn sử dụng hệ thống quản lý thiết bị", 
    "• Giải đáp thắc mắc kỹ thuật",
    "• Hỗ trợ quy trình báo cáo sự cố và bảo trì",
    "",
    "💬 Hãy hỏi tôi bất cứ điều gì bạn muốn biết!"
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle>Trợ lý AI - Quản lý thiết bị</DialogTitle>
                  <DialogDescription className="text-xs">
                    Powered by Google Gemini
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  title="Làm mới cuộc trò chuyện"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  title="Cài đặt API Key"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="rounded-lg border bg-muted/50 p-6 mb-4">
                  <div className="space-y-2">
                    {welcomeMessages.map((msg, index) => (
                      <p
                        key={index}
                        className={cn(
                          "text-sm",
                          msg === '' ? "h-2" : "",
                          index === 0 ? "font-semibold text-primary text-base" : "text-foreground"
                        )}
                      >
                        {msg}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-start gap-3 max-w-[80%]",
                      message.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar
                      className={cn(
                        "h-8 w-8 shrink-0",
                        message.role === 'user'
                          ? "bg-primary"
                          : "bg-secondary"
                      )}
                    >
                      <AvatarFallback
                        className={cn(
                          message.role === 'user'
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        {message.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "rounded-lg px-4 py-3",
                        message.role === 'user'
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted border"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-2 opacity-70",
                          message.role === 'user' ? "text-right" : "text-left"
                        )}
                      >
                        {message.timestamp.toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <Avatar className="h-8 w-8 bg-secondary shrink-0">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg border bg-muted px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Spinner className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">
                          Đang suy nghĩ...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator />

          <div className="p-4">
            <div className="flex items-end gap-2">
              <Textarea
                placeholder="Nhập tin nhắn của bạn..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="min-h-[60px] max-h-[120px] resize-none"
                rows={1}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <APIKeySettings
        open={showSettings}
        onClose={handleSettingsClose}
      />
    </>
  );
};

export default AIChatDialog;

