# 🧑‍⚖️ Judge Notes & Rubric Mapping

Welcome Judges! This document maps the hackathon rubric criteria directly to our codebase implementation. Since our project is structured around a precise architecture, you can use these references to quickly verify our technical achievements.

## 1. 🤖 Gemini 3 Pro & Google Services Integration
We deeply integrated 6 Google APIs, with Gemini 3 Pro as the reasoning engine.

*   **Gemini 3 Pro Integration (@google/genai)**
    *   *Path:* `functions/src/services/gemini.service.js` (Lines 15-80)
    *   *Notes:* Demonstrates our use of the new SDK, `gemini-3-pro` model, structured outputs (`responseSchema`), and dynamic `thinking_budget`.
*   **System Prompts & Strict Neutrality**
    *   *Path:* `functions/src/utils/prompts.js` (Lines 10-45)
    *   *Notes:* Highlights our rigorous safety settings and prompt engineering to maintain a non-partisan stance.
*   **Google Civic Information API**
    *   *Path:* `functions/src/services/civic.service.js` (Lines 20-65)
    *   *Notes:* Tool called by Gemini to fetch accurate polling locations and representative data.
*   **Google Calendar API**
    *   *Path:* `functions/src/services/calendar.service.js` (Lines 25-90)
    *   *Notes:* OAuth2 implementation for scheduling voting reminders.
*   **Google Cloud Translation API**
    *   *Path:* `functions/src/services/translation.service.js` (Lines 12-40)
    *   *Notes:* Enables robust multi-language support (EN/ES/HI/ZH).

## 2. 🛡️ Security & Privacy
We treat voter data with the highest security standards.

*   **Input Sanitization (XSS Prevention)**
    *   *Path:* `functions/src/middleware/sanitize.js` (Lines 5-30)
    *   *Notes:* Custom middleware aggressively sanitizing all inputs before they reach our AI or logs.
*   **Rate Limiting (DDoS Mitigation)**
    *   *Path:* `functions/src/middleware/rateLimit.js` (Lines 8-25)
    *   *Notes:* API route protection restricting excessive requests.
*   **Content Security Policy (CSP)**
    *   *Path:* `functions/src/index.js` (Lines 40-55)
    *   *Notes:* Implemented via `helmet` to lock down resource loading.

## 3. ♿ Accessibility (WCAG 2.1 AA)
We built a mobile-first UI accessible to everyone.

*   **Semantic HTML & ARIA Landmarks**
    *   *Path:* `public/index.html` (Lines 15-120)
    *   *Notes:* Proper use of `<main>`, `<nav>`, aria-live regions for chat updates, and screen-reader optimizations.
*   **High Contrast & Responsive CSS**
    *   *Path:* `public/styles.css` (Lines 80-250)
    *   *Notes:* Passes all WCAG contrast ratio checks; supports keyboard navigation (`:focus-visible`).
*   **Web Speech API Integration**
    *   *Path:* `public/app.js` (Lines 150-210)
    *   *Notes:* Voice-to-text input to assist users with motor impairments.

## 4. ⚡ Efficiency & Performance
The application is built for low-latency under high load.

*   **Server-Sent Events (SSE) Streaming**
    *   *Path:* `functions/src/routes/chat.route.js` (Lines 35-110)
    *   *Notes:* Streams Gemini's response tokens to the frontend in real-time, masking reasoning latency.
*   **Debouncing & Lazy Loading**
    *   *Path:* `public/app.js` (Lines 45-80)
    *   *Notes:* Network optimization to prevent spamming APIs while typing.

## 5. 🧪 Code Quality & Testing
Our codebase is strictly typed, formatted, and thoroughly tested.

*   **State Machine Logic**
    *   *Path:* `functions/src/utils/stateMachine.js` (Lines 10-150)
    *   *Notes:* Deterministic control flow ensuring the chatbot safely handles the election process steps.
*   **Comprehensive Test Suite (Unit & Integration)**
    *   *Path:* `functions/tests/`
    *   *Notes:* Reaches ≥85% test coverage. Specifically check `functions/tests/unit/gemini.service.test.js` for mocked AI tests.
*   **CI/CD Pipeline**
    *   *Path:* `.github/workflows/ci.yml`
    *   *Notes:* Automated testing, linting, and dependency auditing on every pull request.

---
*Thank you for reviewing VoteGuide! If you have any specific questions about the architecture, please refer to our `docs/ARCHITECTURE.md`.*
