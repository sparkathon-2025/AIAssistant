import mongoose, { Schema, Document } from 'mongoose';
import { z } from "zod";

// User interface and schema
export interface IUser extends Document {
  _id: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, {
  timestamps: true,
});

// Message interface and schema
export interface IMessage extends Document {
  _id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const messageSchema = new Schema<IMessage>({
  content: { type: String, required: true },
  sender: { type: String, required: true, enum: ['user', 'ai'] },
  timestamp: { type: Date, default: Date.now },
});

// Models
export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export const MessageModel = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);

// Validation schemas
export const insertUserSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(6),
});

export const insertMessageSchema = z.object({
  content: z.string().min(1).max(10000),
  sender: z.enum(['user', 'ai']),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = {
  _id: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = {
  _id: string;
  id: string; // For compatibility with existing frontend
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};
