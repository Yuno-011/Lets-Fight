import jwt from 'jsonwebtoken'

export function getUser(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}

export function requireAuth(user) {
  if (!user) throw new Error('NOT_AUTHENTICATED')
}