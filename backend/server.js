const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN
        ? process.env.ALLOWED_ORIGIN.split(",").map(x => x.trim())
        : true
}));

app.use(express.json({ limit: "20kb" }));

const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const instructions = `
You are AM Digital AI, the official AI assistant of AM Digital Studio.

Your role:
- Help visitors understand AM Digital Studio and its creative digital services.
- Answer general questions helpfully and professionally.
- Communicate naturally in Sinhala or English, matching the visitor's language.
- Explain services such as graphic design, video editing, YouTube thumbnails,
  logo design, photo editing, social media designs and CV design.
- If asked about prices, delivery times, or availability, do not invent details.
  Explain that the visitor should contact AM Digital Studio for confirmation.
- Never invent contact details, website policies, client reviews, or business claims.
- Be polite, concise and professional.
- Do not claim to be a human.
- Keep responses suitable for a general audience, including teenagers.
- Do not ask visitors to share passwords, payment card details, or sensitive
  personal information.
`;

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AM Digital AI Backend is Running!"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "OK",
        service: "AM Digital AI"
    });
});

app.post("/api/chat", async (req, res) => {
    try {
        const message = req.body?.message;

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                reply: "Please enter a message."
            });
        }

        if (message.length > 2000) {
            return res.status(400).json({
                success: false,
                reply: "Please keep your message under 2000 characters."
            });
        }

        if (!API_KEY) {
            console.error("OPENAI_API_KEY is missing.");
            return res.status(500).json({
                success: false,
                reply: "The AI service is not configured yet. Please try again later."
            });
        }

        // Safety moderation
        const moderationResponse = await fetch(
            "https://api.openai.com/v1/moderations",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "omni-moderation-latest",
                    input: message
                })
            }
        );

        if (!moderationResponse.ok) {
            throw new Error("Moderation service request failed.");
        }

        const moderation = await moderationResponse.json();

        if (moderation.results?.[0]?.flagged) {
            return res.json({
                success: true,
                reply: "Sorry, I can't help with that request. Please ask me something else."
            });
        }

        // Generate AI response
        const aiResponse = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: MODEL,
                    instructions,
                    input: message,
                    max_output_tokens: 400,
                    store: false
                })
            }
        );

        const data = await aiResponse.json();

        if (!aiResponse.ok) {
            console.error("OpenAI API error:", data.error?.message || "Unknown error");
            throw new Error("AI response request failed.");
        }

        const reply = (data.output || [])
            .filter(item => item.type === "message")
            .flatMap(item => item.content || [])
            .filter(item => item.type === "output_text")
            .map(item => item.text)
            .join("\n")
            .trim();

        if (!reply) {
            throw new Error("The AI returned an empty response.");
        }

        return res.json({
            success: true,
            reply
        });

    } catch (error) {
        console.error("AM Digital AI error:", error.message);

        return res.status(500).json({
            success: false,
            reply: "Sorry, AM Digital AI is temporarily unavailable. Please try again shortly."
        });
    }
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`AM Digital AI running on port ${PORT}`);
    });
}
