"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import AdminLayout from "../../components/Layout/AdminLayout"
import { Plus, Search, Edit, Trash2, UserCheck, UserX, Eye, EyeOff } from "lucide-react"

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [indicators, setIndicators] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    rol: "encargado",
    estado: "activo",
    indicadores: []
  })

  useEffect(() => {
    loadUsers()
    loadIndicators()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await axios.get("/users")
      if (response.data.success) {
        setUsers(response.data.data)
      }
    } catch (error) {
      toast.error("Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  const loadIndicators = async () => {
    try {
      const response = await axios.get("/indicators")
      if (response.data.success) {
        setIndicators(response.data.data)
      }
    } catch (error) {
      console.error("Error al cargar indicadores", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingUser) {
        // Actualizar usuario
        const response = await axios.put(`/users/${editingUser.id}`, {
          ...formData,
          indicadores: formData.rol === 'encargado' ? formData.indicadores : []
        })
        
        if (response.data.success) {
          toast.success("Usuario actualizado exitosamente")
          loadUsers()
          closeModal()
        }
      } else {
        // Crear nuevo usuario
        if (!formData.password) {
          toast.error("La contraseña es requerida para nuevos usuarios")
          return
        }
        
        const response = await axios.post("/users", {
          ...formData,
          indicadores: formData.rol === 'encargado' ? formData.indicadores : []
        })
        
        if (response.data.success) {
          toast.success("Usuario creado exitosamente")
          loadUsers()
          closeModal()
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al guardar usuario"
      toast.error(message)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      password: "",
      rol: user.rol,
      estado: user.estado,
      indicadores: user.indicadores_asignados ? user.indicadores_asignados.split(", ").map(ind => 
        indicators.find(i => i.nombre === ind)?.id
      ).filter(Boolean) : []
    })
    setShowModal(true)
  }

  const handleDelete = async (userId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      return
    }

    try {
      const response = await axios.delete(`/users/${userId}`)
      if (response.data.success) {
        toast.success("Usuario eliminado exitosamente")
        loadUsers()
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al eliminar usuario"
      toast.error(message)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setShowPassword(false)
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      password: "",
      rol: "encargado",
      estado: "activo",
      indicadores: []
    })
  }

  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleIndicatorChange = (indicatorId) => {
    setFormData(prev => ({
      ...prev,
      indicadores: prev.indicadores.includes(indicatorId)
        ? prev.indicadores.filter(id => id !== indicatorId)
        : [...prev.indicadores, indicatorId]
    }))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">Administra los usuarios del sistema</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </button>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-sm">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Cargando usuarios...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-foreground">Usuario</th>
                    <th className="text-left p-4 font-medium text-foreground">Email</th>
                    <th className="text-left p-4 font-medium text-foreground">Rol</th>
                    <th className="text-left p-4 font-medium text-foreground">Estado</th>
                    <th className="text-left p-4 font-medium text-foreground">Indicadores</th>
                    <th className="text-left p-4 font-medium text-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-muted-foreground">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-foreground">
                              {user.nombre} {user.apellido}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {user.id}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-foreground">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.rol === 'administrador'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.rol}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {user.estado === 'activo' ? (
                              <UserCheck className="h-4 w-4 text-green-600" />
                            ) : (
                              <UserX className="h-4 w-4 text-red-600" />
                            )}
                            <span className={user.estado === 'activo' ? 'text-green-600' : 'text-red-600'}>
                              {user.estado}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-foreground">
                            {user.indicadores_asignados || "Ninguno"}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-1 hover:bg-muted rounded"
                              title="Editar usuario"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-1 hover:bg-muted rounded"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal de crear/editar usuario */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                {editingUser ? "Editar Usuario" : "Crear Usuario"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Contraseña {editingUser && "(dejar en blanco para no cambiar)"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required={!editingUser}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Rol
                    </label>
                    <select
                      value={formData.rol}
                      onChange={(e) => setFormData({...formData, rol: e.target.value, indicadores: []})}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="encargado">Encargado</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                {formData.rol === "encargado" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Indicadores Asignados
                    </label>
                    <div className="max-h-32 overflow-y-auto border border-border rounded-lg p-2 space-y-1">
                      {indicators.map((indicator) => (
                        <label key={indicator.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.indicadores.includes(indicator.id)}
                            onChange={() => handleIndicatorChange(indicator.id)}
                            className="rounded border-border"
                          />
                          <span className="text-foreground">{indicator.nombre}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {editingUser ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default UserManagement
