"use client"

import UserLayout from "../../components/Layout/UserLayout"

const UserDashboard = () => {
  return (
    <UserLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de tus indicadores ambientales asignados</p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Panel de Usuario</h2>
          <p className="text-muted-foreground">
            Bienvenido a tu panel personal. Desde aquí puedes gestionar tus indicadores.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="font-semibold text-primary">Carga de Datos</h3>
              <p className="text-sm text-muted-foreground mt-2">Registra nuevos valores</p>
            </div>
            
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="font-semibold text-primary">Mis Registros</h3>
              <p className="text-sm text-muted-foreground mt-2">Consulta tu historial</p>
            </div>
            
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="font-semibold text-primary">Estado</h3>
              <p className="text-sm text-muted-foreground mt-2">Revisa tu progreso</p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  )

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch indicators with status
      const indicatorsResponse = await axios.get("/records/indicators-status")
      const { indicators, loadingPeriodOpen } = indicatorsResponse.data.data

      // Fetch recent records
      const recordsResponse = await axios.get("/records?limit=5")
      const records = recordsResponse.data.data || []

      const completedThisMonth = indicators.filter((ind) => ind.estado === "Cargado").length
      const pendingRecords = indicators.filter((ind) => !ind.estado || ind.estado === "Pendiente").length

      setDashboardData({
        assignedIndicators: indicators.length,
        completedThisMonth,
        pendingRecords,
        loadingPeriodOpen,
      })

      setRecentRecords(records.slice(0, 5))
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentPeriodInfo = () => {
    const now = new Date()
    const currentDay = now.getDate()
    const currentMonth = now.getMonth() + 1
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const year = currentMonth === 1 ? now.getFullYear() - 1 : now.getFullYear()

    return {
      period: `${getMonthName(previousMonth)} ${year}`,
      daysLeft: currentDay <= 5 ? 6 - currentDay : 0,
      isOpen: currentDay >= 1 && currentDay <= 5,
    }
  }

  const getMonthName = (month) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    return months[month - 1]
  }

  const periodInfo = getCurrentPeriodInfo()

  const statCards = [
    {
      name: "Indicadores Asignados",
      value: dashboardData.assignedIndicators,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      name: "Completados Este Mes",
      value: dashboardData.completedThisMonth,
      icon: CheckCircle,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      name: "Registros Pendientes",
      value: dashboardData.pendingRecords,
      icon: Clock,
      color: "text-secondary-foreground",
      bgColor: "bg-secondary/10",
    },
  ]

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de tus indicadores ambientales asignados</p>
        </div>

        {/* Loading Period Status */}
        <div
          className={`p-4 rounded-lg border ${
            periodInfo.isOpen ? "bg-chart-1/10 border-chart-1/20" : "bg-destructive/10 border-destructive/20"
          }`}
        >
          <div className="flex items-center gap-3">
            {periodInfo.isOpen ? (
              <CheckCircle className="h-6 w-6 text-chart-1" />
            ) : (
              <AlertCircle className="h-6 w-6 text-destructive" />
            )}
            <div>
              <h3 className="font-semibold text-card-foreground">Período de Carga: {periodInfo.period}</h3>
              <p className="text-sm text-muted-foreground">
                {periodInfo.isOpen
                  ? `Carga abierta - Quedan ${periodInfo.daysLeft} días`
                  : "Período de carga cerrado - Próxima apertura: 1ro del próximo mes"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {statCards.map((stat) => (
            <div key={stat.name} className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Registros Recientes</h3>
            <div className="space-y-3">
              {recentRecords.length > 0 ? (
                recentRecords.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{record.indicador_nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {getMonthName(record.mes)} {record.anio} - {record.valor} {record.unidad}
                      </p>
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.estado === "Cargado"
                          ? "bg-chart-1/10 text-chart-1"
                          : "bg-secondary/10 text-secondary-foreground"
                      }`}
                    >
                      {record.estado}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hay registros recientes</p>
              )}
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <a
                href="/data-entry"
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  periodInfo.isOpen
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                <FileText className="h-5 w-5" />
                <div>
                  <p className="font-medium">Cargar Datos</p>
                  <p className="text-xs opacity-75">{periodInfo.isOpen ? "Período abierto" : "Período cerrado"}</p>
                </div>
              </a>

              <a
                href="/my-records"
                className="flex items-center gap-3 p-3 bg-chart-4/10 text-chart-4 rounded-lg hover:bg-chart-4/20 transition-colors"
              >
                <Calendar className="h-5 w-5" />
                <div>
                  <p className="font-medium">Ver Historial</p>
                  <p className="text-xs opacity-75">Consultar registros anteriores</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}

export default UserDashboard
