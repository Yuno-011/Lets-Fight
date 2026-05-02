import { useEffect, useState } from "react"
import GameCanvas from "../components/GameCanvas"
import Scoreboard from "../components/Scoreboard"
import { useNavigate, useParams } from "react-router-dom"
import { gqlFetch } from "../api"
import WinnerScreen from "../components/WinnerScreen"

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

const GET_SCORE = `
    query GetMatch($id: ID!) {
        match(id: $id) {
            score_one
            score_two
            status
        }
    }
`

const UPDATE_SCORE = `
    mutation UpdateScore($id: ID!, $scoreOne: Int!, $scoreTwo: Int!) {
        updateMatch(id: $id, scoreOne: $scoreOne, scoreTwo: $scoreTwo) { id }
    }
`

const SUBMIT_MATCH = `
    mutation SubmitMatch($id: ID!, $scoreOne: Int!, $scoreTwo: Int!) {
        submitMatch(id: $id, scoreOne: $scoreOne, scoreTwo: $scoreTwo) { id }
    }
`

export default function GamePage() {
    const { id } = useParams()
    const [error, setError] = useState(null);
    const [score, setScore]  = useState([0, 0])
    const [timer, setTimer] = useState(0)
    const [status, setStatus] = useState('WAITING')
    const [players, setPlayers] = useState({ one: '...', two: '...' })
    const navigate = useNavigate()
    let interval

    useEffect(() => {   
        gqlFetch(GET_MATCH, { id })
            .then(data => {
                setPlayers({
                    one: data.match.player_one.username,
                    two: data.match.player_two.username,
                })
                setScore([data.match.score_one, data.match.score_two])
                setStatus(data.match.status)
                if (data.match.status === 'FINISHED') setTimer(Math.round((new Date(data.match.ended_at) - new Date(data.match.created_at)) / 1000))
                else {
                    setTimer(Math.round((new Date() - new Date(data.match.created_at)) / 1000))
                    if(interval) clearInterval(interval)
                    interval = setInterval(() => setTimer(t => t + 1), 1000)
                }
            })
            .catch(err => setError(err))
        return () => { if(interval) clearInterval(interval) }
    }, [id])

    // Only now cause it's funnier that way, remove / change when multiplayer
    useEffect(() => {
        const updateScoreInterval = setInterval(() => {
            const data = gqlFetch(GET_SCORE, { id })
                .then(data => {
                    setScore([data.match.score_one, data.match.score_two])
                    if (data.status === 'FINISHED') clearInterval(updateScoreInterval)
                })
                .catch(err => setError(err))
        }, 2000)
    }, [id])

    function handleUpdateScore(newScore) {
        setScore(prev => {
            const next = newScore(prev)
            if (next[0] >= 10 || next[1] >= 10) {
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
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%", position: 'relative' }}>
            { (score[0] >= 10 || score[1] >= 10) && (
                <WinnerScreen winner={(score[0] > score[1]) ? players.one : players.two} onContinue={() => navigate('/home')}/>
            )}
            <Scoreboard score={score} timer={timer} playerOne={players.one} playerTwo={players.two} status={status}/>

            { error==null && <div style={{
                flex: 1, minHeight: "340px",
                background: "rgba(8,18,40,0.7)",
                border: `1px solid rgba(0,212,255,0.15)`,
                borderRadius: "16px",
                backdropFilter: "blur(10px)",
                overflow: "hidden",
                boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}>
                <div style={{ height: "calc(100%)" }}>
                    <GameCanvas setScore={handleUpdateScore} disabled={(score[0] >= 10 || score[1] >= 10)}/>
                </div>
            </div> }
            { error && <div className="error">Something went wrong: {error.message}</div> }
        </div>
    )
}