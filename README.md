# Global Conflict Impact Dashboard on SDGs

## Problem Statement
Build a dashboard that analyzes how ongoing conflicts are affecting Sustainable Development Goal (SDG) indicators across countries.

## Key Features Implemented
- **Authentication + roles**: Sign up / sign in flow with session token storage; role-based access where **admins** can publish updates and **users** are read-only.
- **Multi-view dashboard**: Tabbed UI to switch between **Violence analytics**, **SDG indicators**, and **War updates**.
- **Violence analytics (data exploration)**:
	- Interactive **world map** (click a country to view incidents by year).
	- **Trend chart** of total political violence events by year.
	- **Country comparison** bar chart for a selected/latest year in the dataset.
	- **Top countries** ranking by total events.
- **SDG indicators (conflict impact)**:
	- Selectable SDGs (currently SDG 1, 2, and 16).
	- Metric cards, **before vs after** comparison, country impact scores, 5-year trend, and conflict timeline.
	- Refresh action to re-load the selected SDG view.
- **War updates feed (live)**: Users see new conflict messages instantly via **Server-Sent Events (SSE)**; admins can post updates which are pushed to all connected clients.
- **Backend REST API (Express)**: Health endpoint, auth endpoints, and war-updates endpoints with JSON persistence.

## Tech Stack Used
- **Frontend**: React 18 (Create React App), JavaScript, CSS
- **Data visualization**: Recharts (charts), react-simple-maps + topojson-client (interactive world map)
- **Backend**: Node.js + Express (REST API), CORS
- **Data & storage**: Local JSON files for SDG/violence datasets and war updates; XLSX utility for data import script

## System Architecture
- **Client–server**: React SPA frontend (port 3000) + Express backend API (port 8000).
- **Configuration**: Frontend can point to a different API via `REACT_APP_API_BASE_URL`.
- **Data approach**:
	- Violence analytics reads from a local dataset (`src/data.json`).
	- SDG “conflict impact” indicators are represented in-app (mocked/static data for demo) and visualized with charts/cards.
	- War updates are stored in a backend JSON file and served via REST + streamed live via SSE.

## API Structure
**Base URL**: `http://localhost:8000`

**Formats**
- Request body: JSON (`Content-Type: application/json`) for POST endpoints.
- Success: JSON.
- Errors: JSON like `{ "error": "..." }` with HTTP status codes.
- Auth header (recommended): `Authorization: Bearer <token>`.
- Auth header (also supported): `Authorization: Basic <base64(email:password)>`.

**Endpoints**
- `GET /api/health` → `200 { "ok": true }`
- `POST /api/auth/signup`
	- Body: `{ "email": "user@example.com", "password": "..." }`
	- `201 { "message": "Account created. You can sign in now." }`
- `POST /api/auth/login`
	- Body: `{ "email": "user@example.com", "password": "..." }`
	- `200 { "token": "<uuid>", "user": { "email": "...", "role": "admin|user" } }`
- `GET /api/war-updates`
	- `200 { "updates": [ { "id": "...", "message": "...", "author": "..." }, ... ] }`
- `POST /api/war-updates` (**admin-only**)
	- Auth: required
	- Body: `{ "message": "..." }`
	- `201 { "update": { "id": "...", "message": "...", "author": "..." } }`
- `GET /api/war-updates/stream` (SSE)
	- Streams events: `event: war-update` with JSON update payload.

## Authentication & Role-Based Access Control (RBAC)
- **Mechanism**: Token-based sessions. On login, the server creates a session and returns a UUID token.
- **Client storage**: Frontend stores `authToken` + role in `localStorage`.
- **Authorization rules**:
	- Any authenticated user can view the dashboard.
	- Only **admins** can publish (`POST /api/war-updates`). Non-admins receive `403`.

## Core Engineering Concepts Applied
- **API design**: REST endpoints, JSON contracts, status codes, validation + error handling.
- **Data modelling**: Structured JSON objects for users, updates, and analytics datasets.
- **Authentication & authorization**: Session token + role checks (admin vs user).
- **System architecture**: Clear separation between UI and backend services.

## Trade-offs Encountered (Honest)
- **Performance vs Security**: In-memory sessions + token in `localStorage` is simple/fast for a demo, but not as strong as production approaches (hashed passwords, expiry/refresh, DB-backed sessions, httpOnly cookies).
- **Scalability vs Cost**: JSON-file persistence is cheap and quick, but doesn’t scale like a database for concurrent writes and querying.
- **Usability vs Complexity**: Chose SSE for live updates because it’s simpler than WebSockets for one-way push; still adds less complexity than a full real-time bidirectional system.

## Most Challenging Problems
- **SDG indicator sourcing**: Finding a single, reliable “conflict → SDG impact per country” API/data source was difficult, so indicators were consolidated from smaller reports and summarized into clear dashboard metrics.
- **Country naming mismatches**: Aligning dataset country names with map geography labels required normalization and aliasing.

## Design Decision Example
- **Tabbed dashboard UI** instead of multi-page routing: fewer moving parts, easier demo flow, and simpler state handling than setting up full routing.

## Advanced Concepts Used
- **Real-time updates**: Implemented live war updates using **Server-Sent Events (SSE)**.
- **Not used**: Redux/Context state management, background jobs/queues, third-party live data APIs.

## Stakeholders
- **Users**: Explore dashboards and read war updates.
- **Admin**: Publishes official war updates.
- **External systems**: Public world-geometry source for the map; research sources used to inform SDG indicator narratives.

## Run Locally
- Frontend: `npm install` then `npm start` (defaults to http://localhost:3000)
- Backend API: `npm run start:api` (defaults to http://localhost:8000)
- Optional env: set `REACT_APP_API_BASE_URL` if your API runs elsewhere.

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
