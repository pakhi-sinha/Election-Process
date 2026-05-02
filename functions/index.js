const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const chatRoute = require("./api/chat");

const app = express();

// Safe logging middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});

// Basic middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Temporary test route
app.get("/", (req, res) => {
  res.send("VoteGuide API running");
});

app.get("/api/chat", (req, res) => {
  res.json({ status: "Chat endpoint is reachable. Use POST to interact." });
});

// Routes
app.post("/api/chat", chatRoute);

// Export
exports.api = onRequest(app);
