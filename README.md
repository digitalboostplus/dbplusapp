# dbplusapp

An internal dashboard that surfaces HighLevel sub-account (location) data for your Digital Boost Plus agency team.

The project includes a Node.js proxy server that wraps the HighLevel API and a Vite + React front-end that consumes it.

## Prerequisites

* Node.js 18+
* npm 9+
* A HighLevel private app with the `locations.readonly` scope (and optionally `locations.write` if you plan to extend the proxy with mutations)

## Environment variables

Copy the example files and populate them with your agency credentials.

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Update the `server/.env` values:

* `HIGHLEVEL_ACCESS_TOKEN` – OAuth access token issued for your private app.
* `HIGHLEVEL_AGENCY_ID` – Your agency (company) ID. If omitted, the API will require you to provide it on each request.
* `HIGHLEVEL_BASE_URL` – Optional override for the LeadConnector base URL.
* `HIGHLEVEL_API_VERSION` – API version header (defaults to `2021-07-28`).
* `PORT` – Local port for the proxy server (defaults to `4000`).

The `client/.env` file only needs `VITE_API_PROXY_TARGET`, which should match the proxy server’s URL.

## Installation

Install dependencies for both workspaces.

```bash
cd server && npm install
cd ../client && npm install
```

## Running locally

In separate terminals:

```bash
# Terminal 1 – proxy API server
cd server
npm run dev

# Terminal 2 – React front-end
cd client
npm run dev
```

The React app proxies `/api/*` requests to the Node server (see `client/vite.config.js`), which then calls HighLevel.

## Production build

To create a production build of the front-end:

```bash
cd client
npm run build
```

Serve the generated `client/dist` folder via your hosting platform and deploy the Node proxy to your preferred environment (Render, Fly.io, AWS, etc.).

## HighLevel integration notes

* The proxy batches `GET /locations/locations/search` calls until it collects all pages when `all=true` is supplied.
* Responses are cached briefly (60s) via `node-cache` to keep repeated UI loads fast.
* Error responses from the upstream API are surfaced with their payload to aid troubleshooting.
* Extend `server/src/app.js` with `PUT`/`DELETE` endpoints when you are ready to add editing features.

## Project structure

```
client/  – React front-end
server/  – Express proxy API
```
