// Vercel serverless entry point: every request (rewritten by vercel.json)
// runs through the Express app. There is no app.listen() here — Vercel
// invokes this function per request. The MySQL pool (db/dbconnection.js)
// is created at import and opens connections lazily, so requiring the app
// here is safe.
const app = require('../app');

module.exports = app;
