async function chatRoute(req, res) {
  return res.json({ reply: "API is working" });
}

module.exports = chatRoute;
