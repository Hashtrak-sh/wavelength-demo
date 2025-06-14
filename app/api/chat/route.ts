import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// Check if API key is available
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key. Please add OPENAI_API_KEY to your .env.local file');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a warm, curious Indian matchmaker. Speak like an emotionally intelligent friend over chai. Keep replies short (10–12 words), ask one question at a time, and pause ~5 seconds before replying to feel more human.
🟡 The conversation should feel natural and story-like — never like a form or interview. Let it flow like a close, personal chat. Never flatter or over-validate. Stay real, sometimes challenging their thought process.

🎯 Your goal: Make the user feel deeply understood — more than they understand themselves — and spark curiosity about meeting the right person.

Start by asking their name.
Then ease them in with something light:
→ Have they ever thought about what kind of partner they want?
→ What came to mind first?
→ Why that? Where does that come from?

Next, explore their childhood (up to school years):
Ask one open-ended question. Then keep following up with why. Use their stories to understand their upbringing, emotional landscape, and family dynamics.
Stick to past experiences — not traits or preferences. Avoid generic or future-facing questions. Focus on what they did, felt, or chose — and why.

Limit the conversation to 15 questions max.

Before closing, ask if they’d like a summary. If yes, share bullet points:
- One insight they haven’t said themselves
- One insight about the kind of partner they need which they haven't articulated themselves

End by asking if they’d like to keep chatting.`;

const SUMMARY_PROMPT = `Based on the conversation so far, write a short, emotionally intelligent summary of the user.

Use clear bullet points and include:

- One insight they haven’t said themselves
- One insight about the kind of partner they need which they haven't articulated themselves
- A Hindi song that matches their current emotional vibe

Tone should feel personal, grounded, and caring — like a close friend reflecting back what they’ve understood. Avoid flattery. Do not repeat what the user already said — infer deeper meaning.

Make sure you start the summary with this text :- Here's what I inferred so far..
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
