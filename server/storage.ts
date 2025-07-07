import { MessageModel, type Message, type InsertMessage } from "@shared/schema";
import { connectToDatabase } from "./db";

export interface IStorage {
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async getMessages(): Promise<Message[]> {
    await connectToDatabase();
    
    const messages = await MessageModel.find()
      .sort({ timestamp: 1 })
      .lean();
    
    return messages.map(msg => ({
      _id: (msg._id as any).toString(),
      id: (msg._id as any).toString(), // For frontend compatibility
      content: msg.content,
      sender: msg.sender as 'user' | 'ai',
      timestamp: msg.timestamp,
    }));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    await connectToDatabase();
    
    const message = new MessageModel({
      content: insertMessage.content,
      sender: insertMessage.sender,
      timestamp: new Date(),
    });
    
    const savedMessage = await message.save();
    
    return {
      _id: savedMessage._id.toString(),
      id: savedMessage._id.toString(), // For frontend compatibility
      content: savedMessage.content,
      sender: savedMessage.sender,
      timestamp: savedMessage.timestamp,
    };
  }
}

export class MemStorage implements IStorage {
  private messages: Map<number, Message>;
  private currentId: number;

  constructor() {
    this.messages = new Map();
    this.currentId = 1;
  }

  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentId++;
    const message: Message = { 
      ...insertMessage, 
      _id: id.toString(),
      id: id.toString(),
      timestamp: new Date()
    };
    this.messages.set(id, message);
    return message;
  }
}

// Use MemStorage for now to avoid connection issues
export const storage = new MemStorage();
