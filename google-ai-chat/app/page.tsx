"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Send, Sparkles, Key, Settings } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const [apiKey, setApiKey] = useState("")
  const [showSettings, setShowSettings] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const savedKey = localStorage.getItem("google_api_key")
    if (savedKey) {
      setApiKey(savedKey)
      setShowSettings(false)
    }
  }, [])

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("google_api_key", apiKey)
      setShowSettings(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !apiKey.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          apiKey,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      const assistantMessage: Message = {
        role: "assistant",
        content: data.text,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng kiểm tra API key và thử lại.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (showSettings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
        <Card className="w-full max-w-md p-8 shadow-2xl">
          <div className="mb-6 flex items-center justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Key className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="mb-2 text-center text-2xl font-bold text-foreground">Chào mừng đến với AI Chat</h1>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Nhập Google API Key của bạn để bắt đầu trò chuyện
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-foreground">
                Google API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="AIza..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Lấy API key tại{" "}
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
            <Button onClick={saveApiKey} disabled={!apiKey.trim()} className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Bắt đầu chat
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">AI Chat</h1>
              <p className="text-xs text-muted-foreground">Powered by Google Gemini</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-6">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-foreground">Bắt đầu cuộc trò chuyện</h2>
              <p className="text-sm text-muted-foreground">Hỏi tôi bất cứ điều gì, tôi sẵn sàng giúp đỡ!</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-card px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm px-4 py-4">
        <div className="mx-auto flex max-w-4xl gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn của bạn..."
            disabled={isLoading}
            className="flex-1 bg-background"
          />
          <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
