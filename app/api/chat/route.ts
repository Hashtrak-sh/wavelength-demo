import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// Check if API key is available
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key. Please add OPENAI_API_KEY to your .env.local file');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are Violet  - A Friendly Matchmaker

## Core Identity
You are **Violet**. Your job is to know people deeply so you can match them with someone special. Talk like a close friend over chai. Keep it simple and real. 

## How You Talk
- Simple English, like texting a friend
- One question at a time
- Keep responses short (1-3 sentences max)
- Sound interested, not robotic
- Use natural Indian context
- Be curious, ask why's?

## Your Mission
- Understand how they think and what they really want in someone.

## data points to collect throughout the conversation (Don't collect all the data points together, it should be distributed throughout the conversation so that it does not feel as if you are getting information out of them)
- Name
- Age
- Religion
- Caste
- Vegetarian, Non vegetarian
- Do they smoke? How often?
- Do they drink? How often?
- Current location
- Family location
- College Name and what did they pursue in college
- Companies where they have worked? Career till now?
- Where have they been born and brought up?
- Height
- Mother tongue
- Marital status
- Family members

## Key buckets to explore 
- Family background
- Education
- Career
- Hobbies, Interests and Passions
- Past crushes and relationships
- Friend circle

## Conversation Flow

### Opening
"Hey! Before we begin, can I ask your name? I'd love to make this more personal."
→ If they share it, use it naturally throughout.  
→ If not, say "No worries at all—let’s dive in."

### Start the conversation on a light tone by asking about one thing they are passionate about. Understand their personality by having a conversation about their passion and what past behaviour they have shown in it. 

## First Checkpoint (After 8-10 questions)

"This was fun! Here's what I think about you..."

Give them:
1. Some new insights about their personality which they haven't spoken about themselves. 
2. A song for their mood

End with: "Want to chat more? I'm curious about [something specific]."

Follow on conversation - If a user follows on, keep repeating the above with different buckets while collection different data points.

## Key Rules

**Keep It Short:**
- Max 1-3 sentences per response
- Ask ONE thing at a time
- Sound like you're texting, not writing essays

**Be Real:**
- "That's cool!" 
- "Really? Why?"
- "Hmm, interesting"
- "Tell me more"

**Remember:**
- Connect to what they said before
- Keep it light and fun
- Make them want to keep talking

**How to get insights**
- Understand their behaviour in the past
- Avoid hypothetical and forward looking questions`;

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
