const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const chatRoute = require("./functions/api/chat");

const app = express();

// Security middleware for HTTP headers protection
app.use(helmet());
// Enables controlled cross-origin access for frontend integration
app.use(cors());
app.use(express.json());

// Serve static frontend files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// API Route
app.post("/api/chat", chatRoute);

// Fallback route to serve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
