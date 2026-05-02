import { COLORS } from "../constants/theme";

export default function WinnerScreen({ winner, onContinue }) {
    return (
        <div style={{
            position: 'absolute', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(10, 18, 41, 0.56)',
            backdropFilter: 'blur(2px)',
        }}>
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                background: 'rgba(8,18,40,0.95)',
                border: `1px solid ${COLORS.cyanBorder}`,
                borderRadius: '20px',
                padding: '48px 64px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            }}>
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