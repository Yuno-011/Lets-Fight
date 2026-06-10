import { useEffect, useState } from 'react'
import { gqlFetch } from '../api'
import { useAuth } from '../context/AuthContext'
import EloChart from '../components/EloChart'

const GET_STATS = `query { globalStats { total_players total_matches total_kos best_grinder { username matches kos elo } elo_distribution { min max players } } }`

const METRICS = (s, avg) => [
  { label: "Matches", value: s.total_matches.toLocaleString(), color: "#00d4ff" },
  { label: "Players", value: s.total_players.toLocaleString(), color: "#ff2d78" },
  { label: "Total KOs", value: s.total_kos.toLocaleString(), color: "#a78bfa" },
  { label: "Avg KOs/match", value: avg, color: "#f59e0b" },
]

export default function StatsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    gqlFetch(GET_STATS)
      .then(data => setStats(data.globalStats))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="stats-page">
      <div className="stats-title">Statistics</div>

      {loading && <div className="stats-loading">Loading...</div>}

      {stats && (
        <>
          <div className="metrics-grid">
            {METRICS(
              stats,
              stats.total_matches > 0
                ? (stats.total_kos / stats.total_matches).toFixed(1)
                : "—"
            ).map(({ label, value, color }) => (
              <div key={label} className="metric-card">
                <div className="metric-label">{label}</div>
                <div className="metric-value" style={{ color }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div className="panels-grid">

            {/* Best grinder */}
            <div className="card">
              <div className="card-title">Best grinder</div>

              <div className="grinder-row">
                <div className="grinder-avatar">
                  {stats.best_grinder.username.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <div className="grinder-name">
                    {stats.best_grinder.username}
                  </div>
                  <div className="grinder-sub">
                    Most matches played
                  </div>
                </div>
              </div>

              <div className="grinder-stats">
                {[
                  { label: "Total matches", value: stats.best_grinder.matches.toLocaleString(), color: "#00d4ff" },
                  { label: "Total KOs", value: stats.best_grinder.kos.toLocaleString(), color: "#ff2d78" },
                  {
                    label: "Avg KOs/match",
                    value: stats.best_grinder.matches > 0
                      ? (stats.best_grinder.kos / stats.best_grinder.matches).toFixed(1)
                      : "—",
                    color: "#a78bfa"
                  },
                  { label: "Elo", value: stats.best_grinder.elo.toLocaleString(), color: "#f59e0b" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="stat-row">
                    <span className="stat-label">{label}</span>
                    <span className="stat-value" style={{ color }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ELO chart */}
            <div className="card">
              <div className="card-title">ELO distribution</div>
              <EloChart elo_distribution={stats.elo_distribution} />
            </div>

          </div>
        </>
      )}
    </div>
  )
}