# Prospecting Command Center — Master Build Brief

## Goal & Users

**Goal**: Build a single, daily-use web app for a commercial loan officer to discover, track, and engage local business prospects.

**Primary users**: Commercial Loan Officers (CLOs).

**Secondary users**: Support Agents (research assistants) and Admins.

This folder contains a **very minimal skeleton** of the Prospecting Command Center.  It is *not* a full implementation, but it provides a starting point for hosting a placeholder service on GitHub.  Your GitHub repository will need the following files:

* `README.md` – the document you are reading; use it to document your project and requirements.
* `package.json` – defines the project metadata and dependencies.  It currently pulls in Express so you can run a simple HTTP server.
* `index.js` – a tiny Express server that serves a placeholder message.  In a full application you would replace this with your Next.js or NestJS back‑end.

To run this skeleton locally:

```bash
npm install
npm start
```

Then navigate to `http://localhost:3000` in your browser.  You should see a placeholder message.

For a complete system you would replace this skeleton with your Next.js front‑end and NestJS or FastAPI back‑end, along with any ETL pipelines, database migrations, and configuration files described in the specification.
