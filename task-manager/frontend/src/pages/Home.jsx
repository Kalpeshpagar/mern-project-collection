import { Link } from "react-router-dom"
import "../styles/auth.css"

const Home = () => {
  return (
    <div className="center-container">
      <h1>Task Manager</h1>
      <p>Organize your tasks efficiently</p>

      <div className="button-group">
        <Link to="/login" className="btn">Login</Link>
        <Link to="/register" className="btn btn-outline">Register</Link>
      </div>
    </div>
  )
}

export default Home
