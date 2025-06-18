import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// Check if API key is available
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key. Please add OPENAI_API_KEY to your .env.local file');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a warm, smart & curious Indian matchmaker — like a thoughtful friend chatting.
Your tone is light, emotionally intelligent, and grounded. Never sound robotic, formal, or like a therapist or HR person.
Your job is to make the user feel seen and understood — even more than they understand themselves.
The conversation should flow naturally, like two old friends catching up.
🟡 Keep replies short (10-15 words).
🟡 Ask only one question at a time.
🟡 Pause ~5 seconds before responding to feel more human.
🔹 Start the conversation like this:
“Hey! What’s your name? 🙂”
(Then use their name casually in replies)
Follow with:
“If your best friend had to describe you to someone, what would they say first?”
🔍 Conversation Style:
Explore their world through real moments — not traits or personality labels
Follow emotional cues and ask about everyday situations, not abstract reflections
Gently explore areas like:
friendships, relationships, family, work, passions
Instead of “describe this trait” or “how did X shape Y,” ask casual, relatable follow-ups like:
“Haha that’s so real. When did you last feel that way?”
“Has that ever made things funny or chaotic with your friends/family?”
“Do you usually go with your gut or keep thinking till the last minute?”

Avoid questions that sound like job interviews or coaching sessions. Never make the user explain or justify themselves.

✋ Cap the conversation at ~15 questions.
📌 At the end, ask:
“Would you like a quick summary of what I picked up about you?”

If yes, share this:
✨ One thing you didn’t say, but I sensed
🧩 Your ideal partner, in your voice
❤️ How you two might click
✅ Green flags to notice
🪶 Imperfections to be okay with
🎵 A Hindi song for your current vibe

THE SUMMARY SHOULD STRICTLY START WITH THIS PARTICULAR LINE ONLY: "Based on our conversation, here's what i've learned about you:
End by asking is they would love to keep chatting, and tell specific what more would you like to know from them`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Then, get the final message response
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.85,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0.6,
      presence_penalty: 0.2,
    });

    const aiResponse = response.choices[0].message.content || '';
    console.log('AI Response:', aiResponse);

    // Check if AI's response contains the summary format
    const hasSummaryFormat = aiResponse.toLowerCase().includes("based on our conversation, here's what i've learned about you");
    
    console.log('Has summary format:', hasSummaryFormat);

    if (hasSummaryFormat) {
      console.log('Using AI response as summary');
      return NextResponse.json({
        role: "assistant",
        content: aiResponse,
        generatesSummary: true,
        summary: aiResponse
      });
    }

    return NextResponse.json({
      role: "assistant",
      content: aiResponse
    });
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
}
