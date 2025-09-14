"use client"

import UserLayout from "../../components/Layout/UserLayout"

const DataEntry = () => {
  return (
    <UserLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Carga de Datos</h1>
          <p className="text-muted-foreground">Registra los valores de los indicadores ambientales</p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Formulario de Carga</h2>
          <p className="text-muted-foreground">
            Aquí podrás ingresar los datos de los indicadores ambientales asignados.
          </p>
        </div>
      </div>
    </UserLayout>
  )
}

export default DataEntry