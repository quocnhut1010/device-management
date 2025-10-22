# AI Chat Feature

## Overview
This feature integrates Google Gemini AI into the Device Management system, providing users with an intelligent assistant specialized in IT equipment management.

## Features
- 🤖 **AI Assistant**: Powered by Google Gemini 2.0 Flash Lite
- 💬 **Real-time Chat**: Interactive conversation interface
- 🔑 **API Key Management**: Support for custom API keys or default key
- 📱 **Responsive Design**: Works on desktop and mobile
- 🔒 **Secure Storage**: API keys stored locally in browser
- 🎯 **Specialized Knowledge**: Trained for IT equipment management

## Components

### AIChatDialog
Main chat interface component with:
- Message history display
- Real-time typing indicators  
- Error handling
- Settings integration
- Auto-scroll functionality

### APIKeySettings
API key management component with:
- Key validation and testing
- Secure input with show/hide toggle
- Default key fallback option
- User-friendly setup wizard

### AIChatService
Service layer providing:
- Google Gemini API integration
- Message handling and conversation management
- Error handling and retry logic
- Local storage management

## AI Capabilities

The AI assistant is specialized for:

### 🔧 IT Equipment Consultation
- Computer, laptop, printer recommendations
- Hardware compatibility advice
- Technical specifications guidance
- Equipment comparison and selection

### 📋 Device Management Support
- Equipment lifecycle management
- Inventory and cataloging procedures
- Usage history tracking
- Maintenance scheduling guidance

### 🛠️ Technical Support
- Troubleshooting common issues
- Hardware/software compatibility
- Security best practices
- Performance optimization tips

### 📖 System Guidance
- How to report incidents
- Equipment assignment procedures
- User and department management
- System feature explanations

## Usage

### Quick Start
1. Click the AI chat button (🤖) on the Dashboard
2. If no custom API key is set, the system uses the default key
3. Start chatting with the AI assistant
4. Get instant help and recommendations

### Custom API Key Setup
1. Click the settings (⚙️) button in the chat dialog
2. Enter your Google API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. The key is validated and saved locally
4. Start using your personalized AI assistant

### Example Conversations

**Equipment Recommendation:**
```
User: "I need a laptop for software development, budget around 30 million VND"
AI: "Tôi khuyến nghị một số lựa chọn laptop phù hợp cho phát triển phần mềm trong tầm giá 30 triệu..."
```

**System Help:**
```
User: "How do I report a device malfunction?"
AI: "Để báo cáo sự cố thiết bị, bạn có thể làm theo các bước sau..."
```

**Technical Support:**
```
User: "My printer is not connecting to the network"
AI: "Lỗi kết nối mạng của máy in có thể do nhiều nguyên nhân. Hãy thử các cách khắc phục sau..."
```

## Configuration

### Default API Key
The system includes a default API key for immediate usage. Users can optionally set their own key for better performance and quotas.

### Model Settings
- **Model**: `gemini-2.0-flash-lite` (optimized for speed and cost)
- **Temperature**: 0.7 (balanced creativity and accuracy) 
- **Max Tokens**: 2000 (sufficient for detailed responses)

### System Instruction
The AI is configured with specialized prompts for:
- Vietnamese language responses
- IT equipment expertise
- Device management knowledge
- Professional and helpful tone

## API Integration

### Google Gemini API
```typescript
// Service initialization
const aiChatService = new AIChatService(apiKey);

// Send message
const response = await aiChatService.sendMessage(messages);
```

### Error Handling
- Invalid API key detection
- Network error management
- Quota limit handling
- User-friendly error messages

## Security & Privacy

### Data Protection
- No conversation data stored on servers
- API keys stored only in browser localStorage
- Direct client-to-Google API communication
- No message logging or tracking

### API Key Security
- Keys are masked in UI
- Local storage encryption
- Option to clear stored keys
- Validation before usage

## Troubleshooting

### Common Issues

**AI not responding:**
- Check internet connection
- Verify API key validity
- Check Google AI service status

**API key invalid:**
- Ensure key format starts with "AIza"
- Check key permissions in Google AI Studio
- Verify billing is enabled (if using paid quotas)

**Slow responses:**
- Network connectivity issues
- High API usage (rate limiting)
- Switch to custom API key for better performance

## Future Enhancements

Planned features:
- 📊 Chat analytics and insights
- 🗂️ Conversation history persistence  
- 🔍 Context-aware responses based on current page
- 📁 File upload for technical documentation
- 🌐 Multi-language support
- 🎨 Customizable chat themes

---

For technical support or feature requests, contact the development team.