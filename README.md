# Trivia Backend

API REST construida con **Node.js** y **Express** para la aplicación móvil de trivias desarrollada en Flutter. Usa **PostgreSQL** como base de datos y está completamente dockerizada.

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [Docker](https://www.docker.com/) y Docker Compose
- (Opcional) [Git](https://git-scm.com/)

---

## Inicio rápido

### 1. Clonar el repositorio

```bash
git clone https://github.com/diemerinor/trivia-backend.git
cd trivia-backend
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y ajusta los valores si es necesario:

```bash
cp .env.example .env
```

### 3. Levantar con Docker Compose (recomendado)

Este comando construye la imagen del backend y levanta los tres servicios (PostgreSQL, pgAdmin y la API):

```bash
docker compose up --build -d
```

| Servicio   | URL                          | Credenciales                          |
| ---------- | ---------------------------- | ------------------------------------- |
| **API**    | http://localhost:3000        | —                                     |
| **pgAdmin**| http://localhost:8081        | `admin@trivia.com` / `admin`          |
| **PostgreSQL** | `localhost:5432`         | `postgres` / `postgres` / `trivia_db` |

> Al registrar el servidor en pgAdmin, usa el host `db` (nombre del servicio en Docker), no `localhost`.

### 4. Desarrollo local (sin Docker para el backend)

Si prefieres ejecutar solo la base de datos en Docker y el backend en tu máquina:

```bash
# Levantar solo PostgreSQL y pgAdmin
docker compose up db pgadmin -d

# Instalar dependencias
npm install

# Iniciar en modo desarrollo (con hot-reload)
npm run dev
```

---

## Scripts disponibles

| Comando         | Descripción                                  |
| --------------- | -------------------------------------------- |
| `npm start`     | Inicia el servidor en modo producción        |
| `npm run dev`   | Inicia con nodemon (reinicio automático)     |
| `npm test`      | Ejecuta los tests (pendiente de configurar)  |

---

## Endpoints de la API

### `GET /api/status`

Health-check del servidor.

```json
{
  "status": "ok",
  "mensaje": "El servidor de Trivia está corriendo 🚀",
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

### `GET /api/preguntas`

Devuelve un arreglo de preguntas de trivia (datos de prueba por ahora).

```json
{
  "total": 3,
  "preguntas": [
    {
      "id": 1,
      "categoria": "Ciencia",
      "pregunta": "¿Cuál es el planeta más grande del sistema solar?",
      "opciones": ["Marte", "Júpiter", "Saturno", "Neptuno"],
      "respuestaCorrecta": 1
    }
  ]
}
```

---

## Estructura del proyecto

```
trivia-backend/
├── src/
│   ├── config/
│   │   └── db.js              # Pool de conexión a PostgreSQL
│   ├── routes/
│   │   ├── status.js           # GET /api/status
│   │   └── preguntas.js        # GET /api/preguntas
│   └── server.js               # Punto de entrada de la aplicación
├── .env.example                # Plantilla de variables de entorno
├── .gitignore
├── .dockerignore
├── Dockerfile                  # Imagen multi-stage para producción
├── docker-compose.yml          # Orquestación de servicios
├── package.json
└── README.md
```

---

## Docker

### Levantar todos los servicios

```bash
docker compose up --build -d
```

### Ver logs en tiempo real

```bash
docker compose logs -f backend
```

### Detener servicios

```bash
# Mantiene los datos de PostgreSQL
docker compose down

# Elimina también los volúmenes (borra la BD)
docker compose down -v
```

---

## Variables de entorno

| Variable       | Descripción                      | Valor por defecto |
| -------------- | -------------------------------- | ----------------- |
| `PORT`         | Puerto del servidor              | `3000`            |
| `DB_HOST`      | Host de PostgreSQL               | `localhost`       |
| `DB_PORT`      | Puerto de PostgreSQL             | `5432`            |
| `DB_USER`      | Usuario de PostgreSQL            | `postgres`        |
| `DB_PASSWORD`  | Contraseña de PostgreSQL         | `postgres`        |
| `DB_NAME`      | Nombre de la base de datos       | `trivia_db`       |

---

## Tecnologías

- **Runtime:** Node.js 20
- **Framework:** Express 5
- **Base de datos:** PostgreSQL 15
- **Contenedores:** Docker + Docker Compose
- **Frontend:** Flutter (repositorio separado)

---

## Licencia

ISC
