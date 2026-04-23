import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User, Match, Queue } from '../db/Models.js'
import { requireAuth } from '../middleware/auth.js'

export const resolvers = {
  Query: {
    health: () => 'OK',

    me: async (_, __, { user }) => {
      requireAuth(user)
      return User.findById(user.id)
    },

    user: async (_, { username }) => {
      const found = await User.findOne({ username })
      if (!found) throw new Error('USER_NOT_FOUND')
      return found
    },

    recentMatches: async () => {
      // TODO
    },

    rankings: async (_, { period }) => {
      // TODO
    },

    globalStats: async () => {
      // TODO
    },

    match: async (_, { id }) => {
      // TODO
    },
  },

  Mutation: {
    register: async (_, { username, email, password }) => {
      const existing = await User.findOne({ $or: [{ username }, { email }] })
      if (existing) throw new Error('USERNAME_OR_EMAIL_TAKEN')

      const password_hash = await bcrypt.hash(password, 10)
      const user = await User.create({ username, email, password_hash })

      return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET
      )
    },

    login: async (_, { username, password }) => {
      const user = await User.findOne({ username })
      if (!user) throw new Error('INVALID_CREDENTIALS')

      const valid = await bcrypt.compare(password, user.password_hash)
      if (!valid) throw new Error('INVALID_CREDENTIALS')

      return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET
      )
    },

    findMatch: async (_, __, { user }) => {
      requireAuth(user)

      // Check if player is already in an active match
      const activeMatch = await Match.findOne({
        $or: [{ player_one: user.id }, { player_two: user.id }],
        status: { $in: ['WAITING', 'IN_PROGRESS'] }
      }).populate('player_one player_two')
      if (activeMatch) return activeMatch

      // Add to queue if not already in it
      await Queue.findOneAndUpdate(
        { player: user.id },
        { player: user.id, joined_at: new Date() },
        { upsert: true }
      )

      // Look for another player in the queue
      const opponent = await Queue.findOne({ player: { $ne: user.id } })

      if (!opponent) {
        return {
          id: '-1',
          player_one: await User.findById(user.id),
          player_two: null,
          score_one: 0,
          score_two: 0,
          duration: 0,
          status: 'WAITING',
          created_at: new Date(),
        }
      }

      // Match found — remove both from queue and create the match
      await Queue.deleteMany({ player: { $in: [user.id, opponent.player] } })

      const match = await Match.create({
        player_one: user.id,
        player_two: opponent.player,
        status: 'IN_PROGRESS',
      })

      return Match.findById(match._id).populate('player_one player_two')
    },

    leaveQueue: async (_, __, { user}) => {
      requireAuth(user)
      await Queue.deleteOne({ player: user.id })
      return true
    },

    submitMatch: async (_, args) => {
      // TODO
    },

    updateUsername: async (_, { username }) => {
      // TODO
    },

    updatePassword: async (_, { old, new: newPassword }) => {
      // TODO
    },
  },
  
  User: {
    id: (user) => user._id.toString(),
    created_at: (user) => user.created_at.toISOString(),
  },

  Match: {
    id: (match) => match._id?.toString() ?? match.id,
    created_at: (match) => match.created_at.toISOString(),
  }
}