import mongoose from 'mongoose';
import "dotenv/config"

// Check if DATABASE_URL is a PostgreSQL URL and ignore it for MongoDB
const isPostgresUrl = process.env.DATABASE_URL?.includes('postgres');
const MONGODB_URI = process.env.MONGODB_URI || 
                   process.env.DATABASE_URL || 
                   'mongodb+srv://admin:password@cluster.mongodb.net/ai-chatbot';

console.log('📊 MongoDB Configuration:');
console.log('- MONGODB_URI env var:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
console.log('- DATABASE_URL env var:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('- Using PostgreSQL URL?:', isPostgresUrl ? 'Yes (will be ignored)' : 'No');
console.log('- Final MongoDB URI:', MONGODB_URI ? '✅ Available' : '❌ Missing');

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
    console.log('✅ Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔄 Establishing new MongoDB connection...');
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connection established successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ MongoDB connection ready');
  } catch (e) {
    console.error('❌ MongoDB connection failed:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}