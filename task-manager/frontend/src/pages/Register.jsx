import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { registerUser } from "../api/auth.api"
import "../styles/auth.css"
import { useAuth } from "../context/AuthContext"

const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const { register } = useAuth()

const handleSubmit = async (e) => {
  e.preventDefault()

  const res = await register({ name, email, password })

  if (res.success) {
    navigate("/login")
  } else {
    alert(res.message)
  }
}


  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button type="submit">Register</button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
