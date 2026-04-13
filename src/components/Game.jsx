import { useEffect, useState } from "react";
import GameCanvas from "./GameCanvas";
import Scoreboard from "./Scoreboard";

export default function Game() {
    const [score, setScore]  = useState([0, 0])
    const [timer, setTimer] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => setTimer(t => t + 1), 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%" }}>
            <Scoreboard score={score} timer={timer} />

            <div style={{
                flex: 1, minHeight: "340px",
                background: "rgba(8,18,40,0.7)",
                border: `1px solid rgba(0,212,255,0.15)`,
                borderRadius: "16px",
                backdropFilter: "blur(10px)",
                overflow: "hidden",
                boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}>
                <div style={{ height: "calc(100% - 48px)" }}>
                    <GameCanvas setScore={setScore} />
                </div>
            </div>
        </div>
    )
}