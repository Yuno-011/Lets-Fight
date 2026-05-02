// components/GameCanvas.jsx
import { useEffect, useRef, useState } from "react"
import GameContainer from "./GameContainer"
import { GAME_STATS } from "../constants/game"

export default function GameCanvas({ setScore, disabled }) {
  const wrapperRef = useRef(null)
  const [size, setSize] = useState(null)
  const BASE_RATIO = GAME_STATS.BASE_WIDTH / GAME_STATS.BASE_HEIGHT

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      let newWidth = width
      let newHeight = width / BASE_RATIO
      if (newHeight > height) {
        newHeight = height
        newWidth = height * BASE_RATIO
      }
      setSize({ width: Math.floor(newWidth), height: Math.floor(newHeight) })
    })
    observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "100%", display: 'flex', justifyContent: 'center' }}>
      {size && <GameContainer game_width={size.width} game_height={size.height} setScore={setScore} disabled={disabled} />}
    </div>
  )
}