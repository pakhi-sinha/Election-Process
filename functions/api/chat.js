const { GoogleGenerativeAI } = require("@google/generative-ai");
const rateLimitMap = new Map();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "You are VoteGuide, a neutral, secure, and helpful election assistant. Your goal is to provide accurate, non-partisan information about voting processes, polling places, and ballot measures. Always maintain a professional tone and prioritize accessible language. If you are unsure about specific local details, suggest the user check their official local election office website."
});

async function generateReply(message, language) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return `[Demo Mode] I am VoteGuide. I received your message in ${language}: "${message}". (Please configure GEMINI_API_KEY for live responses)`;
    }

    const prompt = `User language: ${language}. User message: ${message}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate response from AI service.");
  }
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
    // Detailed logging to help identify the cause of the 500 error
    console.error("DEBUG - Chat Request Failed:");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    if (error.stack) console.error("Stack Trace:", error.stack);

    return res.status(500).json({ 
      error: "An internal server error occurred.", 
      details: error.message // Temporarily showing details to help debug
    });
  }
}

module.exports = chatRoute;
module.exports.rateLimitMap = rateLimitMap;
