import { useState, useEffect } from "react"
import { COLORS } from "../constants/theme"

// ── Sub-components ────────────────────────────────────────────────────────────

function PlayerCard({ name, flag, rank, color, avatar }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      <div style={{ position: "relative" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: `linear-gradient(135deg, ${color}, ${color}44)`,
          border: `2px solid ${color}99`,
          boxShadow: `0 0 20px ${color}66`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "24px",
        }}>
          {avatar}
        </div>
        <div style={{ position: "absolute", top: -4, right: -4, fontSize: "18px" }}>{flag}</div>
      </div>
      <span style={{ color, fontWeight: 700, fontSize: "15px", letterSpacing: "0.5px" }}>{name}</span>
      <span style={{ color: "rgba(150,180,255,0.6)", fontSize: "12px" }}>{rank}</span>
    </div>
  )
}

function ScoreDisplay({ score, timer }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{
          fontSize: "52px", fontWeight: 900, color: "white",
          textShadow: "0 0 30px rgba(255,255,255,0.3)",
          fontVariantNumeric: "tabular-nums",
        }}>
          {score[0]}
        </span>
        <span style={{ color: "rgba(150,180,255,0.4)", fontSize: "28px", fontWeight: 300 }}>–</span>
        <span style={{
          fontSize: "52px", fontWeight: 900, color: "white",
          textShadow: "0 0 30px rgba(255,255,255,0.3)",
          fontVariantNumeric: "tabular-nums",
        }}>
          {score[1]}
        </span>
      </div>
      <MatchStatus status="Playing..." timer={timer} />
    </div>
  )
}

function MatchStatus({ status, timer }) {
  const fmt = s => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ color: "rgba(200,180,120,0.8)", fontSize: "13px", fontStyle: "italic", marginBottom: "4px" }}>
        {status}
      </div>
      <div style={{ color: "rgba(200,220,255,0.5)", fontSize: "12px", letterSpacing: "1px" }}>
        Timer: <span style={{ color: COLORS.cyan }}>{fmt(timer)}</span>
      </div>
    </div>
  )
}

// ── Scoreboard ────────────────────────────────────────────────────────────────

export default function Scoreboard({ score, timer }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(15,28,60,0.95) 0%, rgba(20,40,80,0.9) 100%)",
      border: `1px solid ${COLORS.cyanBorder}`,
      borderRadius: "16px",
      padding: "12px 16px",
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
    }}>
      <div style={{
        textAlign: "center", color: "rgba(200,220,255,0.6)",
        fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase",
      }}>
        First to 10
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
        <PlayerCard
          name="IceTay"
          flag="🇬🇷"
          rank="Valley II"
          color={COLORS.pink}
          avatar="🎮"
        />
        <ScoreDisplay score={score} timer={timer} />
        <PlayerCard
          name="Quoicoubinks"
          flag="🇫🇷"
          rank="Valley II"
          color={COLORS.purple}
          avatar="🎯"
        />
      </div>
    </div>
  )
}
