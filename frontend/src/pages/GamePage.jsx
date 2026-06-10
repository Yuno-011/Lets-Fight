// const GET_SCORE = `
//     query GetMatch($id: ID!) {
//         match(id: $id) {
//             score_one
//             score_two
//             status
//         }
//     }
// `

import { useCallback, useEffect, useRef, useState } from "react"
import GameCanvas from "../components/GameCanvas"
import Scoreboard from "../components/Scoreboard"
import { useNavigate, useParams } from "react-router-dom"
import { gqlFetch } from "../api"
import WinnerScreen from "../components/WinnerScreen"
import ReadyPanel from "../components/ReadyPanel"
import { io } from "socket.io-client"
import { COLORS } from "../constants/theme"
import Countdown from "../components/Countdown"

const GET_MATCH = `
    query GetMatch($id: ID!) {
        match(id: $id) {
            id
            player_one { username }
            player_two { username }
            score_one
            score_two
            status
            created_at
            ended_at
        }
    }
`

const UPDATE_SCORE = `
    mutation UpdateScore($id: ID!, $scoreOne: Int!, $scoreTwo: Int!) {
        updateMatch(id: $id, scoreOne: $scoreOne, scoreTwo: $scoreTwo) { id }
    }
`

const SUBMIT_MATCH = `
    mutation SubmitMatch($id: ID!, $scoreOne: Int!, $scoreTwo: Int!, $duration: Int!) {
        submitMatch(id: $id, scoreOne: $scoreOne, scoreTwo: $scoreTwo, duration: $duration) { id }
    }
`

export default function GamePage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const socketRef = useRef(null)

    const [matchPhase, setMatchPhase] = useState('WAITING')
    const [myPlayer, setMyPlayer] = useState(null)
    const [error, setError] = useState(null)
    const [score, setScore] = useState([0, 0])
    const timerRef = useRef(0)
    const [timer, setTimer] = useState(0)
    const [status, setStatus] = useState('WAITING')
    const [players, setPlayers] = useState({ one: '...', two: '...' })
    const [opponentDisconnected, setOpponentDisconnected] = useState(false)
    const [ready, setReady] = useState(false)

    // Game Socket
    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL)
        socketRef.current = socket

        socket.emit('joinMatch', { matchId: id, token: localStorage.getItem('token') })

        socket.on('joinedAs', ({ player, status }) => {
            setMyPlayer(player)
            if (status === 'STARTED') setMatchPhase('PLAYING')
            if (status === 'FINISHED') setMatchPhase('FINISHED')
            if (status === 'SETUP') setMatchPhase('SETUP')
        })
        socket.on('startMatch', () => setMatchPhase('COUNTDOWN'))
        socket.on('opponentDisconnected', () => setOpponentDisconnected(true))
        socket.on('opponentReconnected', () => setOpponentDisconnected(false))

        return () => socket.disconnect()
    }, [id])

    // Fetch player names
    useEffect(() => {
        gqlFetch(GET_MATCH, { id })
            .then(data => {
                setPlayers({
                    one: data.match.player_one.username,
                    two: data.match.player_two.username,
                })
                setScore([data.match.score_one, data.match.score_two])
                setStatus(data.match.status)
                if (data.match.status === 'FINISHED') {
                    setTimer(Math.round((new Date(data.match.ended_at) - new Date(data.match.created_at)) / 1000))
                    setMatchPhase('FINISHED')
                }
                else setTimer(Math.round((new Date() - new Date(data.match.created_at)) / 1000))
            })
            .catch(err => setError(err))
    }, [id])

    // Timer
    useEffect(() => {
        if (matchPhase === 'FINISHED') return
        const interval = setInterval(() => setTimer(t => {
            timerRef.current = t + 1
            return t + 1
        }), 1000)
        return () => clearInterval(interval)
    }, [matchPhase])

    const handleUpdateScore = useCallback((newScore) => {
        setScore(prev => {
            const next = newScore(prev)
            if (next[0] >= 10 || next[1] >= 10) {
                setMatchPhase('FINISHED')
                gqlFetch(SUBMIT_MATCH, {
                    id,
                    scoreOne: next[0],
                    scoreTwo: next[1],
                }).catch(err => setError(err))
            } else {
                gqlFetch(UPDATE_SCORE, {
                    id: id,
                    scoreOne: next[0],
                    scoreTwo: next[1],
                }).catch(err => setError(err))
            }

            return next
        })
    }, [])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <Scoreboard score={score} timer={timer} playerOne={players.one} playerTwo={players.two} status={status} />

            { error==null && <div style={{
                flex: 1, minHeight: '340px',
                background: 'rgba(8,18,40,0.7)',
                border: `1px solid ${COLORS.cyanBorder}`,
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                position: 'relative'
            }}>
                {matchPhase === 'SETUP' && (
                    <ReadyPanel
                        ready={ready} 
                        onReady={() => {
                            setReady(true)
                            socketRef.current.emit('playerReady', { matchId: id, token: localStorage.getItem('token') })}
                        }
                    />
                )}
                {matchPhase === 'COUNTDOWN' && (
                    <Countdown onDone={() => setMatchPhase('PLAYING')} />
                )}
                {matchPhase === 'FINISHED' && (
                    <WinnerScreen
                        winner={score[0] >= 10 ? players.one : players.two}
                        onContinue={() => navigate('/home')}
                    />
                )}
                {matchPhase !== 'WAITING' && (
                    <GameCanvas
                        setScore={handleUpdateScore}
                        socketRef={socketRef}
                        matchId={id}
                        myPlayer={myPlayer}
                        active={matchPhase === 'PLAYING'}
                    />
                )}
                {opponentDisconnected && matchPhase === 'PLAYING' && (
                    <div style={{ color: COLORS.cyan, fontSize: '13px', textAlign: 'center', position: "absolute", top: "0px", left: '0', right: '0' }}>
                        Opponent disconnected
                    </div>
                )}
            </div> }
            { error && <div className="error">Something went wrong: {error.message}</div> }
        </div>
    )
}