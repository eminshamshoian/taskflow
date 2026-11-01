Express + TypeScript API and Vite React App
A local full-stack setup with an Express API, a Vite React frontend, validated environment configuration, and a health-check request connecting the two.
This README follows the code shared during setup. Folder names below assume backend/ and frontend/; substitute your actual names. Package scripts are suggested configurations, not verified repository contents.

Prerequisites

- Node.js 24 LTS and npm.
- A terminal and code editor.
- Any external services required by your backend configuration, such as PostgreSQL if your application connects to it.
  Check your installation:
  node --version
  npm --version
  Project layout
  backend/
  .env.example
  .env.local # ignored by Git
  package.json
  src/
  config/env.ts
  server.ts
  frontend/
  .env.development
  .env.production
  package.json
  src/
  config/env.ts
  services/api.ts
  App.tsx

1. Install dependencies
   From the project root, install each application's dependencies:
   cd backend
   npm install
   In a second terminal, starting from the project root:
   cd frontend
   npm install
   If backend dependencies are not already declared, add the packages used by this setup:
   npm install express cors zod
   npm install -D typescript tsx @types/node @types/express @types/cors
   Run those commands inside backend/. Zod is needed if your config/env.ts uses the validation schema from setup.
2. Configure backend environment variables
   Create backend/.env.local:
   NODE_ENV=development
   APP_ENV=local
   PORT=3000
   WEB_ORIGIN=http://localhost:5173
   LOG_LEVEL=debug

# Required if retained in your backend environment validation schema:

DATABASE_URL=postgresql://app:local_password@localhost:5432/app_local
JWT_SECRET=replace_with_a_generated_secret
Generate a local signing secret:
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
Paste the generated value into JWT_SECRET. Never use the placeholder as a real secret.
Variable Purpose
NODE_ENV Framework behavior: development, test, or production.
APP_ENV Deployment label: local, test, development, staging, or production.
PORT Port on which Express listens.
WEB_ORIGIN Exact browser origin allowed to read API responses through CORS.
LOG_LEVEL Logging level, if used by the application logger.
DATABASE_URL Database connection string, if required by the application.
JWT_SECRET Private signing secret, if using HMAC JWT authentication.

Your health route does not itself connect to a database or sign JWTs. However, variables retained as required fields in src/config/env.ts must still be supplied for validation to pass. Remove unused fields from the schema if those features are not implemented yet.

Commit a backend/.env.example documenting the same keys with safe example values and an empty JWT_SECRET. Each developer creates their own .env.local from that template.

In the backend .gitignore, add:
.env
.env.\*
!.env.example
node_modules/
dist/
Read process.env in src/config/env.ts, validate once, and import the resulting env object elsewhere. Do not log the entire configuration object. 3. Configure frontend environment variables
Create frontend/.env.development:
VITE_API_URL=http://localhost:3000
Vite loads this file when running its default development server. Restart Vite after changing it.

For production, set VITE*API_URL to your real HTTPS API address in the build environment or frontend/.env.production:
VITE_API_URL=https://api.example.com
Replace the example domain before deployment. Public environment files may be committed. Personal overrides belong in .env.development.local; ignore local overrides:
.env.local
.env.\*.local
node_modules/
dist/
All VITE* values used in browser code are public. Never put database passwords, JWT secrets, or private API keys in them.

Keep frontend configuration in frontend/src/config/env.ts:
const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
throw new Error("Missing VITE_API_URL");
}

const parsedUrl = new URL(apiUrl);

if (!["http:", "https:"].includes(parsedUrl.protocol)) {
throw new Error("VITE_API_URL must use HTTP or HTTPS");
}

export const env = Object.freeze({
apiUrl: apiUrl.replace(/\/+$/, ""),
});
Add the variable to frontend/src/vite-env.d.ts, retaining the Vite type reference:
/// <reference types="vite/client" />

interface ImportMetaEnv {
readonly VITE_API_URL: string;
}

interface ImportMeta {
readonly env: ImportMetaEnv;
}
Type declarations provide autocomplete; the configuration module checks actual values. 4. Confirm startup scripts
Suggested backend package.json fields for an ESM project:
{
"type": "module",
"scripts": {
"dev": "node --env-file=.env.local --watch --import=tsx src/server.ts",
"typecheck": "tsc --noEmit",
"build": "tsc",
"start": "node dist/server.js"
}
}
Merge these fields into the existing package file; do not replace its dependencies. The build/start examples require a TypeScript configuration that compiles src/server.ts to dist/server.js, typically rootDir: "src", outDir: "dist", and NodeNext module settings.

Suggested scripts for a standard Vite React TypeScript frontend:
{
"scripts": {
"dev": "vite",
"build": "tsc -b && vite build",
"build:staging": "tsc -b && vite build --mode staging",
"preview": "vite preview"
}
}
Keep your scaffold's existing TypeScript check if it differs. A staging build needs an appropriate .env.staging or build-environment variables. vite preview is for checking a local build, not production hosting. 5. Start both applications
In the backend terminal:
npm run dev
Expected backend log:
[server]: Server is running on port 3000 (local)
In the frontend terminal:
npm run dev
Open the address printed by Vite, normally http://localhost:5173.

The two applications run as separate processes. Keep both terminals running. If Vite selects a different port, update backend WEB_ORIGIN to match and restart the backend. 6. Verify the health endpoint
The current Express route returns a message field:
app.get("/health", (\_req: Request, res: Response) => {
res.status(200).json({ message: "TS Node.js server is running" });
});
Open http://localhost:3000/health directly in a browser. Expect HTTP 200 and:
{ "message": "TS Node.js server is running" }
Your existing frontend service in src/services/api.ts sends the request:
import { env } from "../config/env";

export async function getHealth() {
const response = await fetch(`${env.apiUrl}/health`);

if (!response.ok) {
throw new Error(`Request failed: ${response.status}`);
}

return response.json();
}
In App.tsx, call that service in an effect and display data.message, matching the backend response:
import { useEffect, useState } from "react";
import { getHealth } from "./services/api";

export default function App() {
const [status, setStatus] = useState("Checking API...");

useEffect(() => {
let active = true;

    async function checkHealth() {
      try {
        const data = await getHealth();

        if (active) {
          setStatus(data.message);
        }
      } catch (error) {
        if (active) {
          setStatus(
            error instanceof Error ? error.message : "Cannot reach API",
          );
        }
      }
    }

    void checkHealth();

    return () => {
      active = false;
    };

}, []);

return <h1>{status}</h1>;
}
The cleanup prevents an old effect's request from updating component state. It does not cancel the request. Development Strict Mode may run the effect twice as part of its setup/cleanup checks.

This health route confirms that the HTTP server responds. It does not verify database availability or other dependencies. 7. Configure CORS
Register CORS middleware in Express before routes:
app.use(cors({ origin: env.WEB_ORIGIN }));
app.use(express.json());
For local development:

- Browser origin: http://localhost:5173.
- API address: http://localhost:3000.
  Different ports mean different origins. A successful HTTP response can still be unreadable to browser JavaScript when the CORS header is missing. Opening the API directly in a browser does not verify cross-origin access.

In DevTools → Network → health → Headers, verify:
Access-Control-Allow-Origin: http://localhost:5173
CORS controls browser access to responses; it is not authentication or authorization.
Environments and deployment
Environment Backend NODE_ENV Backend APP_ENV Frontend Vite mode
Local development local development
Automated tests test test Set by the test setup
Staging production staging staging
Production production production production

Use separate databases and secrets per environment. For deployed backend environments, inject configuration through the hosting platform's environment/secret settings, then run the compiled server. Do not commit production secrets or bake them into Docker images.

Frontend environment values are embedded when Vite builds the app. Changing hosting variables after deploying dist/ does not update an existing bundle: rebuild and redeploy. Backend variables are read when its process starts.
Troubleshooting
Symptom Check or fix
Failed to fetch Confirm Express is running, VITE_API_URL is correct, and the browser Console has no CORS error.
HTTP 200 but React cannot read the response Check CORS middleware order and exact WEB_ORIGIN, including scheme and port, without a trailing slash.
API status: undefined The backend returns message; use data.message, not data.status.
Missing or invalid configuration Supply all required schema fields and run the backend from the directory containing .env.local.
Frontend env change has no effect Restart Vite in development; rebuild and redeploy a production bundle.
Two health requests in development React Strict Mode can run an extra effect setup/cleanup cycle.
Port already in use Stop the other process or change the port and update related API/CORS configuration.

Reference documentation

- Node.js environment files
- Vite environment variables and modes
- Express CORS middleware
- React useEffect
