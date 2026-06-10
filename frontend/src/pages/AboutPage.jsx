import { Link } from "react-router-dom";
import { COLORS } from "../constants/theme";

export default function AboutPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ color: COLORS.textMuted, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase' }}>
                About
            </div>
            <div style={{ borderRadius: '12px', border: '0.5px solid rgba(0, 212, 255, 0.15)', width: '100%', padding: '20px' }}>
                <h1>🥊 How to Play: LET'S FIGHT!</h1>
                Welcome to the ladder! Let's Fight is a competitive matchmaking ladder designed to test your skills and help you reach your highest potential with hype, fast matches. Getting started is simple, you just need to follow the steps bellow:

                <br/><br/>
                <h2>🚀 Getting Started</h2>

                <b>Sign In:</b> Choose a player name, an email and a password in order to <Link to="/auth">create an account</Link>.<br/>
                <b>Join the queue:</b> Enter the matchmaking queue by clicking <b>Find Match</b>, you may wait until other players join the queue.<br/>
                <b>Play:</b> Once a match is found, simply follow the on-screen instructions to connect with your opponent and play your set.<br/>

                <br/>First to 10 KOs wins, as simple as that !

                <br/><br/>
                <h2>🎮 Game Controls</h2>

                <b>Movement:</b> You move with <b>WASD</b>, and jump with the space bar. Movement in the air is pretty free, momentum is not kept.<br/>
                <b>Dash:</b> You attack by clicking on your screen with your mouse. The dash goes in the direction of your click relative to your character.<br/>

                <br/>You can only dash once in the air, unless you started your dash on the ground and slided off platform. Then, you can use your dash to save you from certain death. You kill your opponent by pushing hioutside of the arena, and you can
                also kill him off the top if you pushed him far enough.<br/>

                <br/>There's also a combo mechanic : The more you hit your opponent in a row, the more knockback he will receive each hit.

                <br/><br/>
                <h2>🌐 Other Pages</h2>

                <ul style={{ marginLeft: '20px' }}>
                    <li><Link to="/">Home:</Link> You can view the latest matches played here.</li>
                    <li><Link to="/ranking">Ranking:</Link> The standings of the best players of the website, ranked with an Elo system.</li>
                    <li><Link to="/stats">Statistics:</Link> Check general stats like best grinders and elo distribution.</li>
                </ul>
            </div>
        </div>
    )
}