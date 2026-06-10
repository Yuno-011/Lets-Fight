import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { NAV_ITEMS } from "../constants/nav"
import { COLORS } from "../constants/theme"
import { useAuth } from "../context/AuthContext"
import { gqlFetch } from "../api"
import { useIsMobile } from "../hooks/useIsMobile"

// Sub-components 

function Logo() {
  return (
    <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
      <span style={{ color: COLORS.white }}>LET'</span>
      <span style={{ color: COLORS.pink }}>S</span>
      <br />
      <span style={{ color: COLORS.white }}>FIGHT</span>
      <span style={{ color: COLORS.pink }}>!</span>
    </div>
  )
}

const MY_ACTIVE_MATCH = `query { myActiveMatch { id status } }`
const FIND_MATCH = `mutation { findMatch { id status } }`
const LEAVE_QUEUE = `mutation { leaveQueue }`

function FindMatchButton({ onNavigate }) {
  const [finding, setFinding] = useState(false)
  const [dots, setDots] = useState("")
  const [activeMatchId, setActiveMatchId] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!finding) { setDots(""); return }
    const i = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 500)
    return () => clearInterval(i)
  }, [finding])

  useEffect(() => {
    if (!user) return
    gqlFetch(MY_ACTIVE_MATCH)
      .then(data => { if (data.myActiveMatch) setActiveMatchId(data.myActiveMatch.id) })
      .catch(console.error)
  }, [user])

  useEffect(() => {
    if (!finding) return
    const interval = setInterval(async () => {
      try {
        const data = await gqlFetch(FIND_MATCH)
        if (data.findMatch.status === 'IN_PROGRESS' && data.findMatch.id !== '-1') {
          setFinding(false)
          setActiveMatchId(data.findMatch.id)
          clearInterval(interval)
          onNavigate(`/match/${data.findMatch.id}`)
        }
      } catch (e) { console.error(e) }
    }, 2000)
    return () => clearInterval(interval)
  }, [finding])

  useEffect(() => {
    return () => { if (finding) gqlFetch(LEAVE_QUEUE).catch(console.error) }
  }, [finding])

  function handleClick() {
    if (activeMatchId) { onNavigate(`/match/${activeMatchId}`); return }
    if (!user) { onNavigate('/auth'); return }
    if (finding) { gqlFetch(LEAVE_QUEUE).catch(console.error); setFinding(false); return }
    setFinding(true)
  }

  return (
    <button
      onClick={handleClick}
      style={{
        width: "100%", padding: "12px",
        background: (finding || activeMatchId) ? COLORS.pinkDim : COLORS.pink,
        border: (finding || activeMatchId) ? `1px solid rgba(255,60,157,0.5)` : "none",
        borderRadius: "12px", color: "white", fontWeight: 700,
        fontSize: "14px", cursor: "pointer", letterSpacing: "0.5px",
        boxShadow: (finding || activeMatchId) ? "none" : `0 4px 20px ${COLORS.pinkGlow}`,
        transition: "all 0.3s",
      }}
    >
      {activeMatchId ? "Active Match" : finding ? `Finding match${dots}` : "Find Match"}
    </button>
  )
}

function NavLinks({ activePage, onNavigate, connected }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const active = activePage === `/${id}`
        return (
          <button
            key={id}
            onClick={() => onNavigate(`/${id}`)}
            style={{
              width: "100%", alignItems: "center", gap: "12px",
              padding: "11px 14px", borderRadius: "10px", border: "none", cursor: "pointer",
              background: active ? "rgba(0,212,255,0.12)" : "transparent",
              color: active ? COLORS.cyan : COLORS.textMuted,
              fontWeight: active ? 700 : 400, fontSize: "14px",
              transition: "all 0.15s", textAlign: "left",
              borderLeft: active ? `2px solid ${COLORS.cyan}` : "2px solid transparent",
              display: (id !== 'profile' || connected) ? 'flex' : 'none'
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
    <button
      onClick={() => onNavigate('/auth')}
      style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        padding: "11px", borderRadius: "10px",
        background: COLORS.cyan, border: `1px solid ${COLORS.cyanBorder}`,
        color: COLORS.white, fontSize: "13px", fontWeight: 600, cursor: "pointer",
      }}
    >
      <span style={{ fontSize: "16px" }}>➜]</span> Sign in
    </button>
  )
}

// Desktop sidebar
function DesktopNav({ activePage, navigate, user }) {
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
      <div style={{ padding: "0 24px 28px", borderBottom: `1px solid ${COLORS.borderFaint}` }}>
        <Logo />
      </div>
      <div style={{ padding: "16px 16px 16px", borderBottom: `1px solid ${COLORS.borderFaint}` }}>
        <FindMatchButton onNavigate={navigate} />
      </div>
      <div style={{ padding: "12px 12px 0", flex: 1 }}>
        <NavLinks activePage={activePage} onNavigate={navigate} connected={user !== null} />
      </div>
      {!user && <div style={{ padding: "16px" }}><SignIn onNavigate={navigate} /></div>}
    </nav>
  )
}

// Mobile top bar + dropdown
function MobileNav({ activePage, navigate, user }) {
  const [open, setOpen] = useState(false)

  function handleNavigate(path) {
    setOpen(false)
    navigate(path)
  }

  return (
    <>
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: COLORS.navy,
        borderBottom: `1px solid ${COLORS.cyanBorder}`,
        backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}>
        <Logo />
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            background: "transparent", border: "none",
            cursor: "pointer", color: COLORS.white,
            fontSize: "22px", padding: "4px",
          }}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div style={{
          position: "fixed", top: "75px", left: 0, right: 0, zIndex: 99,
          background: COLORS.navy,
          borderBottom: `1px solid ${COLORS.cyanBorder}`,
          backdropFilter: "blur(20px)",
          padding: "12px 16px 20px",
          display: "flex", flexDirection: "column", gap: "8px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
        }}>
          <NavLinks activePage={activePage} onNavigate={handleNavigate} connected={user !== null} />
          {!user && <SignIn onNavigate={handleNavigate} />}
        </div>
      )}

      <div style={{ height: "75px", flexShrink: 0 }} />
    </>
  )
}

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isMobile = useIsMobile()

  const activePage = location.pathname

  if (isMobile) return <MobileNav activePage={activePage} navigate={navigate} user={user} />
  return <DesktopNav activePage={activePage} navigate={navigate} user={user} />
}