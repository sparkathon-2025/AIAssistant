import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateChatResponse } from "./services/openai";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import multer from "multer";

const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
});

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a message and get AI response
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = chatRequestSchema.parse(req.body);

      // Save user message
      const userMessage = await storage.createMessage({
        content: message,
        sender: "user",
      });

      // Generate AI response
      const aiResponseContent = await generateChatResponse(message);

      // Save AI message
      const aiMessage = await storage.createMessage({
        content: aiResponseContent,
        sender: "ai",
      });

      res.json({
        userMessage,
        aiMessage,
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
  });

  // AI Call endpoint - handles voice queries
  app.post("/api/ai-call", upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      console.log("Received audio file:", req.file.originalname, "Size:", req.file.size);

      // Convert audio to text using OpenAI Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: new File([req.file.buffer], req.file.originalname || 'audio.wav', {
          type: req.file.mimetype || 'audio/wav',
        }),
        model: "whisper-1",
      });

      console.log("Transcription:", transcription.text);

      // Generate AI response text
      const aiResponse = await generateChatResponse(transcription.text);
      
      console.log("AI Response:", aiResponse);

      // Convert AI response text to speech
      const speechResponse = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: aiResponse,
      });

      // Convert the response to a buffer
      const audioBuffer = Buffer.from(await speechResponse.arrayBuffer());
      
      // Set appropriate headers for audio response
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      });
      
      // Send the audio response
      res.send(audioBuffer);
      
    } catch (error) {
      console.error("Error in AI call endpoint:", error);
      res.status(500).json({ 
        message: "Failed to process voice query",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
