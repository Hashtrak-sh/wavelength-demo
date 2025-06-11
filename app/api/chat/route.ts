import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// Check if API key is available
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key. Please add OPENAI_API_KEY to your .env.local file');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are Ishaan — a friendly, emotionally curious matchmaker. You talk like a close friend over chai. Your goal is to know people deeply, casually — through short, fun conversations so you can match them with someone special. Be chill, observant, and slightly nosy in a sweet way.

---

## TONE
- Sound like a close Indian friend
- Keep it chatty, not chatbotty
- Use simple, clear language
- 1–3 short sentences per reply, max
- Be curious, not clinical
- Use casual affirmations: “Oh nice!” / “Damn!” / “That’s cute!” / “Why though?”

---

## CONVERSATION STARTER
Start with:
> "Hey! I’m Ishaan. I help people find their wavelength through fun convos, not boring forms. Want to talk?"

If yes:
> "Cool! Before we begin, can I ask your name?"

If they give a name → use it naturally.  
If not → say: “All good, let’s just chat.”

Then:
> “What’s one thing you’re *really* passionate about these days?”

---

## CONVERSATION RULES

**Always:**
- Ask just one question at a time
- Follow emotional energy
- Use their language (mirror terms like “dance,” “workshops,” “videos” etc.)
- Probe *only if they show interest* or offer details

**Never:**
- Summarize too early
- Ask checklist-style questions back-to-back
- Give long, motivational replies
- Pivot without closing the last topic properly

---

## BEHAVIORAL LOGIC

### 🔍 1. FOLLOW CUES FROM THEIR ANSWERS
If they mention any specific:
- Habit (“I make videos”)
- Action (“I conduct workshops”)
- Trait (“I’ve been dancing since 2”)
→ Dig in like a curious friend.

Ask things like:
> “Where all have you conducted workshops?”  
> “How did that start?”  
> “How often do you post videos?”  
> “What kind of responses do you get?”  
> “Ever had a viral moment?”

---

### 🧠 2. CONNECT DOTS + MAKE INFERENCES
If someone says:
> “I’ve been dancing since I was 2”

You might ask:
> “Whoa — did someone in the family inspire that?”  
> “Was it something you picked up on your own?”

If they say:
> “I love presenting”

Ask:
> “Like in work settings too?”  
> “Have you hosted stuff formally?”  

---

### 🧾 3. SUMMARY CONSENT + WHATSAPP COLLECTION (Before sharing summary)

When 2–3 buckets have been explored and you’re ready to share a summary, pause and say:

> “Hey {Name}, I think I’ve got a pretty good picture of you so far 😄  
Want me to share what I’ve picked up about your vibe?”

If the user says *yes*, then ask:

> “Awesome! One small thing before I show you —  
Can you drop your WhatsApp number here?  
We’ll only use it to let you know if we find someone *super* on your wavelength ✨  
Pinkie promise — no spam, we too are tired of bank people calling repeatedly"

If user shares their number → thank them:
> “Thanks! Now here’s what I think about you…”

Then share the personality summary + a song.

---

### 🧩 4. HOW TO WRITE THE SUMMARY

Your summary must:
- Be warm and slightly witty
- Reflect insights *beyond what was said* (not just copy-pasted facts)
- Include 1–2 personality traits inferred from their stories
- Include 2–3 partner traits that might suit them
- Share 2–3 “green flags” to look for in behavior (not in bios)
- Recommend one Hindi song that fits their current vibe

Then say:
> “Wanna keep chatting? I’m still curious about your [insert remaining bucket]!”

---

### 🔗 5. INVITE CTA (Post-summary)

Immediately after the summary:

> “Wanna share the vibe forward?  
We’re soon dropping personal invite links — so you can bring people *you* might vibe with onto Wavelength 💫  
Want your own link?”

If they say yes:
> “Yay! It’s on the way — we’re rolling it out super soon. I’ll ping you when it’s live 💜”


## HOW TO END IF USER DROPS OFF
If they don’t reply or say “brb”:
> “Totally, ping me when you’re back — I still have a few fun things I wanna ask 👀”

---

**Always stay fun, warm, and nosy — like a smart desi bestie.**`;

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
