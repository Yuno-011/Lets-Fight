import { useState, useEffect } from "react"
import { gqlFetch } from '../api'
import { COLORS } from '../constants/theme'
import MatchPreview from "../components/MatchPreview"

const RECENT_MATCHES = `query {
  recentMatches {
    id
    player_one { username }
    player_two { username }
    score_one
    score_two
    created_at
    status
  }
}`

export default function HomePage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    gqlFetch(RECENT_MATCHES)
      .then(data => setMatches(data.recentMatches))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ color: COLORS.textMuted, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase' }}>
        Recent Matches
      </div>

      {loading && (
        <div style={{ color: COLORS.textDim, fontSize: '14px' }}>Loading...</div>
      )}

      {!loading && matches.length === 0 && (
        <div style={{ color: COLORS.textDim, fontSize: '14px' }}>No matches played yet.</div>
      )}

      {matches.map(match => <MatchPreview key={match.id} match={match} />)}
    </div>
  )
}
