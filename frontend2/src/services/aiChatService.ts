import api from './api';

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  fileName?: string;
  fileUrl?: string;
}

export interface ChatSession {
  id: string;
  title?: string;
  createdAt: Date;
  lastActivityAt: Date;
}

export interface ChatHistoryResponse {
  session: ChatSession;
  messages: ChatMessage[];
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

interface ApiChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  fileName?: string;
  fileUrl?: string;
}

interface ApiChatSession {
  id: string;
  title?: string;
  createdAt: string;
  lastActivityAt: string;
}

class AIChatService {
  async startOrResumeSession(sessionId?: string): Promise<ChatHistoryResponse> {
    const payload = sessionId ? { sessionId } : {};
    const response = await api.post<{ session: ApiChatSession; messages: ApiChatMessage[] }>('/AIChat/sessions', payload);
    return this.transformHistory(response.data);
  }

  async getSession(sessionId: string): Promise<ChatHistoryResponse> {
    const response = await api.get<{ session: ApiChatSession; messages: ApiChatMessage[] }>(`/AIChat/sessions/${sessionId}`);
    return this.transformHistory(response.data);
  }

  async sendMessage(sessionId: string, message: string): Promise<SendMessageResponse> {
    const response = await api.post<{ userMessage: ApiChatMessage; assistantMessage: ApiChatMessage }>(
      `/AIChat/sessions/${sessionId}/messages`,
      { message }
    );

    return {
      userMessage: this.transformMessage(response.data.userMessage),
      assistantMessage: this.transformMessage(response.data.assistantMessage)
    };
  }

  async clearSession(sessionId: string): Promise<void> {
    await api.delete(`/AIChat/sessions/${sessionId}`);
  }

  private transformHistory(data: { session: ApiChatSession; messages: ApiChatMessage[] }): ChatHistoryResponse {
    return {
      session: this.transformSession(data.session),
      messages: data.messages.map((msg) => this.transformMessage(msg))
    };
  }

  private transformSession(session: ApiChatSession): ChatSession {
    return {
      id: session.id,
      title: session.title,
      createdAt: new Date(session.createdAt),
      lastActivityAt: new Date(session.lastActivityAt)
    };
  }

  private transformMessage(message: ApiChatMessage): ChatMessage {
    return {
      id: message.id,
      sessionId: message.sessionId,
      role: message.role,
      content: message.content,
      timestamp: new Date(message.createdAt),
      fileName: message.fileName,
      fileUrl: message.fileUrl
    };
  }
}

export const aiChatService = new AIChatService();

