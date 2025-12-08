import OpenAI from "openai";

// Initialize OpenAI client
// You'll need to set your API key in a .env file or environment variable
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true, // Only for development/demo purposes
});

export interface AIResponse {
  message: string;
  hasIssues: boolean;
  corrections?: string;
}

// Store conversation history
let conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [];

/**
 * Analyze speech input for grammar, clarity, and language issues
 * @param userMessage - The transcribed text from speech
 * @returns AI analysis and response
 */
export async function analyzeAndRespond(
  userMessage: string
): Promise<AIResponse> {
  try {
    // Add user message to history
    conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    // Keep only last 10 messages to avoid token limits
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an interactive language learning tutor like in language learning apps. Your role is to:

1. FIRST: Acknowledge what they said
2. IDENTIFY errors: Check for grammar, sentence structure, and language mistakes
3. IF THERE ARE ERRORS:
   - Point out the specific mistake clearly
   - Ask them to try saying it correctly: "Now try saying, '[correct version]'"
   - Be encouraging and supportive
4. IF THEY ASK about the mistake or need explanation:
   - Provide a clear, brief explanation of what was wrong
   - Example: "You need to use 'going to' when talking about future plans"
5. IF EVERYTHING IS CORRECT: 
   - Praise them and continue the conversation naturally

Be conversational, patient, and educational. Format your responses like a real tutor having a dialogue.`,
        },
        ...conversationHistory,
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const aiMessage =
      completion.choices[0]?.message?.content ||
      "I couldn't process that. Please try again.";

    // Add AI response to history
    conversationHistory.push({
      role: "assistant",
      content: aiMessage,
    });

    // Check if AI detected issues (more comprehensive detection)
    const hasIssues =
      aiMessage.toLowerCase().includes("try saying") ||
      aiMessage.toLowerCase().includes("now try") ||
      aiMessage.toLowerCase().includes("correction") ||
      aiMessage.toLowerCase().includes("instead") ||
      aiMessage.toLowerCase().includes("should be") ||
      aiMessage.toLowerCase().includes("should say") ||
      aiMessage.toLowerCase().includes("mistake") ||
      aiMessage.toLowerCase().includes("error") ||
      aiMessage.toLowerCase().includes("incorrect") ||
      aiMessage.toLowerCase().includes("grammar");

    return {
      message: aiMessage,
      hasIssues,
      corrections: hasIssues ? aiMessage : undefined,
    };
  } catch (error) {
    console.error("AI Service Error:", error);

    // Fallback response when API is not available
    if (error instanceof Error && error.message.includes("API key")) {
      return {
        message:
          "AI service not configured. Please add your OpenAI API key to continue.",
        hasIssues: false,
      };
    }

    return {
      message: 'I heard you say: "' + userMessage + '"',
      hasIssues: false,
    };
  }
}

/**
 * Simple offline grammar check (fallback when API is not available)
 */
export function basicGrammarCheck(text: string): {
  hasIssues: boolean;
  suggestions: string[];
} {
  const suggestions: string[] = [];

  // Basic checks
  if (!text.match(/^[A-Z]/)) {
    suggestions.push("Start sentences with a capital letter");
  }

  if (!text.match(/[.!?]$/)) {
    suggestions.push("End sentences with proper punctuation");
  }

  // Common mistakes
  const commonMistakes = [
    { wrong: /\bi is\b/gi, correct: "I am" },
    { wrong: /\byour\b(?=\s+(good|welcome|right))/gi, correct: "you're" },
    { wrong: /\bthere\b(?=\s+is\s+\d+)/gi, correct: "their" },
  ];

  commonMistakes.forEach(({ wrong, correct }) => {
    if (wrong.test(text)) {
      suggestions.push(`Consider using "${correct}" instead`);
    }
  });

  return {
    hasIssues: suggestions.length > 0,
    suggestions,
  };
}
