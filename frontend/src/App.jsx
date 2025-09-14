import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AdminDashboard from "./pages/admin/AdminDashboard"
import UserManagement from "./pages/admin/UserManagement"
import IndicatorManagement from "./pages/admin/IndicatorManagement"
import Reports from "./pages/admin/Reports"
import UserDashboard from "./pages/user/UserDashbord"
import DataEntry from "./pages/user/DataEntry"
import MyRecords from "./pages/user/MyRecords"

function App() {
  
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="administrador">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="administrador">
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/indicators"
              element={
                <ProtectedRoute requiredRole="administrador">
                  <IndicatorManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute requiredRole="administrador">
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="encargado">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-entry"
              element={
                <ProtectedRoute requiredRole="encargado">
                  <DataEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-records"
              element={
                <ProtectedRoute requiredRole="encargado">
                  <MyRecords />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
