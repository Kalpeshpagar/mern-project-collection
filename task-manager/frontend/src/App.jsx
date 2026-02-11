import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import PrivateRoute from './components/PrivateRoute'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import { Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import './App.css'

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>

    </BrowserRouter>
  )
}

export default App
