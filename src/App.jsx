import { Routes, Route, Navigate } from "react-router-dom"
import Navbar          from "./Components/Navbar"
import HomePage        from "./pages/HomePage"
import PlaceholderPage from "./pages/PlaceholderPage"
import { FONTS }       from "./constants/theme"

export default function App() {
  return (
    <div style={{
      display: "flex", height: "100vh", width: "100vw",
      background: "linear-gradient(135deg, #060d1f 0%, #0a1628 50%, #0d1f3c 100%)",
      fontFamily: FONTS.base,
      overflow: "hidden",
      position: "relative",
      userSelect: "none",
      touchAction: "none",
    }}>
      <Navbar/>

      <main style={{ flex: 1, overflow: "auto", padding: "32px", zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/rankings" element={<PlaceholderPage page="rankings" />} />
          <Route path="/stats" element={<PlaceholderPage page="stats" />} />
          <Route path="/about" element={<PlaceholderPage page="about" />} />
          <Route path="/profile" element={<PlaceholderPage page="profile" />} />
          <Route path="/auth" element={<PlaceholderPage page="auth" />} />
        </Routes>
      </main>
    </div>
  )
}
