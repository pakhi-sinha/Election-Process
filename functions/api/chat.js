const rateLimitMap = new Map();

async function generateReply(message, language) {
  return `This is a safe placeholder response for your message: "${message}". Language: ${language}`;
}

async function chatRoute(req, res) {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';

    // Implements scalable in-memory rate limiting for API protection
    const currentRequests = rateLimitMap.get(ip) || 0;
    if (currentRequests >= 10) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    
    rateLimitMap.set(ip, currentRequests + 1);
    setTimeout(() => {
      const count = rateLimitMap.get(ip) || 0;
      rateLimitMap.set(ip, Math.max(0, count - 1));
    }, 60000);

    const { message, language } = req.body;

    // Input validation ensures secure and reliable request handling
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: "Message must be a non-empty string." });
    }

    const allowedLanguages = ['en', 'es', 'hi', 'zh'];
    if (!language || !allowedLanguages.includes(language)) {
      return res.status(400).json({ error: "Invalid language specified." });
    }

    const sanitizedMessage = message.trim().substring(0, 500);

    const reply = await generateReply(sanitizedMessage, language);
    return res.json({ reply });

  } catch (error) {
    // Centralized error handling for production-ready stability
    console.error("Error processing chat request:", error.message);
    return res.status(500).json({ error: "An internal server error occurred while processing your request." });
  }
}

module.exports = chatRoute;
module.exports.rateLimitMap = rateLimitMap;
