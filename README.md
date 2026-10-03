# Flowboard

Flowboard is a collaborative project-management application inspired by Kanban boards. Users can organize work into workspaces, boards, lists, and cards, collaborate with workspace members, and receive real-time activity and notification updates.

This repository contains:

- A React and TypeScript frontend.
- A Spring Boot microservices implementation.
- Docker Compose infrastructure for the microservices architecture.

The `main` branch contains the microservices implementation. The monolith implementation is maintained on the [`monolith`](https://github.com/rajnish612/flowboard-spring-boot/tree/monolith) branch.

## Features

- Google OAuth2 login and cookie-based JWT authentication.
- Workspaces with owners, members, roles, and search.
- Boards with configurable names, descriptions, and backgrounds.
- Kanban lists and cards with create, update, delete, move, and reorder operations.
- Card assignment to workspace members.
- Activity history for workspace changes.
- Real-time task and notification updates over WebSocket/STOMP.
- Kafka-backed notification events in the microservices architecture.
- Pagination and infinite scrolling for workspaces, boards, members, activities, lists, and notifications.
- Responsive React UI for desktop and mobile browsers.

## Technology Stack

### Frontend

- React 19
- TypeScript 6
- Vite
- Tailwind CSS
- Axios
- STOMP.js and SockJS
- Lucide React

### Backend

- Java 21
- Spring Boot 4.1
- Spring Security OAuth2 Resource Server and OAuth2 Client
- Spring Data JPA
- PostgreSQL
- Spring Cloud Gateway
- Spring Cloud Netflix Eureka
- Spring Cloud OpenFeign
- Apache Kafka
- Maven

## Repository Structure

```text
.
├── frontend/             React/Vite application
├── authservice/          Authentication, users, OAuth2, and JWT cookies
├── workspaceservice/     Workspaces, members, boards, and workspace search
├── taskservice/          Lists, cards, activities, task WebSockets, and events
├── notificationservice/  Notification persistence, Kafka consumers, and WebSockets
├── gateway/              API gateway and service discovery routing
├── eureka-server/        Eureka service registry
├── docker/               PostgreSQL initialization scripts
└── docker-compose.yml    Local microservices infrastructure
```

## Prerequisites

Install the following before running the project:

- Java 21
- Maven 3.9 or later
- Node.js 22 or later
- npm
- PostgreSQL 17 or later
- Docker Desktop, if using Docker Compose
- A Google OAuth2 application, if Google login is required

## Configuration and Security

Do not commit credentials, OAuth client secrets, production JWT secrets, or database passwords.

The root `.env` file is used by Docker Compose and is ignored by Git. The monolith block can remain commented when running microservices. For Docker Compose, create it locally using the following shape:

```dotenv
DB_USERNAME=postgres
DB_PASSWORD=change-this-password
JWT_SECRET=replace-with-a-long-base64-compatible-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
COOKIE_SECURE=false
COOKIE_SAME_SITE=Lax
CLIENT_URI=http://localhost:5173
WEBSOCKET_ALLOWED_ORIGINS=http://localhost:5173
AUTH_DB_URL=jdbc:postgresql://postgres:5432/users
WORKSPACE_DB_URL=jdbc:postgresql://postgres:5432/workspace_service
TASK_DB_URL=jdbc:postgresql://postgres:5432/task_db
NOTIFICATION_DB_URL=jdbc:postgresql://postgres:5432/notification_db
EUREKA_URL=http://eureka-server:8761/eureka/
KAFKA_BOOTSTRAP_SERVERS=kafka-1:19092,kafka-2:19092
AUTH_SERVICE_PORT=8000
WORKSPACE_SERVICE_PORT=8082
TASK_SERVICE_PORT=8083
NOTIFICATION_SERVICE_PORT=8084
GATEWAY_PORT=8081
EUREKA_SERVER_PORT=8761
GOOGLE_REDIRECT_URI=http://localhost:8081/login/oauth2/code/google
VITE_API_BASE_URL=http://localhost:8081
VITE_TASK_WS_URL=ws://localhost:8081/ws
VITE_NOTIFICATION_WS_URL=ws://localhost:8081/ws
```

For standalone Spring Boot development, each microservice has an ignored `application-local.properties` file under `src/main/resources`. These local profiles currently use a host PostgreSQL instance, Kafka at `localhost:9092`, and Eureka at `localhost:8761`. In the current checkout, the local profiles for the workspace, task, and notification services use the `users` database; this differs from Docker Compose, which creates separate databases:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/users
spring.datasource.username=postgres
spring.datasource.password=user
```

Replace these values with the credentials for your local PostgreSQL installation. Create the required database before starting a service. The same JWT secret must be used by every service that validates tokens.

The Docker Compose setup uses separate databases for the microservices:

- `users`
- `workspace_service`
- `task_db`
- `notification_db`

This is intentional. Local `application-local.properties` files and Docker Compose are separate development modes.

## Running the Frontend

From the repository root:

```powershell
cd frontend
npm install
npm run dev
```

The Vite development server runs at `http://localhost:5173`.

The frontend environment file should contain URLs matching the backend mode being used. For the microservices gateway:

```dotenv
VITE_API_BASE_URL=http://localhost:8081
VITE_TASK_WS_URL=ws://localhost:8081/ws
VITE_NOTIFICATION_WS_URL=ws://localhost:8081/ws
```

For Docker Compose, the frontend image receives its Vite values through the build arguments in `docker-compose.yml`.

Useful frontend commands:

```powershell
npm run dev
npm run build
npm run lint
npm run preview
```

## Monolith Mode

The monolith branch contains the single-application backend implementation. In monolith mode, authentication, workspaces, boards, tasks, activities, and notifications are handled by one Spring Boot application.

Start the monolith with the local Spring profile:

```powershell
cd monolith
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The local monolith profile is configured for port `8081`. Point the frontend at the monolith:

```dotenv
VITE_API_BASE_URL=http://localhost:8081
VITE_TASK_WS_URL=ws://localhost:8081/ws
VITE_NOTIFICATION_WS_URL=ws://localhost:8081/ws
```

If `monolith/pom.xml` is not present, switch to the monolith branch before running the command above:

```powershell
git switch monolith
```

The monolith and microservices modes are mutually exclusive because both use port `8081` for the browser-facing backend.

## Microservices Mode

The microservices mode consists of the following runtime components:

| Component | Port | Responsibility |
|---|---:|---|
| Eureka Server | `8761` | Service registry |
| Auth Service | `8000` | OAuth2 login, users, JWT authentication |
| API Gateway | `8081` | Client-facing HTTP entry point |
| Workspace Service | `8082` | Workspaces, members, and boards |
| Task Service | `8083` | Lists, cards, activities, and task WebSockets |
| Notification Service | `8084` | Notifications and notification WebSockets |
| Frontend | `3000` in Docker | React application |
| Kafka | `29092`, `39092` | Event transport |

### Run microservices individually

Start PostgreSQL, Kafka, and Eureka first, then start each Spring Boot service in a separate terminal:

```powershell
cd eureka-server
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

```powershell
cd authservice
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

```powershell
cd workspaceservice
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

```powershell
cd taskservice
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

```powershell
cd notificationservice
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

```powershell
cd gateway
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

When using local profiles, ensure PostgreSQL, Kafka, and Eureka are reachable at the hostnames and ports configured in each service's `application-local.properties`.

### Run with Docker Compose

Docker Compose starts PostgreSQL, Eureka, all backend services, Kafka, and the frontend:

```powershell
docker compose up --build
```

Open:

- Frontend: `http://localhost:3000`
- Gateway: `http://localhost:8081`
- Eureka dashboard: `http://localhost:8761`

Stop the stack:

```powershell
docker compose down
```

Stop the stack and remove local database/Kafka volumes only when you intentionally want to reset local data:

```powershell
docker compose down -v
```

## API Routing

When using the gateway, the browser should call `http://localhost:8081`. The gateway discovers backend services through Eureka.

Representative service routes include:

```text
/api/auth/...
/api/workspace/...
/api/board/...
/api/task/...
/api/notification/...
```

The exact gateway prefix depends on the route configuration and service discovery names in the current checkout. Keep the frontend API base URL pointed at the gateway rather than directly at individual services.

## Authentication Notes

- Authentication uses an HTTP-only `AUTH_TOKEN` cookie.
- The frontend Axios client must send credentials.
- Local development uses `COOKIE_SECURE=false` and `SameSite=Lax`.
- Production cross-site deployments generally require HTTPS, `Secure`, `SameSite=None`, matching CORS origins, and credentials enabled on both client and server.
- Configure the Google OAuth redirect URI to match the public backend callback URL for the environment.
- Never reuse a local JWT secret in production.

## Pagination

Paginated endpoints return Spring Data page objects with fields such as:

```json
{
  "content": [],
  "number": 0,
  "totalElements": 0,
  "totalPages": 0
}
```

The frontend requests pages using `page` and `size` query parameters and appends additional results as the user scrolls.

## Development Guidelines

- Keep secrets in local environment files or deployment secret stores.
- Do not commit `application-local.properties`, `.env`, build output, logs, or `node_modules`.
- Preserve the shared JWT secret across token-issuing and token-validating services within one environment.
- Use the gateway as the browser-facing API in microservices mode.
- Use the unpaged internal repository methods only for operations that require complete collections, such as list reordering or service-to-service enrichment.
- Add or update tests when changing authentication, pagination, WebSocket, or event behavior.

## Troubleshooting

### `Illegal base64 character` while creating the JWT decoder

The JWT secret must use a Base64-compatible format expected by the security configuration. Replace invalid local values with one continuous alphanumeric secret and use the same value in every service.

### Frontend cannot reach the backend

Check that:

1. The selected backend mode is running.
2. `VITE_API_BASE_URL` points to the gateway or monolith port.
3. CORS allows `http://localhost:5173` for local Vite development.
4. The browser is not using stale Vite environment values; restart the Vite server after changing `.env`.

### WebSocket connection fails

Check the task and notification WebSocket URLs, the allowed-origin configuration, and whether the gateway or direct service URL is being used consistently.

### PostgreSQL database does not exist

For Docker Compose, recreate the database container from a clean volume:

```powershell
docker compose down -v
docker compose up --build
```

For standalone local development, create the database configured in `application-local.properties` before starting the service.

## License

No license has been declared for this repository. Add a license file before distributing Flowboard or using it as a public dependency.
