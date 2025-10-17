import { GoogleGenerativeAI } from "@google/generative-ai"

export const maxDuration = 30

interface Message {
  role: "user" | "assistant"
  content: string
}

export async function POST(req: Request) {
  try {
    const { messages, apiKey }: { messages: Message[]; apiKey: string } = await req.json()

    if (!apiKey) {
      return Response.json({ error: "API key is required" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction:
        "Bạn là nhân viên tư vấn thiết bị máy tính. Hãy tư vấn nhiệt tình, chuyên nghiệp và cung cấp thông tin chi tiết về các sản phẩm máy tính, linh kiện, phần cứng và giải pháp công nghệ.",
    })

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }))

    const lastMessage = messages[messages.length - 1]

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      },
    })

    const result = await chat.sendMessage(lastMessage.content)
    const response = await result.response
    const text = response.text()

    return Response.json({ text })
  } catch (error) {
    console.error("Error:", error)
    return Response.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
