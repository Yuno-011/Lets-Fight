import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User, Match, Queue } from '../db/Models.js'
import { requireAuth } from '../middleware/auth.js'

function calculateElo(winnerElo, loserElo) {
  const K = 32
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400))
  const expectedLoser = 1 - expectedWinner

  return {
    winnerDelta: Math.round(K * (1 - expectedWinner)),
    loserDelta: Math.round(K * (0 - expectedLoser))
  }
}

async function getUserStats(userId) {
  const wins = await Match.countDocuments({
    $or: [
      { player_one: userId, $expr: { $gt: ['$score_one', '$score_two'] } },
      { player_two: userId, $expr: { $gt: ['$score_two', '$score_one'] } }
    ],
    status: 'FINISHED'
  })
  const losses = await Match.countDocuments({
    $or: [
      { player_one: userId, $expr: { $lt: ['$score_one', '$score_two'] } },
      { player_two: userId, $expr: { $lt: ['$score_two', '$score_one'] } }
    ],
    status: 'FINISHED'
  })
  const totalMatches = wins + losses
  const winRate = totalMatches === 0 ? 0 : Math.round((wins / totalMatches) * 100)
  return { wins, losses, winRate, totalMatches }
}

async function getLastMatches(userId) {
  const matches = await Match.find({
    $or: [{ player_one: userId }, { player_two: userId }],
    status: 'FINISHED'
  }).sort({ created_at: -1 }).limit(5)

  return matches.map(m => {
    const isP1 = m.player_one.toString() === userId.toString()
    const myScore = isP1 ? m.score_one : m.score_two
    const theirScore = isP1 ? m.score_two : m.score_one
    return myScore > theirScore ? 'WIN' : 'LOSS'
  })
}

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
      return Match.find()
        .populate('player_one player_two')
        .sort({ created_at: -1 })
        .limit(20)
    },

    ranking: async () => {
      const users = await User.find().sort({ elo: -1 }).limit(100)
      return Promise.all(users.map(async (user, index) => {
        const stats = await getUserStats(user._id)
        const lastMatches = await getLastMatches(user._id)
        return {
          rank: index + 1,
          username: user.username,
          elo: user.elo,
          stats: { ...stats, lastMatches }
        }
      }))
    },

    globalStats: async () => {
      // TODO
    },

    match: async (_, { id }, { user }) => {
      requireAuth(user)
      const match = await Match.findById(id).populate('player_one player_two')
      if (!match) throw new Error('MATCH_NOT_FOUND')
      if (match.player_one._id.toString() !== user.id && match.player_two._id.toString() !== user.id)
        throw new Error('NOT_AUTHORIZED')
      return match
    },

    myActiveMatch: async (_, __, { user }) => {
      if (!user) return null
      return Match.findOne({
        $or: [{ player_one: user.id }, { player_two: user.id }],
        status: 'IN_PROGRESS'
      }).populate('player_one player_two')
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
        { $setOnInsert: {
          player: user.id,
          joined_at: new Date()
        } },
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
          status: 'WAITING',
          created_at: new Date(),
          ended_at: null,
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

    updateMatch: async (_, { id, scoreOne, scoreTwo }, { user }) => {
      requireAuth(user)
      const dbMatch = await Match.findById(id).populate('player_one player_two')
      if (dbMatch.player_one._id.toString() !== user.id && dbMatch.player_two._id.toString() !== user.id)
        throw new Error('NOT_AUTHORIZED')
      const match = await Match.findByIdAndUpdate(
        id,
        { score_one: scoreOne, score_two: scoreTwo },
        { returnDocument: 'after' }
      ).populate('player_one player_two')
      if (!match) throw new Error('MATCH_NOT_FOUND')
      return match
    },

    submitMatch: async (_, { id, scoreOne, scoreTwo }, { user }) => {
      requireAuth(user)
      const dbMatch = await Match.findById(id).populate('player_one player_two')
      if (dbMatch.player_one._id.toString() !== user.id && dbMatch.player_two._id.toString() !== user.id)
        throw new Error('NOT_AUTHORIZED')
      const match = await Match.findByIdAndUpdate(
        id,
        { score_one: scoreOne, score_two: scoreTwo, status: 'FINISHED', ended_at: new Date() },
        { new: true }
      ).populate('player_one player_two')
      if (!match) throw new Error('MATCH_NOT_FOUND')
      
      // update elo
      const winner = scoreOne > scoreTwo ? match.player_one : match.player_two
      const loser = scoreOne > scoreTwo ? match.player_two : match.player_one
      const { winnerDelta, loserDelta } = calculateElo(winner.elo, loser.elo)
      await User.findByIdAndUpdate(winner._id, { $inc: { elo: winnerDelta } })
      await User.findByIdAndUpdate(loser._id, { $inc: { elo: loserDelta } })

      return match
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
    ended_at: (match) => match.ended_at?.toISOString() ?? null,
  },

  UserStats: {
    win_rate: (stats) => stats.winRate ?? 0,
    last_matches: (stats) => stats.lastMatches ?? []
  }
}