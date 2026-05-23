import { COLORS } from "../constants/theme";

export default function WinnerScreen({ winner, onContinue }) {
    return (
        <div className="overlay">
            <div className="overlay-box" style={{ borderColor: COLORS.cyanBorder }}>
                <div style={{
                    fontSize: '13px',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    color: COLORS.textMuted
                }}>Winner</div>
                <div style={{
                    fontSize: '48px',
                    fontWeight: 900,
                    color: COLORS.cyan
                }}>{winner}</div>
                <button onClick={onContinue} className="btn btn-primary">Back to Home</button>
            </div>
        </div>
    )
}