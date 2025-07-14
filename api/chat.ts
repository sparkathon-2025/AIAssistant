import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from "zod";
import OpenAI from "openai";
import mongoose from 'mongoose';

const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb+srv://admin:password@cluster.mongodb.net/ai-chatbot';

let cachedConnection: typeof mongoose | null = null;

async function connectToDatabase() {
  if (cachedConnection) {
    console.log('✅ Using existing MongoDB connection in API');
    return cachedConnection;
  }

  try {
    console.log('🔄 Establishing MongoDB connection in API...');
    console.log('📊 MongoDB URI available:', MONGODB_URI ? 'Yes' : 'No');
    cachedConnection = await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connection established successfully in API');
    return cachedConnection;
  } catch (error) {
    console.error('❌ Database connection error in API:', error);
    throw error;
  }
}

// Message Schema
const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  sender: { type: String, enum: ['user', 'ai'], required: true },
  timestamp: { type: Date, default: Date.now }
});

const MessageModel = mongoose.models.Message || mongoose.model('Message', messageSchema);

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key"
});

async function generateChatResponse(userMessage: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Provide clear, concise, and helpful responses to user questions."
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response at this time.";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    
    if (error?.code === 'insufficient_quota' || error?.status === 429) {
      return "⚠️ OpenAI API quota exceeded. Please add credits to your OpenAI account.";
    }
    
    throw new Error("Failed to generate AI response. Please check your API configuration.");
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      await connectToDatabase();
      const messages = await MessageModel.find().sort({ timestamp: 1 }).lean();
      
      const formattedMessages = messages.map((msg: any) => ({
        _id: (msg._id as any).toString(),
        id: (msg._id as any).toString(),
        content: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp,
      }));
      
      res.json(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const { message } = chatRequestSchema.parse(req.body);

      await connectToDatabase();

      // Save user message
      const userMessage = new MessageModel({
        content: message,
        sender: "user",
      });
      await userMessage.save();

      // Generate AI response
      const aiResponseContent = await generateChatResponse(message);

      // Save AI message
      const aiMessage = new MessageModel({
        content: aiResponseContent,
        sender: "ai",
      });
      await aiMessage.save();

      res.json({
        userMessage: {
          _id: userMessage._id.toString(),
          id: userMessage._id.toString(),
          content: userMessage.content,
          sender: userMessage.sender,
          timestamp: userMessage.timestamp,
        },
        aiMessage: {
          _id: aiMessage._id.toString(),
          id: aiMessage._id.toString(),
          content: aiMessage.content,
          sender: aiMessage.sender,
          timestamp: aiMessage.timestamp,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid request format",
          errors: error.errors 
        });
        return;
      }
      
      console.error("Error in chat endpoint:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to process chat message"
      });
    }
    return;
  }

  res.status(405).json({ message: 'Method not allowed' });
}
