import { useAuth } from "../context/AuthContext"
import { COLORS } from '../constants/theme'
import { useNavigate } from "react-router-dom"

export default function ProfilePage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/home')
    }

    console.log(user)

    if (user !== undefined && user !== null) {
        return (
            <div>
                <h1>{user.username || 'Player profile'}</h1>
                <div className="panel" style={{marginTop:'20px'}}>
                    <div className="panel-header">
                        <span className="panel-title">User details</span>
                    </div>
                    <div className="panel-body">
                        <table style={{ margin:'auto', width:'100%' }}>
                            <tbody>
                                <tr>
                                    <td style={{width:'120px'}}><b>Email</b></td>
                                    <td>{user.email}</td>
                                </tr>
                                <tr>
                                    <td style={{width:'120px'}}><b>Join date</b></td>
                                    <td>{new Date(user.created_at).toLocaleDateString("en-US", ({ day: 'numeric', month: 'long', year: 'numeric' }))}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="btn btn-primary"
                    style={{ background: COLORS.pink, border: COLORS.pinkDim, marginTop:'20px' }}
                >
                    Sign out
                </button>
            </div>
        )
    } else return <div>Not connected</div>
}