import { useEffect, useState } from "react";
import { COLORS } from "../constants/theme";

export default function Countdown({ onDone }) {

    const [count, setCount] = useState(3)

    useEffect(() => {
        if (count === -1) { onDone(); return }
        const timeout = setTimeout(() => setCount(c => c - 1), 1000)
        return () => clearTimeout(timeout)
    }, [count])

    return (
        <div className="overlay">
            <div className="overlay-box" style={{ borderColor: COLORS.cyanBorder }}>
                <div style={{
                    fontSize: '48px',
                    fontWeight: 900,
                    color: COLORS.cyan
                }}>{ count>0 ? count : 'FIGHT!' }</div>
            </div>
        </div>
    )
}