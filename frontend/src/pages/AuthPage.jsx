import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { gqlFetch } from '../api'

const LOGIN = `
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`

const REGISTER = `
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password)
  }
`

export default function AuthPage() {
  const { login } = useAuth()

  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [loginError, setLoginError] = useState(null)
  const [registerError, setRegisterError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoginError(null)
    setLoading(true)
    try {
      const data = await gqlFetch(LOGIN, { username: loginForm.username, password: loginForm.password })
      await login(data.login)
    } catch (e) {
      setLoginError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister() {
    setRegisterError(null)
    if (registerForm.password !== registerForm.confirm) {
      setRegisterError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const data = await gqlFetch(REGISTER, {
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
      })
      await login(data.register)
    } catch (e) {
      setRegisterError(e.message === 'USERNAME_OR_EMAIL_TAKEN' ? 'Username or email already taken' : e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-grid">
        <div className="authentication-panels">
            <div className="panel">
                <div className="panel-header">
                    <span className="panel-title">Login</span>
                </div>
                <div className="panel-body">
                    <div className="form-row">
                        <div className="label">username</div>
                        <input
                            placeholder="Your_Username" type="text"
                            value={loginForm.username}
                            onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
                        />
                    </div>
                    <div className="form-row">
                        <div className="label">mot de passe</div>
                        <input
                            placeholder="••••••••" type="password"
                            value={loginForm.password}
                            onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                        />
                    </div>
                    {loginError && <div style={{ color: '#ff6b6b', fontSize: '13px' }}>{loginError}</div>}
                    <button onClick={handleLogin} disabled={loading} className="btn btn-primary btn-block">Login →</button>
                </div>
            </div>
            <div className="panel">
                <div className="panel-header">
                    <span className="panel-title">Register</span>
                </div>
                <div className="panel-body">
                    <div className="form-row">
                        <div className="label">choose a player tag</div>
                        <input
                            placeholder="YunoLeGoat_67" type="text"
                            value={registerForm.username}
                            onChange={e => setRegisterForm(f => ({ ...f, username: e.target.value }))}
                        />
                    </div>
                    <div className="form-row">
                        <div className="label">e-mail</div>
                        <input
                            placeholder="myemail@example.com" type="email"
                            value={registerForm.email}
                            onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                        />
                    </div>
                    <div className="form-row">
                        <div className="label">password</div>
                        <input
                            placeholder="min. 8 characters" type="password"
                            value={registerForm.password}
                            onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                        />
                    </div>
                    <div className="form-row">
                        <div className="label">confirm your password</div>
                        <input
                            placeholder="please type it again" type="password"
                            value={registerForm.confirm}
                            onChange={e => setRegisterForm(f => ({ ...f, confirm: e.target.value }))}
                        />
                    </div>
                    {registerError && <div style={{ color: '#ff6b6b', fontSize: '13px' }}>{registerError}</div>}
                    <button onClick={handleRegister} disabled={loading} className="btn btn-primary btn-block">Create an account →</button>
                </div>
            </div>
        </div>
    </div>
  )
}
