# App Gestión Financiera Corporativa

Monorepo con dos aplicaciones desplegables de forma independiente:

- `frontend`: React 19, Vite 8 y Tailwind CSS 4.
- `backend`: API Hono sobre funciones de Vercel, Drizzle ORM y Turso/libSQL.

Cada aplicación mantiene dentro de su Root Directory todos los archivos que usa
durante el build de Vercel.

## Arquitectura

```text
backend/
├── api/index.ts                 # Única función serverless de Vercel
├── drizzle/                     # Migraciones versionadas
└── src/
    ├── config/                  # Lectura y validación de variables de entorno
    ├── controllers/             # Traducción HTTP entre frontend y servicios
    ├── errors/                  # Errores de aplicación tipados
    ├── middlewares/             # Auth, CORS, seguridad y manejo de errores
    ├── models/                  # Esquema Drizzle y conexión Turso
    ├── routes/                  # Definición modular de endpoints
    ├── scripts/                 # Seed y administración de usuarios
    ├── services/                # Reglas de negocio y validaciones
    ├── app.ts                   # Composición de la aplicación Hono
    ├── dev.ts                   # Servidor local
    └── types.ts                 # Contratos del dominio
```

La base no ejecuta DDL ni seeds durante una petición. Las migraciones se aplican
explícitamente antes de publicar, evitando consultas extra en cada instancia
serverless. Las mutaciones financieras usan transacciones y validan la empresa del
usuario autenticado.

## Desarrollo local

Requisitos: Node.js 22 y pnpm 10.

```bash
pnpm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
pnpm db:setup
```

En dos terminales:

```bash
pnpm dev:backend
pnpm dev:frontend
```

El frontend usa `/api` y el proxy de Vite hacia `http://localhost:3001` cuando
`VITE_API_URL` está vacío.

## Variables de entorno

### Backend

Configurar en `backend/.env` y en el proyecto backend de Vercel:

```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
AUTH_SECRET=un-secreto-aleatorio-de-al-menos-32-caracteres
FRONTEND_URL=https://mi-frontend.vercel.app,https://mi-frontend-*.vercel.app
INITIAL_USER_PASSWORD=solo-para-seed-o-db-user
PORT=3001
```

Los dominios estables `https://mis-finanzas-ipc.vercel.app` y
`https://mis-finanzas-app-backend.vercel.app` ya están autorizados por el
backend. `FRONTEND_URL` permite agregar otros dominios o previews mediante una
lista separada por comas y un comodín por origen. No uses `*` en producción
salvo que quieras permitir cualquier sitio.

### Frontend

Configurar en `frontend/.env` y en el proyecto frontend de Vercel:

```env
VITE_API_URL=https://mi-backend.vercel.app
```

La URL puede terminar en `/api`; el cliente la normaliza. El build de Vercel falla
de forma explícita si esta variable falta, para evitar que el frontend publicado
intente consultar su propio dominio.

## Base de datos

```bash
pnpm db:generate   # genera migraciones desde src/models/schema.ts
pnpm db:migrate    # aplica migraciones existentes
pnpm db:seed       # carga datos iniciales de forma idempotente
pnpm db:user       # crea o actualiza el usuario administrador inicial
pnpm db:studio
```

Para una base Turso nueva, ejecutar una sola vez:

```bash
pnpm db:setup
```

No agregues `db:migrate` ni `db:seed` al arranque de la función serverless.

## Verificación

```bash
pnpm build:backend
pnpm test:backend
pnpm build:frontend
```

## Despliegue separado en Vercel

Crear dos proyectos desde el mismo repositorio.

### Proyecto backend

1. Elegir `backend` como **Root Directory**.
2. Cargar `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` y `AUTH_SECRET` en
   Production y Preview. Usar `FRONTEND_URL` solamente para orígenes adicionales
   o previews.
3. Aplicar `pnpm db:migrate` contra Turso antes del primer despliegue; ejecutar
   `pnpm db:seed` solamente si se necesitan los datos iniciales.
4. Desplegar y comprobar `https://<backend>/api/health`.

Todo `/api/*` se enruta a una única función Hono, por lo que no se crea una
función por controlador o endpoint.

### Proyecto frontend

1. Elegir `frontend` como **Root Directory**.
2. Cargar `VITE_API_URL` con la URL pública del backend en Production y Preview.
3. Desplegar. `frontend/vercel.json` conserva el fallback SPA para rutas directas.

Después de conocer la URL final del frontend, actualizar `FRONTEND_URL` en el
backend y volver a desplegarlo.

## Optimización de llamadas

- `GET /api/state` agrupa sus consultas Turso mediante el batch de Drizzle.
- Crear operaciones, registrar pagos y editar configuración devuelve los datos
  actualizados; el frontend ya no hace un segundo `GET /api/state` por mutación.
- Los preflight CORS se pueden reutilizar durante 24 horas.
- La API no ejecuta migraciones, creación de tablas ni seed al atender peticiones.
