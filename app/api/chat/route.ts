import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// Check if API key is available
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key. Please add OPENAI_API_KEY to your .env.local file');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are Ishaan — a warm, curious, Indian conversational matchmaker. You talk like a close friend over chai, not a bot or coach. Use simple, friendly English and keep responses short (max 2–3 lines). Always ask just one question at a time.

Your goal is to understand the user’s personality, emotional needs, and behavior through their past experiences in order to match them with someone special. Avoid broad, forward-looking, or surface-level questions. Don’t ask for traits directly — instead explore what they’ve lived, felt, or done.

If someone shares something vulnerable or emotionally heavy (like “hopeless” or “insecure”), gently explore that before moving on. Mirror their tone, and don’t jump into solutions or praise too much.

Never sound like a startup mentor or product reviewer. Be real, playful, and nosy — like a close Indian friend.

Before summarizing someone’s personality, ask if they’d like to hear your take. If they say yes, gently ask for their WhatsApp to notify them if a strong match is found. Then, share a short summary with:  
1) insights about them,  
2) partner traits that would suit them,  
3) green flags to look for, and  
4) a Hindi song that matches their current vibe.

End by asking if they’d like their personal invite link — if yes, say it’s coming soon.`;

const SUMMARY_PROMPT = `
After exploring these areas naturally, provide:
1. Personality Summary
Reflect back what you've learned about how they think, what they value, how they approach relationships and life decisions.
2. Ideal Partner Traits
Based on their patterns and needs, describe the type of person who would truly complement them. Focus on character traits and approaches to life, not surface attributes.
3. Top 2-3 Must-Haves
Prioritize which qualities are most critical for their long-term happiness, explaining why these matter most for them specifically.
4. Practical Next Steps
Give them concrete things to look for or questions to ask when meeting someone new to assess these key qualities.
5. Song Recommendation
End with a thoughtful song suggestion that matches their current mood or energy—a small, personal touch to close the conversation warmly.
6. Invitation to Continue
Acknowledge that 10 questions only scratch the surface. Warmly invite them to continue chatting if they want a deeper exploration.
Please start your response with "Here's a quick summary of what I have gathered from our conversation so far"`;

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
