export default function MatchRow({ match }) {
    const date = new Date(match.created_at).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
    const finished = match.status === 'FINISHED'
    const p1Won = match.score_one > match.score_two

    const p1Result = finished ? (p1Won ? 'win' : 'lose') : ''
    const p2Result = finished ? (!p1Won ? 'win' : 'lose') : ''

    return (
        <div className="match-preview">
            <div className={`player ${p1Result}`}>
                {finished && <div className={`tag ${p1Result}`}>{p1Won ? 'WIN' : 'LOSE'}</div>}
                <div className="name">{match.player_one.username}</div>
            </div>

            <div className="center">
                <div className="date">{date}</div>
                <div className="score">
                    {match.score_one} <span>—</span> {match.score_two}
                </div>
                <div className={`status ${finished ? 'finished' : 'in-progress'}`}>
                    {match.status.replace('_', ' ')}
                </div>
            </div>

            <div className={`player right ${p2Result}`}>
                {finished && <div className={`tag ${p2Result}`}>{!p1Won ? 'WIN' : 'LOSE'}</div>}
                <div className="name">{match.player_two.username}</div>
            </div>
        </div>
    )
}