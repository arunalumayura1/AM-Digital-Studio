
/* =====================================
   AM DIGITAL AI
   CHAT SYSTEM
===================================== */

document.addEventListener("DOMContentLoaded", function () {

    const chatMessages = document.getElementById("chatMessages");
    const chatForm = document.getElementById("chatForm");
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const newChatBtn = document.getElementById("newChatBtn");
    const themeToggle = document.getElementById("themeToggle");

    let isLoading = false;

    // AI BACKEND API
  const API_URL = "https://am-digital-studio-taupe.vercel.app/api/chat";


    // =================================
    // THEME SYSTEM
    // =================================

    function applyTheme(theme) {

        document.documentElement.setAttribute(
            "data-theme",
            theme
        );

        localStorage.setItem("amds-theme", theme);

        const icon = themeToggle.querySelector("i");

        icon.className = theme === "dark"
            ? "fas fa-sun"
            : "fas fa-moon";
    }

    const savedTheme =
        localStorage.getItem("amds-theme") || "light";

    applyTheme(savedTheme);

    themeToggle.addEventListener("click", function () {

        const current =
            document.documentElement.getAttribute("data-theme");

        applyTheme(current === "dark" ? "light" : "dark");

    });


    // =================================
    // WELCOME SCREEN
    // =================================

    const welcomeHTML = `
        <div class="welcome-screen" id="welcomeScreen">

            <div class="welcome-icon">
                <i class="fas fa-robot"></i>
            </div>

            <h1>Hello! Welcome to <span>AM Digital AI</span></h1>

            <p>
                Your intelligent assistant by AM Digital Studio.
                Ask me anything and let's explore new ideas together.
            </p>

            <div class="suggestions">

                <button class="suggestion" data-prompt="What can you do?">
                    <i class="fas fa-lightbulb"></i>
                    What can you do?
                </button>

                <button class="suggestion" data-prompt="Explain Artificial Intelligence">
                    <i class="fas fa-brain"></i>
                    Explain Artificial Intelligence
                </button>

                <button class="suggestion" data-prompt="Help me create a website">
                    <i class="fas fa-code"></i>
                    Help me create a website
                </button>

                <button class="suggestion" data-prompt="Give me some creative ideas">
                    <i class="fas fa-wand-magic-sparkles"></i>
                    Creative ideas
                </button>

            </div>
        </div>
    `;


    // =================================
    // ADD MESSAGE
    // =================================

    function addMessage(message, sender) {

        const row = document.createElement("div");
        row.className = "message " + sender;

        const avatar = document.createElement("div");
        avatar.className = "message-avatar";

        const avatarIcon = document.createElement("i");

        avatarIcon.className = sender === "user"
            ? "fas fa-user"
            : "fas fa-robot";

        avatar.appendChild(avatarIcon);

        const content = document.createElement("div");
        content.className = "message-content";

        const label = document.createElement("div");
        label.className = "message-label";

        label.textContent = sender === "user"
            ? "You"
            : "AM Digital AI";

        const bubble = document.createElement("div");
        bubble.className = "message-bubble";

        // Safe text output
        bubble.textContent = message;

        content.appendChild(label);
        content.appendChild(bubble);

        row.appendChild(avatar);
        row.appendChild(content);

        chatMessages.appendChild(row);

        chatMessages.scrollTop = chatMessages.scrollHeight;

        return bubble;
    }


    // =================================
    // LOADING ANIMATION
    // =================================

    function showLoading() {

        const row = document.createElement("div");

        row.className = "message";
        row.id = "aiLoading";

        row.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>

            <div class="message-content">
                <div class="message-label">AM Digital AI</div>

                <div class="message-bubble typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        chatMessages.appendChild(row);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }


    function removeLoading() {

        const loading = document.getElementById("aiLoading");

        if (loading) {
            loading.remove();
        }
    }


    // =================================
    // SEND MESSAGE
    // =================================

    async function sendMessage(message) {

        message = message.trim();

        if (!message || isLoading) return;

        isLoading = true;

        sendBtn.disabled = true;

        addMessage(message, "user");

        userInput.value = "";
        userInput.style.height = "auto";

        showLoading();

        try {

            const response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: message
                })

            });


            if (!response.ok) {
                throw new Error("AI server error");
            }

            const data = await response.json();

            removeLoading();

            if (!data.reply || typeof data.reply !== "string") {
                throw new Error("Invalid AI response");
            }

            addMessage(data.reply, "ai");


        } catch (error) {

            removeLoading();

            addMessage(
                "Sorry! AM Digital AI is currently unable to connect to its AI server. Please try again later.",
                "ai"
            );

            console.error("AM Digital AI Error:", error);

        }

        isLoading = false;

        sendBtn.disabled = false;

        userInput.focus();

    }


    // =================================
    // FORM SUBMISSION
    // =================================

    chatForm.addEventListener("submit", function (event) {

        event.preventDefault();

        sendMessage(userInput.value);

    });


    // =================================
    // ENTER TO SEND
    // SHIFT + ENTER = NEW LINE
    // =================================

    userInput.addEventListener("keydown", function (event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.isComposing
        ) {

            event.preventDefault();

            chatForm.requestSubmit();

        }

    });


    // =================================
    // AUTO RESIZE TEXTAREA
    // =================================

    userInput.addEventListener("input", function () {

        userInput.style.height = "auto";

        userInput.style.height =
            Math.min(userInput.scrollHeight, 130) + "px";

    });


    // =================================
    // SUGGESTED PROMPTS
    // =================================

    chatMessages.addEventListener("click", function (event) {

        const button = event.target.closest(".suggestion");

        if (!button || isLoading) return;

        const prompt = button.dataset.prompt;

        if (prompt) {
            sendMessage(prompt);
        }

    });


    // =================================
    // NEW CHAT
    // =================================

    newChatBtn.addEventListener("click", function () {

        if (isLoading) return;

        chatMessages.innerHTML = welcomeHTML;

        userInput.value = "";

        userInput.style.height = "auto";

        userInput.focus();

    });


    console.log("AM Digital AI initialized successfully!");

});
