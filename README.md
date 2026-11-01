# Getting Started

Requires Node.js 24 LTS and npm.

## Clone the project

```bash
git clone <repository-url>
cd <project-folder>
```

## Client

From the project root:

```bash
cd client
npm install
```

Create `client/.env.development`:

```dotenv
VITE_API_URL=http://localhost:3000
```

Start the client from the `client` folder:

```bash
npm run dev
```

## Server

Open a second terminal at the project root:

```bash
cd server
npm install
```

Create `server/.env.local` using `server/.env.example` as a template. Set these local values and fill in any other required variables:

```dotenv
NODE_ENV=development
APP_ENV=local
PORT=3000
WEB_ORIGIN=http://localhost:5173
```

Start the server from the `server` folder:

```bash
npm run dev
```

- Client: http://localhost:5173
- API health check: http://localhost:3000/health

Keep both terminals running. Restart the apps after changing environment variables. Never commit backend secrets.
