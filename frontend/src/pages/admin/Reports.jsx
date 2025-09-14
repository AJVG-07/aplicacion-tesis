"use client"

import AdminLayout from "../../components/Layout/AdminLayout"

const Reports = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground">Genera y consulta reportes del sistema</p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Centro de Reportes</h2>
          <p className="text-muted-foreground">
            Desde aquí podrás generar reportes y análisis de los indicadores ambientales.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Reports