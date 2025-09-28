# Digital Boost Plus dashboard client

React front-end for the Digital Boost Plus HighLevel sub-account dashboard.

## Available scripts

```bash
npm run dev     # Start Vite dev server with API proxying to localhost:4000
npm run build   # Build production assets into dist/
npm run preview # Preview the production build
npm run lint    # Run ESLint checks
```

## Environment variables

Create a `.env` file (see `.env.example`) with the proxy target URL:

```
VITE_API_PROXY_TARGET=http://localhost:4000
```

The development server proxies `/api` requests to this backend.

## Project structure

Key files:

* `src/App.jsx` – Dashboard implementation: filters, table, and detail panel.
* `src/App.css` – Styling for the layout and components.
* `vite.config.js` – Configures the dev server proxy so the UI can call the Node API without CORS issues.
