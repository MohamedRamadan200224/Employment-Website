require("dotenv").config();
const express = require("express");
const app = express();
const compression = require("compression");
const rateLimit = require("express-rate-limit");

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("upload"));

const cors = require("cors");
app.use(cors());

// Perf P0: gzip JSON lists and static files.
app.use(compression());

// Perf P0: cheap health check (no DB touch). Mounted before the rate
// limiters so monitoring is never throttled.
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Perf P0: rate limiting. Login / register do a bcrypt.compare per
// attempt, which is CPU-heavy and trivially DoS-able without a limit.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message:
    "Too many login/register attempts from this IP, please try again after 15 minutes.",
});
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes.",
});
app.use(limiter);

const auth = require("./routes/Auth");
const jobs = require("./routes/Jobs");
const users = require("./routes/Users");
const requests = require("./routes/Requests");

// Routes must be mounted BEFORE app.listen() — the old code called
// listen() first and mounted the routes afterwards.
app.use("/auth", authLimiter, auth);
app.use("/jobs", jobs);
app.use("/users", users);
app.use("/requests-review", requests);

// NOTE: the backend listens on port 3306 (the MySQL port) by default —
// that is the current behaviour and is deliberately preserved here.
// A follow-up should move it to its own port (e.g. 5000) via PORT in
// BackEnd/.env, because binding the database port blocks running the
// API and MySQL on the same host and confuses proxies.
const PORT = process.env.PORT || 3306;
app.listen(PORT, "localhost", () => {
  console.log(`server is running on port ${PORT}`);
});
