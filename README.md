# Sistema de Indicadores Ambientales

Sistema web para la gestión de indicadores ambientales universitarios con roles diferenciados para administradores y encargados.

## Estructura del Proyecto

\`\`\`
environmental-indicators-system/
├── backend/                    # API del servidor (Express.js)
├── frontend/                   # Aplicación web (React + Vite)
├── scripts/                    # Scripts de base de datos
└── README.md                   # Documentación del proyecto
\`\`\`

## Tecnologías

- **Backend**: Node.js + Express.js + MySQL
- **Frontend**: React + Vite + Tailwind CSS
- **Base de Datos**: MySQL (MariaDB)
- **Autenticación**: JWT

## Instalación

### 1. Base de Datos
\`\`\`bash
# Ejecutar scripts en orden:
# 1. scripts/01-create-database.sql
# 2. scripts/02-seed-initial-data.sql  
# 3. scripts/03-seed-indicators.sql
\`\`\`

### 2. Backend
\`\`\`bash
cd backend
npm install
npm start
\`\`\`

### 3. Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## Funcionalidades

### Administrador
- Gestión de usuarios
- Configuración de indicadores
- Generación de reportes
- Dashboard con estadísticas

### Encargado
- Carga de datos mensuales
- Visualización de registros propios
- Dashboard personal
- Historial de registros

## Variables de Entorno

Configurar en `backend/.env`:
\`\`\`
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=indicadores_ambientales
JWT_SECRET=tu_clave_secreta
PORT=3001
FRONTEND_URL=http://localhost:5173
