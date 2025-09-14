"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import AdminLayout from "../../components/Layout/AdminLayout"
import { 
  Leaf, 
  TrendingUp, 
  Droplets, 
  Wind,
  BarChart3,
  Users,
  Target,
  Bell,
  Settings,
  TrendingUp as TrendingUpIcon,
  FileText
} from "lucide-react"

const AdminDashboard = () => {
  const { user } = useAuth()
  const [dashboardStats, setDashboardStats] = useState({
    totalIndicators: 29,
    activeUsers: 0,
    waterConsumption: "2,450 L",
    emissions: "15.2 tCO₂eq",
    recyclingRate: "78%"
  })

  const tools = [
    {
      title: "Visualización de Datos",
      description: "Dashboard con gráficos, filtros por indicador y período, y comparación temporal.",
      icon: BarChart3,
      link: "/admin/visualization",
      color: "bg-blue-500"
    },
    {
      title: "Gestión de Usuarios",
      description: "Registro, listado y filtrado de encargados del sistema.",
      icon: Users,
      link: "/admin/users",
      color: "bg-green-500"
    },
    {
      title: "Gestión de Indicadores",
      description: "Catálogo de indicadores predefinidos con CRUD básico. Los indicadores clave vienen precargados.",
      icon: Target,
      link: "/admin/indicators",
      color: "bg-purple-500"
    },
    {
      title: "Monitoreo",
      description: "Sistema de alertas que notifica valores atípicos (ej: consumo 50% superior al mes anterior).",
      icon: Bell,
      link: "/admin/monitoring",
      color: "bg-yellow-500"
    },
    {
      title: "Auditoría",
      description: "Vista de registros mensuales con estados (Pendiente, Cargado, Ceros) y desbloqueo de formularios.",
      icon: Settings,
      link: "/admin/audit",
      color: "bg-red-500"
    },
    {
      title: "Gestión de Metas Ambientales",
      description: "Definición de metas y seguimiento visual del progreso.",
      icon: TrendingUpIcon,
      link: "/admin/goals",
      color: "bg-indigo-500"
    },
    {
      title: "Generación de Reportes",
      description: "Exportación a PDF/Excel con previsualización de reportes.",
      icon: FileText,
      link: "/admin/reports",
      color: "bg-teal-500"
    }
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Bienvenida */}
        <div className="welcome-section">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Selecciona una Herramienta
          </h2>
          <p className="text-muted-foreground">
            Accede a las funcionalidades del sistema para gestionar los indicadores ambientales.
          </p>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Contenido principal */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-card-foreground">
                  Herramientas de Gestión
                </h3>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Administrador
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool, index) => {
                  const IconComponent = tool.icon
                  
                  return (
                    <Link key={index} to={tool.link}>
                      <div className="tool-card group p-4 border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${tool.color} text-white group-hover:scale-110 transition-transform`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {tool.title}
                            </h4>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar con estadísticas */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="font-semibold text-card-foreground mb-1">Vista Previa de Valores</h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Indicadores Clave
                </span>
              </div>

              <div className="space-y-4">
                <div className="stat-card p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Indicadores Monitoreados</p>
                      <p className="text-xl font-bold text-foreground">{dashboardStats.totalIndicators}</p>
                      <p className="text-xs text-muted-foreground">6 categorías activas</p>
                    </div>
                  </div>
                </div>

                <div className="stat-card p-3 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500 rounded-lg">
                      <Droplets className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Consumo de Agua</p>
                      <p className="text-xl font-bold text-foreground">{dashboardStats.waterConsumption}</p>
                      <p className="text-xs text-muted-foreground">Datos actuales</p>
                    </div>
                  </div>
                </div>

                <div className="stat-card p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Wind className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Emisiones GEI</p>
                      <p className="text-xl font-bold text-foreground">{dashboardStats.emissions}</p>
                      <p className="text-xs text-muted-foreground">Registro actual</p>
                    </div>
                  </div>
                </div>

                <div className="stat-card p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Leaf className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Reciclaje</p>
                      <p className="text-xl font-bold text-foreground">{dashboardStats.recyclingRate}</p>
                      <p className="text-xs text-muted-foreground">Nivel actual</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
