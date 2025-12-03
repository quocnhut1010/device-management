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
  RefreshCw,
  Download,
} from 'lucide-react';
import { aiChatService } from '@/services/aiChatService';
import type { ChatMessage } from '@/services/aiChatService';
import { cn } from '@/lib/utils';

interface AIChatDialogProps {
  open: boolean;
  onClose: () => void;
}

const AIChatDialog: React.FC<AIChatDialogProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const API_BASE = (import.meta.env.VITE_API_URL?.replace(/\/api$/, '') ?? 'http://localhost:5264').replace(/\/$/, '');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      bootstrapSession();
    } else {
      resetState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const bootstrapSession = async () => {
    setIsBootstrapping(true);
    setError(null);
    try {
      const response = await aiChatService.startOrResumeSession(sessionId || undefined);
      setSessionId(response.session.id);
      setMessages(response.messages);
    } catch (err) {
      console.error('Error loading chat session:', err);
      setError('Không thể tải lịch sử trò chuyện. Vui lòng thử lại sau.');
    } finally {
      setIsBootstrapping(false);
    }
  };

  const resetState = () => {
    setMessages([]);
    setInputMessage('');
    setError(null);
    setIsBootstrapping(false);
  };

  const handleSendMessage = async () => {
    const messageToSend = inputMessage.trim();
    if (!messageToSend || isLoading || !sessionId) return;

    setInputMessage('');
    setIsLoading(true);
    setError(null);

    // Hiển thị tin nhắn của người dùng ngay lập tức (optimistic UI)
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId,
      role: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await aiChatService.sendMessage(sessionId, messageToSend);

      // Thay thế temp user message bằng userMessage thật từ server, rồi thêm assistant
      setMessages(prev => {
        const withoutTemp = prev.filter(m => m.id !== tempUserMessage.id);
        return [...withoutTemp, response.userMessage, response.assistantMessage];
      });
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

  const handleClearChat = async () => {
    if (!sessionId) return;
    try {
      await aiChatService.clearSession(sessionId);
      setSessionId(null);
      setMessages([]);
      await bootstrapSession();
    } catch (error) {
      console.error('Error clearing chat history:', error);
      setError('Không thể xóa lịch sử chat. Vui lòng thử lại.');
    }
  };

  const handleCloseDialog = () => {
    resetState();
    onClose();
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
                  disabled={!sessionId || isLoading}
                  title="Làm mới cuộc trò chuyện"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-4">
              {isBootstrapping && (
                <div className="flex items-center justify-center py-10">
                  <Spinner className="h-5 w-5 mr-2" />
                  <span className="text-sm text-muted-foreground">Đang tải lịch sử trò chuyện...</span>
                </div>
              )}

              {!isBootstrapping && messages.length === 0 && (
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

              {messages.map((message) => (
                <div
                  key={message.id}
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
                        "rounded-lg px-4 py-3 space-y-2",
                        message.role === 'user'
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted border"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>

                      {message.role === 'assistant' && message.fileName && (
                        <div className="mt-1 border border-dashed border-primary/40 rounded-md bg-background/60 px-3 py-2 text-xs text-foreground flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col">
                              <span className="font-medium">File báo cáo:</span>
                              <span className="truncate text-[11px] opacity-80">
                                {message.fileName}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs gap-1"
                              onClick={() => {
                                if (message.fileUrl) {
                                  window.open(`${API_BASE}${message.fileUrl}`, '_blank', 'noopener');
                                } else {
                                  setError('Không tìm thấy dữ liệu file để tải xuống. Vui lòng thử tạo lại báo cáo.');
                                }
                              }}
                            >
                              <Download className="h-3 w-3" />
                              <span>Tải file</span>
                            </Button>
                          </div>

                          {/* Simple description parsed from bullet lines in the response */}
                          {typeof message.content === 'string' && message.content.includes('•') && (
                            <div className="mt-1 text-[11px] text-muted-foreground border-t pt-1">
                              {message.content
                                .split('\n')
                                .filter((line) => line.trim().startsWith('•'))
                                .map((line, idx) => (
                                  <div key={idx} className="truncate">
                                    {line.replace(/^•\s*/,'')}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}

                      <p
                        className={cn(
                          "text-xs mt-1 opacity-70",
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
                disabled={isLoading || !sessionId}
                className="min-h-[60px] max-h-[120px] resize-none"
                rows={1}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || !sessionId}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIChatDialog;

