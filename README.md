# prueba-paynau — Backend

API REST construida con NestJS + TypeORM + PostgreSQL.

## Prerequisitos

- Node.js >= 20
- pnpm
- Docker y Docker Compose

## Configuración

Copia el archivo de variables de entorno:

```bash
cp backend/.env.example backend/.env
```

Valores por defecto en `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=paynau
DB_PASSWORD=paynau123
DB_NAME=paynau_db

JWT_SECRET=super_secret_key_change_in_production
JWT_EXPIRES_IN=1d
```

## Levantar la base de datos

```bash
cd backend
docker-compose up -d
```

Esto levanta un contenedor PostgreSQL en el puerto `5432`.

## Correr el backend

```bash
cd backend
pnpm install
pnpm start:dev
```

El servidor queda disponible en `http://localhost:3001`.

## Correr el frontend

```bash
cd frontend
pnpm install
pnpm dev
```

La app queda disponible en `http://localhost:5173`.

## Endpoints

Todos los endpoints requieren `Authorization: Bearer <token>` excepto los de auth.

### Auth (público)
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/register` | Registrar usuario |
| `POST` | `/api/auth/login` | Login — devuelve `access_token` |

### Productos
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/products` | Listar productos |
| `POST` | `/api/products` | Crear producto |
| `PATCH` | `/api/products/:id` | Actualizar producto |
| `DELETE` | `/api/products/:id` | Eliminar producto (soft delete) |

### Órdenes
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/orders` | Listar órdenes |
| `POST` | `/api/orders` | Crear orden |

### Ejemplo crear orden
```json
POST /api/orders
Authorization: Bearer <token>

{
  "items": [
    { "productId": "uuid-aqui", "quantity": 2 }
  ]
}
```

---

## Decisiones de simplificación (entorno de prueba)

### Autenticación
- **Sin Passport.js** — el guard valida el JWT directamente con `JwtService`. Passport agrega valor cuando hay múltiples estrategias (Google, GitHub, etc.), pero para JWT único es overhead innecesario.
- **Sin refresh tokens** — el token expira en 1 día y no hay mecanismo de renovación.
- **Un solo tipo de usuario** — no hay roles ni permisos.

### Base de datos
- **`synchronize: true`** — TypeORM crea/altera tablas automáticamente al iniciar. Conveniente en desarrollo, destructivo en producción.
- **Sin migraciones** — no hay historial de cambios en el esquema.

### Módulos
- **Sin paginación** — los `getAll` devuelven todos los registros.

---

## Cómo escalaría en producción

### Autenticación
- Agregar Passport con estrategia JWT + Local para unificar múltiples métodos de login.
- Implementar refresh tokens con rotación y lista de revocación en Redis.
- Roles y permisos con guards por recurso (`@Roles('admin')`).

### Base de datos
- Reemplazar `synchronize: true` por migraciones (`typeorm migration:run`) para tener control total sobre los cambios de esquema.

### Módulos
- Paginación con cursor o offset en todos los `getAll`.
- Caché en `GET /products` con Redis para reducir carga en DB.
- Swagger para la documentación de los endpoint.

### Infraestructura
- Rate limiting por IP con `@nestjs/throttler`.
- Logger centralizado (Pino/Winston) con trazabilidad por request ID.
- CORS y Helmet configurados explícitamente.

---

