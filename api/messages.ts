import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb+srv://admin:password@cluster.mongodb.net/ai-chatbot';

let cachedConnection: typeof mongoose | null = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    cachedConnection = await mongoose.connect(MONGODB_URI);
    return cachedConnection;
  } catch (error) {
    console.error('Database connection error:', error);
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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

  res.status(405).json({ message: 'Method not allowed' });
}
