const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("upload"));

const cors = require("cors");
app.use(cors());

const auth = require("./routes/Auth");
const jobs = require("./routes/Jobs");
const users = require("./routes/Users");
const requests = require("./routes/Requests");

app.listen(3306, "localhost", () => {
  console.log("server is running");
});

app.use("/auth", auth);
app.use("/jobs", jobs);
app.use("/users", users);
app.use("/requests-review", requests);
