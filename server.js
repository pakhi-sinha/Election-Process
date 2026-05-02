const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const chatRoute = require("./functions/api/chat");

const app = express();
// Security middleware for HTTP headers protection
app.use(helmet());
// Enables controlled cross-origin access for frontend integration
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("VoteGuide API is running");
});

app.post("/api/chat", chatRoute);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
