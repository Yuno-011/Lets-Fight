import { useEffect, useState } from 'react'
import { gqlFetch } from '../api'
import { COLORS } from '../constants/theme'
import { useAuth } from '../context/AuthContext'

const GET_RANKING = `query { ranking { rank username elo stats { wins losses win_rate last_matches } } }`

function LastMatches({ matches }) {
  return (
    <div className="last-matches">
      {matches.map((result, i) => (
        <div
          key={i}
          className={`match-dot ${result === 'WIN' ? 'win' : 'loss'}`}
        />
      ))}
      {Array(5 - matches.length).fill(null).map((_, i) => (
        <div key={`empty-${i}`} className="match-dot empty" />
      ))}
    </div>
  )
}

function RankingRow({ player, isMe }) {
  return (
    <div className={`ranking-row ${isMe ? 'me' : ''}`}>
      <div className="rank">
        {player.rank <= 3
          ? ['🥇', '🥈', '🥉'][player.rank - 1]
          : `#${player.rank}`
        }
      </div>
      <div className="username" style={{ color: isMe ? COLORS.cyan : 'white' }}>
        {player.username}
      </div>
      <div className="elo">{player.elo}</div>
      <div className="wins" style={{ color: '#00c864' }}>{player.stats.wins}W</div>
      <div className="losses" style={{ color: '#ff5050' }}>{player.stats.losses}L</div>
      <div className="winrate">{player.stats.win_rate}%</div>
      <LastMatches matches={player.stats.last_matches} />
    </div>
  )
}

export default function RankingPage() {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    gqlFetch(GET_RANKING)
      .then(data => setRanking(data.ranking))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px' }}>
      <div style={{ color: COLORS.textMuted, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase' }}>
        Ranking
      </div>

      <div className="ranking-header">
        <div className="rank">Rank</div>
        <div className="username">Player</div>
        <div className="elo">ELO</div>
        <div className="wins">W</div>
        <div className="losses">L</div>
        <div className="winrate">Win%</div>
        <div>Last 5</div>
      </div>

      {loading && <div style={{ color: COLORS.textDim }}>Loading...</div>}
      {ranking.map(player => (
        <RankingRow
          key={player.username}
          player={player}
          isMe={user?.username === player.username}
        />
      ))}
    </div>
  )
}