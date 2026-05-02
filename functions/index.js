const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");

const app = express();

// Basic middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Temporary test route
app.get("/", (req, res) => {
  res.send("VoteGuide API running");
});

// Export
exports.api = onRequest(app);
