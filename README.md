# Backend Tintado

## Descripción

Backend para la gestión de citas, clientes, vehículos, facturación y recibos en un taller de tintado de lunas. Proporciona una API RESTful construida con Express y TypeScript, utilizando Prisma como ORM y autenticación JWT.

## Requisitos previos

- Node.js >= 18
- npm >= 9
- Base de datos MySQL

## Instalación

```bash
cd backend-tintado
npm install
```

## Variables de entorno

Crea un archivo `.env` basado en el ejemplo `.env.example`:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/tu_db
JWT_SECRET=tu_clave_secreta
PORT=3000
```

## Scripts principales

- `npm run dev` — Ejecuta el servidor en modo desarrollo
- `npm run build` — Compila el proyecto para producción
- `npm start` — Inicia el servidor en producción
- `npm run test` — Ejecuta los tests
- `npm run lint` — Linting del código

## Uso

1. Configura tu base de datos y variables de entorno.
2. Ejecuta las migraciones de Prisma:
   ```bash
   npx prisma migrate deploy
   ```
3. Inicia el servidor:
   ```bash
   npm run dev
   ```

## Despliegue

- Asegúrate de definir correctamente las variables de entorno en producción.
- Usa un proceso como PM2 o Docker para producción.

## Seguridad

- No subas tu archivo `.env` ni datos sensibles al repositorio.
- Cambia la configuración de Helmet en producción (ver código fuente).

## Licencia

Ver archivo LICENSE.
