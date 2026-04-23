import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export async function connectDB() {
  await mongoose.connect(process.env.DATABASE_URL)
  console.log('MongoDB connected')
}