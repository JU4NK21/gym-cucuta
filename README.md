# 🏋️ App Gym Cúcuta — Sistema Completo

## Estructura del Proyecto

```
gym-cucuta/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       ← Login, registro, perfil
│   │   ├── validacionController.js ← Aprobar/rechazar entrenadores
│   │   └── usuariosController.js   ← Gestión de usuarios
│   ├── db/
│   │   ├── database.js             ← SQLite + esquema
│   │   └── gymcucuta.db            ← Base de datos (se crea automático)
│   ├── middleware/
│   │   └── auth.js                 ← Verificación JWT y roles
│   ├── routes/
│   │   ├── auth.js
│   │   ├── validacion.js
│   │   └── usuarios.js
│   ├── .env                        ← Variables de entorno
│   ├── package.json
│   └── server.js                   ← Punto de entrada
└── frontend/
    ├── css/
    │   ├── auth.css
    │   ├── base.css
    │   ├── components.css
    │   └── navbar.css
    ├── js/
    │   ├── auth.js     ← Servicio de autenticación
    │   ├── rbac.js     ← Control de acceso por roles
    │   ├── app.js      ← Router principal
    │   ├── store.js
    │   ├── utils.js
    │   └── data.js
    ├── pages/
    │   ├── inicio.js
    │   ├── registro.js
    │   ├── miembros.js
    │   ├── informes.js
    │   ├── eventos.js
    │   ├── validacion.js  ← Panel admin entrenadores
    │   └── soporte.js
    └── index.html
```

---

## ⚡ Instalación y arranque

### 1. Instalar Node.js
Descarga e instala desde: https://nodejs.org (versión LTS)

### 2. Instalar dependencias del backend
Abre una terminal en la carpeta `backend/` y ejecuta:
```bash
npm install
```

### 3. Iniciar el servidor
```bash
npm start
```
Verás en la terminal:
```
🏋️  Gym Cúcuta Backend corriendo en http://localhost:3000
🔑  Admin por defecto: admin@gymcucuta.com / Admin1234!
```

### 4. Abrir el frontend
Abre VS Code → carpeta `frontend/` → clic derecho en `index.html` → **Open with Live Server**

O simplemente abre en el navegador: http://localhost:3000

---

## 👤 Usuarios del sistema

| Rol | Email | Contraseña | Acceso |
|-----|-------|------------|--------|
| Admin | admin@gymcucuta.com | Admin1234! | Completo |
| Cliente | (regístrate) | (la que pongas) | Inicio, Eventos, Soporte |
| Entrenador | (regístrate) | (la que pongas) | Requiere aprobación del admin |

---

## 🔐 Roles y permisos

| Sección | Admin | Entrenador | Cliente |
|---------|-------|------------|---------|
| Inicio | ✅ | ✅ | ✅ |
| Registrar miembro | ✅ | ✅ | ❌ |
| Miembros | ✅ | ✅ | ❌ |
| Informes | ✅ | ❌ | ❌ |
| Eventos | ✅ | ✅ | ✅ |
| Validaciones | ✅ | ❌ | ❌ |
| Soporte | ✅ | ✅ | ✅ |

---

## 🔌 API Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/registro | Registrar usuario |
| POST | /api/auth/login | Iniciar sesión |
| GET  | /api/auth/perfil | Perfil del usuario autenticado |

### Validaciones (solo admin)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/validacion | Listar solicitudes |
| PUT | /api/validacion/:id/aprobar | Aprobar entrenador |
| PUT | /api/validacion/:id/rechazar | Rechazar entrenador |

### Usuarios (solo admin)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/usuarios | Listar todos |
| PUT | /api/usuarios/:id | Actualizar |
| DELETE | /api/usuarios/:id | Eliminar |
