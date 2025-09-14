# 📋 Módulo de Usuarios y Administradores - Sistema de Indicadores Ambientales

## 🎯 Descripción General
Este módulo implementa un sistema completo de gestión de usuarios y administradores para el Sistema de Indicadores Ambientales. Permite el registro público de usuarios, autenticación, y administración completa desde el panel de administrador.

## 🚀 Características Implementadas

### Backend
- ✅ **Autenticación JWT** - Sistema seguro de tokens
- ✅ **Registro público** - Los usuarios pueden registrarse automáticamente
- ✅ **Login seguro** - Verificación de credenciales con bcrypt
- ✅ **Gestión de usuarios** - CRUD completo para administradores
- ✅ **Roles y permisos** - Sistema de roles (administrador/encargado)
- ✅ **Middleware de autorización** - Protección de rutas sensibles
- ✅ **Asignación de indicadores** - Los encargados pueden tener indicadores específicos

### Frontend
- ✅ **Página de registro** - Interfaz amigable para nuevos usuarios
- ✅ **Página de login mejorada** - Con enlaces de registro
- ✅ **Panel de administración** - Gestión completa de usuarios
- ✅ **AuthContext actualizado** - Manejo del estado de autenticación
- ✅ **Rutas protegidas** - Acceso basado en roles

## 🛠️ Instalación y Configuración

### 1. Configurar la Base de Datos

#### Opción A: Usar el script automatizado (Recomendado)
```bash
# Desde el directorio backend
cd backend
node scripts/init-database.js
```

#### Opción B: Ejecutar el SQL manualmente
```bash
# Conectar a MySQL y ejecutar:
mysql -u root -p < scripts/create_users_table.sql
```

### 2. Configurar Variables de Entorno
Asegúrate de tener estas variables en tu archivo `.env` del backend:

```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=aplicacion_tesis

# JWT Secret (cambiar en producción)
JWT_SECRET=tu_jwt_secret_muy_seguro

# Puerto del servidor
PORT=3000
```

### 3. Instalar Dependencias
```bash
# Backend
cd backend
npm install bcryptjs jsonwebtoken mysql2 express-validator

# Frontend
cd ../frontend
npm install axios react-hot-toast react-router-dom lucide-react
```

## 🔑 Credenciales por Defecto

Después de ejecutar el script de inicialización, tendrás:

**Administrador del Sistema:**
- **Email:** `admin@sistema.com`
- **Contraseña:** `admin123`
- **Rol:** Administrador

## 📱 Uso del Sistema

### Para Usuarios Nuevos

1. **Registro:**
   - Visita `http://localhost:5173/register`
   - Completa el formulario de registro
   - Automáticamente tendrás rol de "encargado"
   - Serás redirigido al dashboard

2. **Login:**
   - Visita `http://localhost:5173/login`
   - Ingresa tus credenciales
   - Serás redirigido según tu rol

### Para Administradores

1. **Acceder al Panel de Admin:**
   - Login con credenciales de administrador
   - Serás redirigido a `/admin`

2. **Gestionar Usuarios:**
   - Ve a "Gestión de Usuarios"
   - Crear nuevos usuarios manualmente
   - Editar usuarios existentes
   - Asignar indicadores a encargados
   - Activar/desactivar usuarios
   - Eliminar usuarios (no administradores)

3. **Funciones Disponibles:**
   - ➕ Crear usuarios nuevos
   - ✏️ Editar información de usuarios
   - 🔍 Buscar usuarios por nombre/email
   - 📊 Asignar indicadores específicos
   - 🔄 Cambiar estados (activo/inactivo)
   - 🗑️ Eliminar usuarios

## 🔐 Estructura de Seguridad

### Roles del Sistema
- **Administrador:**
  - Acceso completo al sistema
  - Puede crear/editar/eliminar usuarios
  - Acceso a todas las funciones administrativas
  
- **Encargado:**
  - Acceso al dashboard de usuario
  - Puede trabajar con indicadores asignados
  - Acceso limitado a funciones específicas

### Endpoints de API

#### Autenticación (Públicos)
```
POST /api/auth/login          # Iniciar sesión
POST /api/auth/register       # Registro público
POST /api/auth/change-password # Cambiar contraseña (autenticado)
```

#### Gestión de Usuarios (Solo Administradores)
```
GET    /api/users             # Listar usuarios
POST   /api/users             # Crear usuario
PUT    /api/users/:id         # Actualizar usuario
DELETE /api/users/:id         # Eliminar usuario
```

## 🧪 Pruebas del Sistema

### 1. Probar Registro Público
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@ejemplo.com",
    "password": "123456"
  }'
```

### 2. Probar Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sistema.com",
    "password": "admin123"
  }'
```

### 3. Probar Gestión de Usuarios (con token)
```bash
# Obtener usuarios (necesita token de administrador)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 🔧 Comandos Útiles

### Backend
```bash
# Inicializar base de datos
npm run init-db

# Iniciar servidor de desarrollo
npm start

# Verificar conexión a base de datos
node -e "require('./config/database').testConnection()"
```

### Frontend
```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🐛 Solución de Problemas Comunes

### Error de Conexión a Base de Datos
1. Verificar que MySQL esté ejecutándose
2. Comprobar credenciales en `.env`
3. Ejecutar `npm run init-db`

### Error de Token Inválido
1. Limpiar localStorage del navegador
2. Hacer login nuevamente
3. Verificar que JWT_SECRET sea consistente

### Usuario Admin No Existe
1. Ejecutar script de inicialización:
   ```bash
   node scripts/init-database.js
   ```

### Problemas de CORS
1. Verificar que el backend esté en puerto 3000
2. Comprobar configuración de CORS en server.js

## 📝 Notas Importantes

1. **Seguridad:** Cambiar `JWT_SECRET` y contraseña del admin en producción
2. **Base de Datos:** El script maneja creación de tablas automáticamente
3. **Roles:** Solo administradores pueden gestionar otros usuarios
4. **Registro:** Nuevos usuarios se registran como "encargado" por defecto
5. **Indicadores:** Solo los encargados pueden tener indicadores asignados

## 🎯 Próximos Pasos

Con este módulo implementado, ya puedes:

1. ✅ Registrar nuevos usuarios desde la interfaz web
2. ✅ Hacer login y acceder según el rol
3. ✅ Administrar usuarios desde el panel de admin
4. ✅ Asignar indicadores específicos a encargados
5. ✅ Continuar desarrollando otras funcionalidades del sistema

¡El módulo de usuarios está completamente funcional y listo para usar! 🎉