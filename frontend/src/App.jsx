import { Routes, Route, Navigate } from "react-router-dom"
import Navbar from "./components/Navbar"
import HomePage from "./pages/HomePage"
import AuthPage from "./pages/AuthPage"
import GamePage from "./pages/GamePage"
import PlaceholderPage from "./pages/PlaceholderPage"
import { FONTS } from "./constants/theme"
import { GuestRoute, ProtectedRoute } from "./guards/ProtectedRoute"
import ProfilePage from "./pages/ProfilePage"
import RankingPage from "./pages/RankingPage"
import { useIsMobile } from "./hooks/useIsMobile"
import AboutPage from "./pages/AboutPage"
import StatsPage from "./pages/StatsPage"

export default function App() {
  const isMobile = useIsMobile()
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

      <main style={{ flex: 1, overflow: "auto", padding: isMobile ? "105px 16px 16px" : "32px", zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/match/:id" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/auth" element={<GuestRoute><AuthPage /></GuestRoute>} />
          <Route path="/user/:username" element={<PlaceholderPage page="user" />} />
        </Routes>
      </main>
    </div>
  )
}
