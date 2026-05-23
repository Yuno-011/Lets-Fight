// components/GameCanvas.jsx
import { memo, useEffect, useRef, useState } from "react"
import GameContainer from "./GameContainer"
import { GAME_STATS } from "../constants/game"

const GameCanvas = memo(({ setScore, socketRef, matchId, myPlayer, active }) => {
  console.log('GameCanvas render', { active, myPlayer, matchId })

  const wrapperRef = useRef(null)
  const [size, setSize] = useState(null)
  const BASE_RATIO = GAME_STATS.BASE_WIDTH / GAME_STATS.BASE_HEIGHT

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      console.log('ResizeObserver fired', width, height)
      let newWidth = width
      let newHeight = width / BASE_RATIO
      if (newHeight > height) {
        newHeight = height
        newWidth = height * BASE_RATIO
      }
      console.log('setSize called', newWidth, newHeight)
      setSize({ width: Math.floor(newWidth), height: Math.floor(newHeight) })
    })
    observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "100%", display: 'flex', justifyContent: 'center' }}>
      {size && <GameContainer
        game_width={size.width}
        game_height={size.height}
        setScore={setScore}
        socketRef={socketRef}
        matchId={matchId}
        myPlayer={myPlayer}
        active={active}
      />}
    </div>
  )
})

export default GameCanvas