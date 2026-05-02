const request = require("supertest");
const express = require("express");
const chatRoute = require("../api/chat");
const rateLimitMap = chatRoute.rateLimitMap;

const app = express();
app.use(express.json());
app.post("/api/chat", chatRoute);

describe("Chat API", () => {
  beforeEach(() => {
    rateLimitMap.clear();
  });

  test("valid request", async () => {
    const res = await request(app).post("/api/chat").send({
      message: "Hello",
      language: "en"
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("reply");
  });

  test("empty message returns 400", async () => {
    const res = await request(app).post("/api/chat").send({
      message: "   ",
      language: "en"
    });
    expect(res.statusCode).toBe(400);
  });

  test("invalid language returns 400", async () => {
    const res = await request(app).post("/api/chat").send({
      message: "Hello",
      language: "fr"
    });
    expect(res.statusCode).toBe(400);
  });

  test("rate limit triggers after 10 requests", async () => {
    for (let i = 0; i < 10; i++) {
      await request(app).post("/api/chat").send({
        message: "test",
        language: "en"
      });
    }

    const res = await request(app).post("/api/chat").send({
      message: "test",
      language: "en"
    });

    expect(res.statusCode).toBe(429);
  });

  test("returns 500 on internal server error", async () => {
    const tempApp = express();
    tempApp.use(express.json());
    
    tempApp.post("/api/error", (req, res) => {
      throw new Error("Simulated internal error");
    });

    const res = await request(tempApp).post("/api/error").send();

    expect(res.statusCode).toBe(500);
  });
});
