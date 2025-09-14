"use client"

import UserLayout from "../../components/Layout/UserLayout"

const MyRecords = () => {
  return (
    <UserLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Registros</h1>
          <p className="text-muted-foreground">Consulta el historial de tus registros</p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Historial de Registros</h2>
          <p className="text-muted-foreground">
            Aquí podrás ver todos los registros que has ingresado anteriormente.
          </p>
        </div>
      </div>
    </UserLayout>
  )
}

export default MyRecords