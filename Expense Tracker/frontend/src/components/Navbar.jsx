import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";
import { useTheme } from "../context/themeContext";
import "../index.css"

const Navbar = () => {
  const { isAuthenticated, logout, hasCategories } = useAuth();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();


  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
  {/* LEFT */}
  <h2 className="logo">ExpenseTracker</h2>

  {/* CENTER */}
  <div className="nav-links">
    {!isAuthenticated ? (
      <>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </>
    ) : (
      <>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/expenses">Expenses</Link>
        <Link to="/categories">Categories</Link>

        <Link
          to={hasCategories ? "/expenses/new" : "#"}
          className={`add-expense-btn ${
            !hasCategories ? "disabled" : ""
          }`}
          onClick={(e) => {
            if (!hasCategories) e.preventDefault();
          }}
        >
          + Add Expense
        </Link>
      </>
    )}
  </div>

  {/* RIGHT */}
  {isAuthenticated && (
    <div className="nav-actions">
      <button
        onClick={toggleTheme}
        className="theme-btn"
        title="Toggle theme"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  )}
</nav>

  );
};

export default Navbar;
