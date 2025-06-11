import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// Check if API key is available
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key. Please add OPENAI_API_KEY to your .env.local file');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a warm, curious conversational Indian matchmaker. Speak like a thoughtful, emotionally intelligent close friend. Keep replies short (1–3 lines), and ask one question at a time. Stay playful and real. Use simple and friendly English.

Your goal is to make the user feel like you understand them better than they understand themselves.

Start by asking the user's name.

Understand the user through their past experiences — not preferences. Avoid abstract, generic, or future-looking questions. Gently explore why they made certain choices, what they felt, and how they think.

Ask about relationships, friendships, family, career, and passions — not necessarily in that order. Stay with emotional cues. Avoid flattery.

Keep the conversation short — a maximum of 15 questions. Before ending, ask if they’d like a summary. If yes, share a short one with:

- One insight about them they haven’t explicitly said  
- Ideal partner traits  
- How the two would complement each other  
- Green flags to look for  
- Imperfections they should be okay with in a partner  
- A Hindi song for their current vibe

After the summary, gently ask for their WhatsApp so we can inform them if a great wavelength match is found.

Always invite them to keep chatting if they’re open to it.`;

const SUMMARY_PROMPT = `Based on the conversation so far, write a short, emotionally intelligent summary of the user.

Use clear bullet points and include:

- One key insight about the user they haven’t explicitly stated  
- 2–3 ideal partner traits that would complement them  
- How these traits complement the user’s patterns or emotional needs  
- 2–3 green flags the user should watch out for  
- 1–2 imperfections they should be okay with in a partner  
- A Hindi song that matches their current emotional vibe

Tone should feel personal, grounded, and caring — like a close friend reflecting back what they’ve understood. Avoid flattery. Do not repeat what the user already said — infer deeper meaning.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Then, get the final message response
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
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

    // Debug each condition separately
    const hasPersonality = 
      aiResponse.toLowerCase().includes("based on our conversation") ||
      aiResponse.toLowerCase().includes("personality") ||
      aiResponse.toLowerCase().includes("you come across as") ||
      aiResponse.toLowerCase().includes("from our discussion") ||
      aiResponse.toLowerCase().includes("what i've learned about you");
    
    const hasPartner = 
      aiResponse.toLowerCase().includes("ideal partner") ||
      aiResponse.toLowerCase().includes("partner traits") ||
      aiResponse.toLowerCase().includes("perfect match") ||
      aiResponse.toLowerCase().includes("compatible with") ||
      aiResponse.toLowerCase().includes("in a partner");
    
    const hasMustHave = 
      aiResponse.toLowerCase().includes("must-have") ||
      aiResponse.toLowerCase().includes("must have") ||
      aiResponse.toLowerCase().includes("essential qualities") ||
      aiResponse.toLowerCase().includes("key traits") ||
      aiResponse.toLowerCase().includes("non-negotiable");
    
    const hasSteps = 
      aiResponse.toLowerCase().includes("next step") ||
      aiResponse.toLowerCase().includes("moving forward") ||
      aiResponse.toLowerCase().includes("practical advice") ||
      aiResponse.toLowerCase().includes("what to look for") ||
      aiResponse.toLowerCase().includes("when meeting someone");
    
    const hasSong = 
      aiResponse.toLowerCase().includes("song") ||
      aiResponse.toLowerCase().includes("music") ||
      aiResponse.toLowerCase().includes("playlist") ||
      aiResponse.toLowerCase().includes("track") ||
      aiResponse.toLowerCase().includes("listen to");

    console.log('Summary format checks:', {
      hasPersonality,
      hasPartner,
      hasMustHave,
      hasSteps,
      hasSong
    });

    // Check if AI's response contains summary sections
    const hasSummaryFormat = aiResponse && (
      hasPersonality && 
      (hasPartner || hasMustHave) && 
      (hasSteps || hasSong)
    );
    
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
