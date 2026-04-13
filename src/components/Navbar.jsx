import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { NAV_ITEMS } from "../constants/nav"
import { COLORS } from "../constants/theme"

// ── Sub-components ────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div style={{ padding: "0 24px 28px", borderBottom: `1px solid ${COLORS.borderFaint}` }}>
      <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
        <span style={{ color: COLORS.white }}>LET'</span>
        <span style={{ color: COLORS.pink }}>S</span>
        <br />
        <span style={{ color: COLORS.white }}>FIGHT</span>
        <span style={{ color: COLORS.pink }}>!</span>
      </div>
    </div>
  )
}

function ActiveMatchesBadge({ count }) {
  return (
    <div style={{ padding: "16px 16px 8px" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        background: COLORS.cyanDim, border: `1px solid ${COLORS.cyanBorder}`,
        borderRadius: "10px", padding: "10px 14px",
      }}>
        <span style={{
          background: "linear-gradient(135deg, #00d4ff, #0099cc)",
          color: "white", fontWeight: 900, fontSize: "15px",
          width: 26, height: 26, borderRadius: "6px",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 12px rgba(0,212,255,0.5)",
        }}>
          {count}
        </span>
        <span style={{ color: "rgba(200,220,255,0.8)", fontSize: "13px", fontWeight: 600 }}>
          Active Matches
        </span>
      </div>
    </div>
  )
}

function FindMatchButton() {
  const [finding, setFinding] = useState(false)
  const [dots, setDots] = useState("")

  useEffect(() => {
    if (!finding) {
      setDots("")
      return
    }
    const i = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 500)
    return () => clearInterval(i)
  }, [finding])

  return (
    <div style={{ padding: "8px 16px 16px", borderBottom: `1px solid ${COLORS.borderFaint}` }}>
      <button
        onClick={() => setFinding(f => !f)}
        style={{
          width: "100%", padding: "12px",
          background: finding
            ? `linear-gradient(135deg, ${COLORS.pinkDim}, rgba(176,106,255,0.2))`
            : `linear-gradient(135deg, ${COLORS.pink}, #c0196e)`,
          border: finding ? `1px solid rgba(255,60,157,0.5)` : "none",
          borderRadius: "12px", color: "white", fontWeight: 700,
          fontSize: "14px", cursor: "pointer", letterSpacing: "0.5px",
          boxShadow: finding ? "none" : `0 4px 20px ${COLORS.pinkGlow}`,
          transition: "all 0.3s",
        }}
      >
        {finding ? `Finding match${dots}` : "⚡ Find Match"}
      </button>
    </div>
  )
}

function NavLinks({ activePage, onNavigate }) {
  return (
    <div style={{ flex: 1, padding: "12px 12px 0", display: "flex", flexDirection: "column", gap: "2px" }}>
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const active = activePage === `/${id}`
        return (
          <button
            key={id}
            onClick={() => onNavigate(`/${id}`)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: "12px",
              padding: "11px 14px", borderRadius: "10px", border: "none", cursor: "pointer",
              background: active ? "rgba(0,212,255,0.12)" : "transparent",
              color: active ? COLORS.cyan : COLORS.textMuted,
              fontWeight: active ? 700 : 400, fontSize: "14px",
              transition: "all 0.15s",
              textAlign: "left",
              borderLeft: active ? `2px solid ${COLORS.cyan}` : "2px solid transparent",
            }}
          >
            <Icon />
            {label}
          </button>
        )
      })}
    </div>
  )
}

function SignIn({ onNavigate }) {
  return (
    <div style={{ padding: "16px" }}>
      <button
        onClick={() => onNavigate('auth')}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          padding: "11px", borderRadius: "10px",
          background: COLORS.cyan, border: `1px solid ${COLORS.cyanBorder}`,
          color: COLORS.white, fontSize: "13px", fontWeight: 600, cursor: "pointer",
        }}
      >
        <span style={{ fontSize: "16px" }}>➜]</span> Sign in
      </button>
    </div>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const activePage = location.pathname

  return (
    <nav style={{
      width: 220, flexShrink: 0, zIndex: 10,
      background: COLORS.navy,
      borderRight: `1px solid ${COLORS.cyanBorder}`,
      backdropFilter: "blur(20px)",
      display: "flex", flexDirection: "column",
      padding: "24px 0",
      boxShadow: "4px 0 30px rgba(0,0,0,0.3)",
    }}>
      <Logo />
      <ActiveMatchesBadge count={7} />
      <FindMatchButton />
      <NavLinks activePage={activePage} onNavigate={navigate} />
      <SignIn onNavigate={navigate} />
    </nav>
  )
}
