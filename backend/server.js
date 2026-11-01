
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20kb" }));

// Home route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AM Digital AI Backend is Running!"
    });
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "OK",
        service: "AM Digital AI"
    });
});

// AM Digital AI Chat API
app.post("/api/chat", (req, res) => {
    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
            success: false,
            reply: "Please enter a message."
        });
    }

    const text = message.toLowerCase().trim();

    let reply = "I'm AM Digital AI. I don't know the answer to that yet. Please ask me about AM Digital Studio.";

    if (/^(hi|hello|hey)\b/.test(text)) {
        reply = "Hello! Welcome to AM Digital AI. How can I help you today?";
    }
    else if (text.includes("your name") || text.includes("who are you")) {
        reply = "I'm AM Digital AI, your AI assistant from AM Digital Studio.";
    }
    else if (text.includes("am digital studio")) {
        reply = "AM Digital Studio is a creative digital brand offering graphic design and digital services.";
    }
    else if (text.includes("services") || text.includes("what do you offer")) {
        reply = "AM Digital Studio offers graphic design, video editing, thumbnails, logo design, photo editing and other creative services.";
    }
    else if (text.includes("thank")) {
        reply = "You're welcome! I'm happy to help.";
    }
    else if (text.includes("help")) {
        reply = "You can ask me about AM Digital Studio, its services, graphic design and video editing.";
    }

    res.json({
        success: true,
        reply: reply
    });
});

// Vercel deployment
module.exports = app;

// Local testing
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`AM Digital AI running on port ${PORT}`);
    });
}
