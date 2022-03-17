
require("dotenv/config");

require("./db");

const express = require("express");

const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

const capitalized = require("./utils/capitalized");
const projectName = "rooms-app";

app.locals.appTitle = `${capitalized(projectName)}`;


const index = require("./routes/index.routes");
app.use("/", index);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

require("./error-handling")(app);

module.exports = app;
