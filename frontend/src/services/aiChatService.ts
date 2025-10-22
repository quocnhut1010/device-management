import { GoogleGenerativeAI } from '@google/generative-ai';
import AIContextService from './aiContextService';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  text: string;
  error?: string;
}

export class AIChatService {
  private static readonly DEFAULT_API_KEY = import.meta.env.VITE_AI_API_KEY || ''; // Load from .env file
  private static readonly MODEL_NAME = 'gemini-2.0-flash-lite';
  
  private static readonly SYSTEM_INSTRUCTION = `Bạn là trợ lý AI chuyên về quản lý thiết bị công nghệ thông tin với khả năng truy cập dữ liệu thực từ hệ thống. Vai trò của bạn là:

1. **Trả lời câu hỏi dựa trên dữ liệu thực**: 
   - Thống kê số lượng thiết bị, phòng ban, nhà cung cấp
   - Phân tích trạng thái thiết bị (đang sử dụng, chờ thanh lý, bảo trì, v.v.)
   - Thông tin về thiết bị theo phòng ban cụ thể
   - Lịch sử và hoạt động thiết bị

2. **Tư vấn thiết bị IT**: 
   - Máy tính, laptop, máy in, thiết bị mạng
   - Đề xuất dựa trên dữ liệu hiện có trong hệ thống
   - So sánh và phân tích thiết bị

3. **Hỗ trợ quản lý thiết bị**:
   - Quy trình quản lý dựa trên dữ liệu thực tế
   - Phân tích xu hướng sử dụng thiết bị
   - Đề xuất bảo trì, thay thế dựa trên thống kê

4. **Hướng dẫn sử dụng hệ thống**:
   - Giải thích tính năng dựa trên dữ liệu hiện tại
   - Hướng dẫn thao tác với ngữ cảnh cụ thể

**QUAN TRỌNG**: 
- Khi người dùng hỏi về số liệu, thống kê, hoặc thông tin cụ thể về thiết bị/phòng ban/nhà cung cấp, hãy ưu tiên sử dụng dữ liệu thực từ hệ thống.
- Sử dụng tiếng Việt, giọng điệu thân thiện và chuyên nghiệp.
- Trình bày thông tin rõ ràng với emoji và định dạng markdown để dễ đọc.
- Nếu không tìm thấy dữ liệu cụ thể, hãy giải thích và đưa ra gợi ý thay thế.`;

  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || AIChatService.DEFAULT_API_KEY;
    this.initializeAI();
  }

  private initializeAI() {
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    } catch (error) {
      console.error('Failed to initialize Google Generative AI:', error);
    }
  }

  public setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.initializeAI();
  }

  public static getStoredApiKey(): string | null {
    return localStorage.getItem('device_management_ai_api_key');
  }

  public static saveApiKey(apiKey: string) {
    localStorage.setItem('device_management_ai_api_key', apiKey);
  }

  public static clearStoredApiKey() {
    localStorage.removeItem('device_management_ai_api_key');
  }

  public async sendMessage(
    messages: ChatMessage[],
    customApiKey?: string
  ): Promise<ChatResponse> {
    const keyToUse = customApiKey || this.apiKey;
    
    if (!keyToUse) {
      return {
        text: '',
        error: 'API key không được cung cấp'
      };
    }

    const lastMessage = messages[messages.length - 1];
    
    // Check if this is a system data query first
    if (this.isSystemDataQuery(lastMessage.content)) {
      try {
        console.log('🔍 Processing system data query:', lastMessage.content);
        const systemResponse = await AIContextService.processQuery(lastMessage.content);
        return { text: systemResponse };
      } catch (error) {
        console.error('Error processing system query:', error);
        // Fall back to regular AI chat if system query fails
      }
    }

    try {
      // Use custom key if provided, otherwise use instance key
      const genAI = customApiKey ? new GoogleGenerativeAI(customApiKey) : this.genAI;
      
      if (!genAI) {
        throw new Error('Google Generative AI not initialized');
      }

      const model = genAI.getGenerativeModel({
        model: AIChatService.MODEL_NAME,
        systemInstruction: AIChatService.SYSTEM_INSTRUCTION,
      });

      // Convert messages to Gemini format
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;
      const text = response.text();

      return { text };
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      let errorMessage = 'Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.';
      
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('invalid API key')) {
          errorMessage = 'API key không hợp lệ. Vui lòng kiểm tra lại API key của bạn.';
        } else if (error.message.includes('quota')) {
          errorMessage = 'Đã vượt quá giới hạn sử dụng API. Vui lòng thử lại sau.';
        }
      }

      return {
        text: '',
        error: errorMessage
      };
    }
  }

  private isSystemDataQuery(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    
    const systemKeywords = [
      'bao nhiêu thiết bị',
      'số lượng thiết bị', 
      'có bao nhiêu',
      'nhà cung cấp nào',
      'phòng ban nào',
      'thiết bị nào',
      'đang chờ thanh lý',
      'đang sử dụng',
      'thống kê',
      'tổng quan hệ thống',
      'tình trạng thiết bị',
      'phòng',
      'department',
      'supplier'
    ];

    return systemKeywords.some(keyword => lowerMessage.includes(keyword));
  }
}

// Singleton instance
export const aiChatService = new AIChatService();