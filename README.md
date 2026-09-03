# App Gestión Financiera Corporativa

Sistema integral de gestión de operaciones financieras B2B, cartera de clientes, planes de financiación y control de liquidez/reservas en tiempo real.

## Arquitectura del Proyecto

El proyecto está estructurado como un monorepo pnpm dividido claramente en dos aplicaciones independientes:

```
app-gestion-financiera/
├── frontend/                 # Aplicación React 19 + Vite 8 + Tailwind CSS 4
│   ├── src/                  # Componentes UI, estado, servicios y llamados API
│   ├── index.html            # Shell HTML principal
│   ├── package.json          # Dependencias cliente (React, Vite, Tailwind)
│   ├── tsconfig.json         # Configuración TypeScript para el cliente
│   ├── vite.config.ts        # Configuración de Vite y Proxy /api
│   ├── vercel.json           # Configuración de despliegue SPA en Vercel
│   ├── .env.example          # Plantilla de variables de entorno del frontend
│   └── .gitignore
│
├── backend/                  # API Serverless / Node con Hono y Drizzle ORM
│   ├── src/                  # Código fuente del servidor
│   │   ├── api/index.ts      # Aplicación Hono, middleware CORS y endpoints /api
│   │   ├── db/               # Cliente Drizzle/Turso, esquema, seed y utilidades
│   │   ├── lib/              # Módulo de hash de contraseñas y firma de tokens JWT/HMAC
│   │   ├── types.ts          # Definiciones de tipo del dominio financiero
│   │   └── dev.ts            # Servidor local Hono con @hono/node-server
│   ├── api/index.ts          # Adaptador Vercel Serverless Function `handle(api)`
│   ├── drizzle/              # Migraciones SQL y esquemas de Drizzle ORM
│   ├── drizzle.config.ts     # Configuración de Drizzle Kit
│   ├── package.json          # Dependencias servidor (Hono, Drizzle, LibSQL, tsx)
│   ├── tsconfig.json         # Configuración TypeScript del servidor
│   ├── vercel.json           # Configuración de servidor API en Vercel
│   ├── .env.example          # Plantilla de variables de entorno del backend
│   └── .gitignore
│
├── pnpm-workspace.yaml       # Configuración de workspace de pnpm
├── package.json              # Scripts de la raíz para atajos de ejecución
├── README.md                 # Documentación del proyecto
└── .gitignore
```

---

## Requisitos Previos

- **Node.js**: v18+ o v20+
- **pnpm**: v8+ o v9+

---

## Instalación

Instalar todas las dependencias del monorepo desde la raíz:

```bash
pnpm install
```

---

## Variables de Entorno

### Frontend (`frontend/.env`)
Crear un archivo `.env` en `frontend/`:

```env
# En desarrollo local dejar vacío para usar el proxy de Vite (/api -> localhost:3001)
# En producción colocar la URL del backend desplegado (ej: https://mi-backend.vercel.app)
VITE_API_URL=
```

### Backend (`backend/.env`)
Crear un archivo `.env` en `backend/`:

```env
# Conexión a Turso / LibSQL (En dev se utiliza local.db de forma predeterminada si no está seteado)
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# Secreto criptográfico para firma HMAC de tokens de sesión
AUTH_SECRET=gf_secret_key_prod_32chars_min

# Contraseña inicial para el usuario Osmar Bonaldi
INITIAL_USER_PASSWORD=contraseña_segura_123

# URL del Frontend permitida para CORS con credenciales
FRONTEND_URL=http://localhost:8443

# Puerto local del servidor Hono
PORT=3001
```

---

## Ejecución en Desarrollo

### 1. Iniciar Backend
Ejecuta el servidor de desarrollo Hono en `http://localhost:3001`:

```bash
pnpm dev:backend
# o directamente en backend:
cd backend && pnpm dev
```

### 2. Iniciar Frontend
Ejecuta la interfaz Vite en `http://localhost:8443` (o en el puerto asignado):

```bash
pnpm dev:frontend
# o directamente en frontend:
cd frontend && pnpm dev
```

---

## Comandos de Base de Datos (Drizzle ORM)

Ejecutables desde la raíz o dentro de `backend/`:

- **Generar migraciones SQL**:
  ```bash
  pnpm db:generate
  ```
- **Aplicar cambios de esquema**:
  ```bash
  pnpm db:push
  ```
- **Poblar datos iniciales y usuario por defecto**:
  ```bash
  pnpm db:seed
  ```
- **Crear o actualizar usuario administrador (Osmar Bonaldi)**:
  ```bash
  pnpm db:user
  ```
- **Abrir Drizzle Studio (interfaz gráfica de BD)**:
  ```bash
  pnpm db:studio
  ```

---

## Despliegue Independiente en Vercel

### Despliegue del Backend
1. En el panel de Vercel, crear un nuevo proyecto vinculando el repositorio.
2. Establecer la **Root Directory** a `backend`.
3. Configurar las variables de entorno en Vercel:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `AUTH_SECRET`
   - `FRONTEND_URL` (URL pública del proyecto frontend en Vercel)
4. Desplegar. La API responderá bajo la URL entregada por Vercel.

### Despliegue del Frontend
1. En Vercel, crear un segundo proyecto apuntando al mismo repositorio.
2. Establecer la **Root Directory** a `frontend`.
3. Configurar la variable de entorno en Vercel:
   - `VITE_API_URL` (URL del backend recién desplegado, ej. `https://mi-backend.vercel.app`)
4. Desplegar. El frontend consumirá el backend de producción.
