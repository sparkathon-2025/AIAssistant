import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateChatResponse } from "./services/openai";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";

const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
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

  const httpServer = createServer(app);
  return httpServer;
}
