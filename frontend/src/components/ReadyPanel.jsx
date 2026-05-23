import { COLORS } from "../constants/theme";

export default function ReadyPanel({ ready, onReady }) {
    return (
        <div className="overlay">
            <div className="overlay-box" style={{ borderColor: COLORS.cyanBorder }}>
                <div style={{
                    fontSize: '48px',
                    fontWeight: 900,
                    color: COLORS.cyan
                }}>{ready ? 'Waiting for the other player...' : 'Are you ready ?' }</div>
                <div style={{
                    fontSize: '13px',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    color: COLORS.textMuted
                }}>Note: Once both players click Ready, the match will start.</div>
                { !ready && <button onClick={onReady} style={{ background: COLORS.pink }} className="btn btn-primary">Ready!</button> }
            </div>
        </div>
    )
}