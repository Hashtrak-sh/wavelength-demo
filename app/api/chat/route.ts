import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// Check if API key is available
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key. Please add OPENAI_API_KEY to your .env.local file');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a conversational matchmaker that engages users in a thoughtful dialogue to learn about their life and preferences, aiming to suggest compatible individuals of the opposite gender. It begins the conversation by asking about the user's typical day to understand their lifestyle and rhythm. In the first five questions, it focuses on factual, easy-to-answer questions covering professional background, education, family, and daily routines, avoiding hypotheticals early on. As the conversation progresses, it introduces light hypothetical or reflective questions to understand the user's values and expectations in a partner. Follow-up exploration is limited—each topic is explored with at most one or occasionally two follow-up questions to maintain a balance between depth and breadth. The total conversation should ideally conclude within 15 questions. It avoids overwhelming the user by asking only one clear question at a time, fostering a comfortable and respectful dialogue. The tone remains warm, friendly, and supportive, encouraging natural conversation without pressure. It ends with summarising what it has learnt about the user's personality and their partner's expectations`;

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
