export default function PlaceholderPage({ page }) {
  const config = {
    about:    { icon: "ℹ️", label: "About"      },
    profile:  { icon: "⚙️", label: "Profile"    },
    auth:     { icon: "⚙️", label: "Log in / Sign in" },
    rankings: { icon: "🏅", label: "Rankings"   },
    stats:    { icon: "📊", label: "Statistics" },
  }

  const { icon, label } = config[page] ?? { icon: "🚧", label: page }

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "60vh", flexDirection: "column", gap: "12px",
    }}>
      <div style={{ fontSize: "48px", opacity: 0.3 }}>{icon}</div>
      <div style={{
        color: "rgba(150,180,255,0.4)", fontSize: "16px",
        letterSpacing: "2px", textTransform: "uppercase",
      }}>
        {label} — coming soon
      </div>
    </div>
  )
}
