"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Configure axios defaults
  axios.defaults.baseURL = "http://localhost:3000/api"

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      // Verify token validity
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async () => {
    try {
      const response = await axios.get("/indicators")
      // If request succeeds, token is valid
      const userData = JSON.parse(localStorage.getItem("user"))
      setUser(userData)
    } catch (error) {
      // Token is invalid, clear storage
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post("/auth/login", { email, password })

      if (response.data.success) {
        const { token, user } = response.data.data

        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        setUser(user)
        toast.success("Inicio de sesión exitoso")
        return { success: true, user }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al iniciar sesión"
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (nombre, apellido, email, password) => {
    try {
      const response = await axios.post("/auth/register", { 
        nombre, 
        apellido, 
        email, 
        password 
      })

      if (response.data.success) {
        const { token, user } = response.data.data

        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        setUser(user)
        toast.success("Registro exitoso")
        return { success: true, user }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al registrar usuario"
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    toast.success("Sesión cerrada")
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.post("/auth/change-password", {
        currentPassword,
        newPassword,
      })

      if (response.data.success) {
        toast.success("Contraseña actualizada exitosamente")
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al cambiar contraseña"
      toast.error(message)
      return { success: false, message }
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    changePassword,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
