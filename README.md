# Quave Code Challenge

## Overview

This project is a full-stack application composed of a **React** and an **ASP.NET Core** connected to a **SQL Server** database. The environment is containerized using Docker to streamline local development and ensure consistent setup.

---

## Project Structure

```bash
.
├── backend                     
│   ├── QuaveChallenge.API/      # ASP.NET Core API project
│   ├── entrypoint.sh            # For waiting DB to run migrations and start app
│   └── Dockerfile.dev           # Dockerfile for backend
├── frontend                  
│   ├── [...]                    # Frontend application
│   └── Dockerfile.dev           # Dockerfile for frontend
├── db
│   └── init-db.sh               # Script to create a DB
├── docker-compose-dev.yml       # Docker Compose config for development
├── start-dev.sh                 # Script to build and run the environment
```
---

## How to Start (Development Mode)

Make sure you have **Docker** and **Docker Compose** installed.

Then simply run:

```bash
./start-dev.sh
```

This script will:

1. Stop and remove existing containers defined in `docker-compose-dev.yml`.
2. Rebuild all images without using the cache.
3. Start all services in detached mode.

After the build process finished, you can access the application opening [this link](http://localhost:3000/).

To seek available endpoints in API, please access [swagger](http://localhost:5203/swagger/index.html).

---

## Services and Ports

| Service     | Description                  | Port        |
|-------------|------------------------------|-------------|
| frontend    | React development server     | `3000`      |
| backend     | ASP.NET Core API             | `5203`      |
| sqlserver   | SQL Server (2019 Express)    | `1433`      |

---

## Real-time Communication

The application implements real-time communication between the frontend and backend using SignalR:

### Backend Implementation
- The backend uses ASP.NET Core SignalR to broadcast changes when check-ins and check-outs occur
- The SignalR hub is available at `http://localhost:5203/eventHub`
- Events are transmitted with the following parameters:
  - `eventType`: The type of event (e.g., "check-in", "check-out")
  - `communityId`: The ID of the community where the event occurred
  - `personId`: The ID of the person who was checked in/out

### Frontend Implementation
- The frontend uses the `@microsoft/signalr` package to connect to the backend
- Real-time updates are processed through a state management system that:
  1. Updates the React Query cache directly to avoid unnecessary network requests
  2. Provides optimistic UI updates for immediate user feedback

---

## Backend Initialization

The backend uses `entrypoint.sh` to:

1. Wait until the `mssqltools` container finishes executing database initialization via `init-db.sh`.
2. Apply Entity Framework migrations.
3. Launch the ASP.NET Core backend using `dotnet watch`.

---

## Database

The database credentials are defined in `docker-compose-dev.yml`:

- User: `sa`
- Password: `QuaveRoot123!`

---

## Notes

- The frontend and backend each have their own `Dockerfile.dev` located in their respective folders.
- The `dockersock` service is used to provide access to the host Docker socket (for scenarios where container introspection might be needed).
- The SignalR implementation provides automatic reconnection with exponential backoff for reliable real-time updates.