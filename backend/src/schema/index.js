import { makeExecutableSchema } from '@graphql-tools/schema'
import { resolvers } from './resolvers.js'

const typeDefs = `
  type User {
    id: ID!
    username: String!
    email: String!
    created_at: String!
  }

  type Match {
    id: ID!
    player_one: User!
    player_two: User!
    score_one: Int!
    score_two: Int!
    status: MatchStatus!
    created_at: String!
  }

  enum MatchStatus {
    WAITING
    IN_PROGRESS
    FINISHED
  }

  type UserStats {
    wins: Int!
    losses: Int!
    win_rate: Float!
    total_matches: Int!
  }

  type GlobalStats {
    best_grinder: User!
    best_growth: User!
    total_matches: Int!
    total_players: Int!
  }

  enum Period {
    ALL_TIME
    MONTHLY
  }

  type Query {
    health: String
    me: User
    user(username: String!): User
    recentMatches: [Match!]!
    rankings(period: Period!): [User!]!
    globalStats: GlobalStats!
    match(id: ID!): Match
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): String!
    login(username: String!, password: String!): String!
    findMatch: Match!
    leaveQueue: Boolean!
    submitMatch(id: ID!, scoreOne: Int!, scoreTwo: Int!): Match!
    updateUsername(username: String!): User!
    updatePassword(old: String!, new: String!): Boolean!
  }
`

export const schema = makeExecutableSchema({ typeDefs, resolvers })