import mongoose from 'mongoose';

// Check if DATABASE_URL is a PostgreSQL URL and ignore it for MongoDB
const isPostgresUrl = process.env.DATABASE_URL?.includes('postgres');
const MONGODB_URI = process.env.MONGODB_URI || (!isPostgresUrl ? process.env.DATABASE_URL : null) || 'mongodb://localhost:27017/ai-chatbot';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Global is used here to maintain a cached connection across hot reloads in development
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}