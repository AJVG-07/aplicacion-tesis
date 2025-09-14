"use client"

import AdminLayout from "../../components/Layout/AdminLayout"

const IndicatorManagement = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Indicadores</h1>
          <p className="text-muted-foreground">Configura y administra los indicadores ambientales</p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Indicadores Ambientales</h2>
          <p className="text-muted-foreground">
            Aquí podrás crear, editar y configurar los indicadores del sistema.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}

export default IndicatorManagement