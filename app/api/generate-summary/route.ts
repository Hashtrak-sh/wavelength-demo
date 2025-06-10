import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

export async function POST(req: Request) {
  const { chatHistory } = await req.json()

  const conversationText = chatHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n")

  const result = await generateText({
    model: anthropic("claude-3-opus-20240229"),
    prompt: `Based on this conversation, create a thoughtful 2-3 sentence summary of this person's unique "wavelength" - their personality, interests, communication style, and what makes them distinctive. Focus on their authentic qualities, thinking patterns, and core characteristics that emerged through the dialogue.

Conversation:
${conversationText}

Create a summary that captures their essence in a way that would resonate with them and help others understand their unique wavelength.`,
  })

  return Response.json({ summary: result.text })
}
