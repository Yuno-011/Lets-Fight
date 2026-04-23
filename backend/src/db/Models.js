import mongoose from 'mongoose'

// User model
const userSchema = new mongoose.Schema({
  username:      { type: String, required: true, unique: true, trim: true },
  email:         { type: String, required: true, unique: true, trim: true },
  password_hash: { type: String, required: true },
  created_at:    { type: Date, default: Date.now },
})

export const User = mongoose.model('User', userSchema)

// Match model
const matchSchema = new mongoose.Schema({
  player_one:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  player_two:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score_one:   { type: Number, default: 0 },
  score_two:   { type: Number, default: 0 },
  duration:    { type: Number, default: 0 },
  status:      { type: String, enum: ['WAITING', 'IN_PROGRESS', 'FINISHED'], default: 'WAITING' },
  created_at:  { type: Date, default: Date.now },
})

export const Match = mongoose.model('Match', matchSchema)

// Queue model
const queueSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  joined_at: { type: Date, default: Date.now }
})

export const Queue = mongoose.model('Queue', queueSchema)