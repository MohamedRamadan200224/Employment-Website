// Local / long-running entry point. On Vercel the app is served
// from api/index.js instead (no listen there).

const app = require('./app');

// NOTE: the backend listens on port 3306 (the MySQL port) by default —
// that is the current behaviour and is deliberately preserved here.
// A follow-up should move it to its own port (e.g. 5000) via PORT in
// BackEnd/.env, because binding the database port blocks running the
// API and MySQL on the same host and confuses proxies.
const PORT = process.env.PORT || 3306;
// NOTE: no host argument — the server must listen on all interfaces
// (0.0.0.0) so a host's reverse proxy (Render, etc.) can reach it.
// Binding "localhost" made the service unreachable when deployed.
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
