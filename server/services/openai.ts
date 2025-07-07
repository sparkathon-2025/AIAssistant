import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function generateChatResponse(userMessage: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Provide clear, concise, and helpful responses to user questions. Be friendly and conversational while remaining informative."
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response at this time. Please try again.";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    
    // Handle quota exceeded error specifically
    if (error?.code === 'insufficient_quota' || error?.status === 429) {
      return "⚠️ OpenAI API quota exceeded. To use this chatbot, you'll need to:\n\n1. Visit https://platform.openai.com/billing\n2. Add a payment method to your OpenAI account\n3. Purchase credits (starting at $5)\n\nThe API requires payment to access GPT-4o, even with a valid API key. This chatbot interface is fully functional and ready to work once you have an active billing account with OpenAI.";
    }
    
    throw new Error("Failed to generate AI response. Please check your API configuration and try again.");
  }
}
