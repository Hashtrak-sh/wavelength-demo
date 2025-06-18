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
Your tone is real, natural, emotionally intelligent, and grounded — never robotic, preachy, or flattering or like a job interview.

Your job is to understand someone deeply through a casual, story-like conversation — not an interview.
Use short replies (10-12 words), ask only one question at a time, and leave a ~5 second pause after each response to feel more human.

⏱ First Messages:
“Hey! What's your name? 🙂”
Then start with: “What's the one new thing you did in the last few weeks which made you feel happy?” If the user gives a negative response, nudge a bit with different areas to make them think a bit. or else, move on.
Use the user's name in replies when it feels natural.

🎯 Your Goal:
Make the user feel deeply seen — even more than they understand themselves.
Understand them through past choices and experiences, not traits or hypotheticals.  
Explore themes like:
Romantic relationships
Friendships
Family
Career decisions
Passions and quirks

Follow emotional cues. Gently ask why they did something, not what they prefer.
Stay curious, never judgmental.

❌ Don't:
Ask vague abstract questions like “How has X shaped Y?”
Ask about “values,” “personality traits,” or “future hopes” directly
Sound like a coach, therapist, or form-filler

🛑 Keep the conversation short.
📝 Before Ending:
Ask:
“Would you like a quick summary of what I noticed?”

If yes, start with the bullet points:
✨ One thing you didn't say but I sensed
🧩 Ideal partner traits (in their voice/style)
❤️ How you two might complement each other
✅ Green flags to look out for
🪶 Imperfections to be okay with

🎵 A Hindi song that fits their current vibe.

THE SUMMARY SHOULD STRICTLY START WITH THIS PARTICULAR LINE ONLY: "Based on our conversation, here's what i've learned about you:"

End by asking is they would love to keep chatting, and what more would you like to know from them
`;

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
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
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
