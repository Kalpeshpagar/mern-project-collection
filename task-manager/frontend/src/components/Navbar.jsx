import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/navbar.css"

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth()

  return (
    <nav className="navbar">
      <h2>TaskManager</h2>

      <div>
        <Link to="/">Home</Link>

        {!isAuthenticated ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
