
/* =========================================================
   AM DIGITAL STUDIO
   FREE DIGITAL TOOLS - JAVASCRIPT
   File: tools.js
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       GLOBAL HELPERS
    ========================= */

    const $ = (id) => document.getElementById(id);

    const show = (element) => {
        if (element) element.hidden = false;
    };

    const hide = (element) => {
        if (element) element.hidden = true;
    };

    const setText = (id, value) => {
        const element = $(id);
        if (element) element.textContent = value;
    };

    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const showMessage = (container, message) => {
        if (!container) return;

        container.replaceChildren();

        const paragraph = document.createElement("p");
        paragraph.textContent = message;

        container.appendChild(paragraph);
        show(container);
    };

    const loadImage = (file) => {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const image = new Image();

            image.onload = () => {
                URL.revokeObjectURL(url);
                resolve(image);
            };

            image.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Unable to load this image."));
            };

            image.src = url;
        });
    };

    const getImageExtension = (type) => {
        if (type === "image/png") return "png";
        if (type === "image/webp") return "webp";
        return "jpg";
    };


    /* =========================
       FOOTER YEAR
    ========================= */

    setText("toolsYear", new Date().getFullYear());


    /* =========================
       TOOL SEARCH & FILTER
    ========================= */

    const searchInput = $("toolSearch");
    const filterButtons = document.querySelectorAll(".tool-filter");
    const toolCards = document.querySelectorAll(".tool-card");
    const noResults = $("noToolsResults");

    let activeFilter = "all";

    function filterTools() {

        const query = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        let visibleCount = 0;

        toolCards.forEach(card => {

            const name = (
                card.dataset.name || ""
            ).toLowerCase();

            const category = card.dataset.category || "";

            const matchesSearch = name.includes(query);

            const matchesFilter =
                activeFilter === "all" ||
                category === activeFilter;

            const visible = matchesSearch && matchesFilter;

            card.hidden = !visible;

            if (visible) visibleCount++;

        });

        if (noResults) {
            noResults.hidden = visibleCount !== 0;
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterTools);
    }

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            filterButtons.forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            activeFilter = button.dataset.filter || "all";

            filterTools();

        });

    });


    /* =========================
       TOOL WORKSPACE NAVIGATION
    ========================= */

    const workspace = $("toolWorkspace");
    const workspaceTitle = $("workspaceTitle");
    const workspaceDescription = $("workspaceDescription");
    const closeWorkspace = $("closeWorkspace");

    const toolInformation = {
        compressor: {
            title: "Image Compressor",
            description: "Reduce your image file size while maintaining quality."
        },

        qr: {
            title: "QR Code Generator",
            description: "Generate downloadable QR codes from text and URLs."
        },

        palette: {
            title: "Color Palette Generator",
            description: "Create beautiful color combinations."
        },

        word: {
            title: "Word Counter",
            description: "Analyze words, characters and paragraphs."
        },

        resizer: {
            title: "Image Resizer",
            description: "Resize images to your preferred dimensions."
        }
    };

    function openTool(toolName) {

        if (!toolInformation[toolName] || !workspace) return;

        document.querySelectorAll(".tool-panel").forEach(panel => {
            hide(panel);
        });

        const selectedPanel = $("panel-" + toolName);

        if (!selectedPanel) return;

        show(selectedPanel);
        show(workspace);

        workspaceTitle.textContent =
            toolInformation[toolName].title;

        workspaceDescription.textContent =
            toolInformation[toolName].description;

        workspace.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    document.querySelectorAll(".tool-open-btn").forEach(button => {

        button.addEventListener("click", () => {
            openTool(button.dataset.tool);
        });

    });

    if (closeWorkspace) {

        closeWorkspace.addEventListener("click", () => {

            hide(workspace);

            document.querySelectorAll(".tool-panel").forEach(panel => {
                hide(panel);
            });

            $("tools-library")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    }


    /* =====================================================
       TOOL 01 - IMAGE COMPRESSOR
    ===================================================== */

    const compressInput = $("compressInput");
    const compressControls = $("compressControls");
    const compressQuality = $("compressQuality");
    const compressQualityValue = $("compressQualityValue");
    const compressButton = $("compressBtn");
    const compressResult = $("compressResult");

    let compressFile = null;

    if (compressInput) {

        compressInput.addEventListener("change", () => {

            const file = compressInput.files[0];

            if (!file) return;

            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image.");
                return;
            }

            if (file.size > 20 * 1024 * 1024) {
                alert("Please select an image smaller than 20 MB.");
                compressInput.value = "";
                return;
            }

            compressFile = file;

            show(compressControls);
            hide(compressResult);

        });

    }

    if (compressQuality) {

        compressQuality.addEventListener("input", () => {

            setText(
                "compressQualityValue",
                compressQuality.value + "%"
            );

        });

    }

    if (compressButton) {

        compressButton.addEventListener("click", async () => {

            if (!compressFile) {
                alert("Please select an image first.");
                return;
            }

            compressButton.disabled = true;
            compressButton.textContent = "Compressing...";

            try {

                const image = await loadImage(compressFile);

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");

                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;

                if (!context) {
                    throw new Error("Canvas is not supported.");
                }

                context.drawImage(image, 0, 0);

                const quality =
                    Number(compressQuality.value) / 100;

                const outputType =
                    compressFile.type === "image/png"
                        ? "image/png"
                        : "image/jpeg";

                const blob = await new Promise(resolve => {

                    canvas.toBlob(
                        resolve,
                        outputType,
                        quality
                    );

                });

                if (!blob) {
                    throw new Error("Image compression failed.");
                }

                const originalSize = compressFile.size;
                const compressedSize = blob.size;

                const saved = Math.max(
                    0,
                    ((originalSize - compressedSize) / originalSize) * 100
                );

                compressResult.replaceChildren();

                const title = document.createElement("h3");
                title.textContent = "Compression Complete!";

                const imagePreview = document.createElement("img");
                const previewURL = URL.createObjectURL(blob);

                imagePreview.src = previewURL;
                imagePreview.alt = "Compressed image preview";

                imagePreview.onload = () => {
                    URL.revokeObjectURL(previewURL);
                };

                const details = document.createElement("p");

                details.textContent =
                    `Original: ${(originalSize / 1024).toFixed(2)} KB | ` +
                    `Compressed: ${(compressedSize / 1024).toFixed(2)} KB | ` +
                    `Saved: ${saved.toFixed(1)}%`;

                const downloadButton = document.createElement("button");

                downloadButton.className = "tools-secondary-btn";
                downloadButton.innerHTML =
                    '<i class="fa-solid fa-download"></i> Download Image';

                downloadButton.addEventListener("click", () => {

                    downloadBlob(
                        blob,
                        "am-digital-compressed." +
                        getImageExtension(outputType)
                    );

                });

                compressResult.append(
                    title,
                    imagePreview,
                    details,
                    downloadButton
                );

                show(compressResult);

            } catch (error) {

                console.error(error);
                alert(error.message || "Unable to compress image.");

            } finally {

                compressButton.disabled = false;

                compressButton.innerHTML =
                    '<i class="fa-solid fa-compress"></i> Compress Image';

            }

        });

    }


    /* =====================================================
       TOOL 02 - QR CODE GENERATOR
    ===================================================== */

    let qrInstance = null;

    const qrText = $("qrText");
    const qrColor = $("qrColor");
    const qrBackground = $("qrBackground");
    const generateQR = $("generateQR");
    const qrCanvas = $("qrCanvas");
    const qrResult = $("qrResult");
    const downloadQR = $("downloadQR");

    function loadQRCodeLibrary() {

        if (window.QRCode) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {

            const script = document.createElement("script");

            script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";

            script.onload = resolve;

            script.onerror = () => {
                reject(new Error("Unable to load QR Code library. Check your internet connection."));
            };

            document.head.appendChild(script);

        });

    }

    if (generateQR) {

        generateQR.addEventListener("click", async () => {

            const text = qrText.value.trim();

            if (!text) {
                alert("Please enter some text or a URL.");
                return;
            }

            generateQR.disabled = true;
            generateQR.textContent = "Generating...";

            try {

                await loadQRCodeLibrary();

                qrCanvas.replaceChildren();

                qrInstance = new QRCode(qrCanvas, {
                    text: text,
                    width: 220,
                    height: 220,
                    colorDark: qrColor.value,
                    colorLight: qrBackground.value,
                    correctLevel: QRCode.CorrectLevel.H
                });

                show(qrResult);

            } catch (error) {

                console.error(error);
                alert(error.message || "QR generation failed.");

            } finally {

                generateQR.disabled = false;

                generateQR.innerHTML =
                    '<i class="fa-solid fa-qrcode"></i> Generate QR Code';

            }

        });

    }

    if (downloadQR) {

        downloadQR.addEventListener("click", () => {

            if (!qrInstance || !qrCanvas.children.length) {
                alert("Generate a QR code first.");
                return;
            }

            const canvas = qrCanvas.querySelector("canvas");

            if (canvas) {

                canvas.toBlob(blob => {

                    if (blob) {
                        downloadBlob(blob, "am-digital-qr-code.png");
                    }

                }, "image/png");

                return;
            }

            const image = qrCanvas.querySelector("img");

            if (image) {

                fetch(image.src)
                    .then(response => response.blob())
                    .then(blob => {
                        downloadBlob(blob, "am-digital-qr-code.png");
                    })
                    .catch(() => {
                        alert("Unable to download QR code.");
                    });

            }

        });

    }


    /* =====================================================
       TOOL 03 - COLOR PALETTE GENERATOR
    ===================================================== */

    const palettePreview = $("palettePreview");
    const generatePalette = $("generatePalette");
    const copyPalette = $("copyPalette");

    let currentPalette = [];

    function randomHex() {

        return "#" +
            Math.floor(Math.random() * 16777216)
                .toString(16)
                .padStart(6, "0")
                .toUpperCase();

    }

    function generateNewPalette() {

        currentPalette = Array.from(
            { length: 5 },
            () => randomHex()
        );

        renderPalette();

    }

    function renderPalette() {

        if (!palettePreview) return;

        palettePreview.replaceChildren();

        currentPalette.forEach(color => {

            const colorBox = document.createElement("div");

            colorBox.className = "palette-color";
            colorBox.style.backgroundColor = color;

            const label = document.createElement("span");
            label.textContent = color;

            colorBox.appendChild(label);

            colorBox.addEventListener("click", async () => {

                try {

                    await navigator.clipboard.writeText(color);

                    label.textContent = "COPIED!";

                    setTimeout(() => {
                        label.textContent = color;
                    }, 1000);

                } catch {
                    alert("Unable to copy color. HEX: " + color);
                }

            });

            palettePreview.appendChild(colorBox);

        });

    }

    if (generatePalette) {

        generatePalette.addEventListener("click", generateNewPalette);

    }

    if (copyPalette) {

        copyPalette.addEventListener("click", async () => {

            if (!currentPalette.length) return;

            const text = currentPalette.join("\n");

            try {

                await navigator.clipboard.writeText(text);

                copyPalette.innerHTML =
                    '<i class="fa-solid fa-check"></i> Copied!';

                setTimeout(() => {

                    copyPalette.innerHTML =
                        '<i class="fa-regular fa-copy"></i> Copy Color Codes';

                }, 1500);

            } catch {

                alert("Unable to copy colors.");

            }

        });

    }

    generateNewPalette();


    /* =====================================================
       TOOL 04 - WORD COUNTER
    ===================================================== */

    const wordInput = $("wordInput");

    function updateWordStatistics() {

        if (!wordInput) return;

        const text = wordInput.value;

        const trimmed = text.trim();

        const words = trimmed
            ? trimmed.split(/\s+/u).length
            : 0;

        const characters = text.length;

        const sentences = (
            text.match(/[.!?]+(?=\s|$)/g) || []
        ).length;

        const paragraphs = trimmed
            ? text.split(/\n+/).filter(p => p.trim().length > 0).length
            : 0;

        setText("wordCount", words);
        setText("characterCount", characters);
        setText("sentenceCount", sentences);
        setText("paragraphCount", paragraphs);

    }

    if (wordInput) {

        wordInput.addEventListener(
            "input",
            updateWordStatistics
        );

    }

    const copyWordText = $("copyWordText");

    if (copyWordText) {

        copyWordText.addEventListener("click", async () => {

            const text = wordInput.value;

            if (!text.trim()) {
                alert("There is no text to copy.");
                return;
            }

            try {

                await navigator.clipboard.writeText(text);

                copyWordText.innerHTML =
                    '<i class="fa-solid fa-check"></i> Copied!';

                setTimeout(() => {

                    copyWordText.innerHTML =
                        '<i class="fa-regular fa-copy"></i> Copy Text';

                }, 1500);

            } catch {

                alert("Unable to copy text.");

            }

        });

    }

    const clearWordText = $("clearWordText");

    if (clearWordText) {

        clearWordText.addEventListener("click", () => {

            wordInput.value = "";

            updateWordStatistics();

            wordInput.focus();

        });

    }


    /* =====================================================
       TOOL 05 - IMAGE RESIZER
    ===================================================== */

    const resizeInput = $("resizeInput");
    const resizeControls = $("resizeControls");
    const resizeWidth = $("resizeWidth");
    const resizeHeight = $("resizeHeight");
    const maintainRatio = $("maintainRatio");
    const resizeButton = $("resizeBtn");
    const resizeResult = $("resizeResult");

    let resizeFile = null;
    let originalImage = null;
    let originalRatio = 1;

    if (resizeInput) {

        resizeInput.addEventListener("change", async () => {

            const file = resizeInput.files[0];

            if (!file) return;

            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image.");
                return;
            }

            if (file.size > 20 * 1024 * 1024) {
                alert("Please select an image smaller than 20 MB.");
                resizeInput.value = "";
                return;
            }

            try {

                resizeFile = file;

                originalImage = await loadImage(file);

                originalRatio =
                    originalImage.naturalWidth /
                    originalImage.naturalHeight;

                resizeWidth.value = originalImage.naturalWidth;
                resizeHeight.value = originalImage.naturalHeight;

                show(resizeControls);
                hide(resizeResult);

            } catch (error) {

                alert(error.message);

            }

        });

    }

    if (resizeWidth) {

        resizeWidth.addEventListener("input", () => {

            if (
                maintainRatio.checked &&
                originalImage &&
                resizeWidth.value
            ) {

                resizeHeight.value = Math.round(
                    Number(resizeWidth.value) / originalRatio
                );

            }

        });

    }

    if (resizeHeight) {

        resizeHeight.addEventListener("input", () => {

            if (
                maintainRatio.checked &&
                originalImage &&
                resizeHeight.value
            ) {

                resizeWidth.value = Math.round(
                    Number(resizeHeight.value) * originalRatio
                );

            }

        });

    }

    if (resizeButton) {

        resizeButton.addEventListener("click", async () => {

            if (!resizeFile || !originalImage) {
                alert("Please upload an image first.");
                return;
            }

            const width = Number(resizeWidth.value);
            const height = Number(resizeHeight.value);

            if (
                !Number.isInteger(width) ||
                !Number.isInteger(height) ||
                width < 1 ||
                height < 1 ||
                width > 10000 ||
                height > 10000
            ) {

                alert("Enter valid dimensions between 1 and 10000 pixels.");
                return;

            }

            resizeButton.disabled = true;
            resizeButton.textContent = "Resizing...";

            try {

                const canvas = document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext("2d");

                if (!context) {
                    throw new Error("Canvas is not supported.");
                }

                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = "high";

                context.drawImage(
                    originalImage,
                    0,
                    0,
                    width,
                    height
                );

                const outputType =
                    resizeFile.type === "image/png"
                        ? "image/png"
                        : "image/jpeg";

                const blob = await new Promise(resolve => {

                    canvas.toBlob(
                        resolve,
                        outputType,
                        0.92
                    );

                });

                if (!blob) {
                    throw new Error("Unable to resize image.");
                }

                const previewURL = URL.createObjectURL(blob);

                resizeResult.replaceChildren();

                const heading = document.createElement("h3");
                heading.textContent = "Image Resized Successfully!";

                const preview = document.createElement("img");

                preview.src = previewURL;
                preview.alt = "Resized image preview";

                preview.onload = () => {
                    URL.revokeObjectURL(previewURL);
                };

                const details = document.createElement("p");

                details.textContent =
                    `New dimensions: ${width} × ${height} pixels`;

                const downloadButton = document.createElement("button");

                downloadButton.className = "tools-secondary-btn";

                downloadButton.innerHTML =
                    '<i class="fa-solid fa-download"></i> Download Resized Image';

                downloadButton.addEventListener("click", () => {

                    downloadBlob(
                        blob,
                        "am-digital-resized." +
                        getImageExtension(outputType)
                    );

                });

                resizeResult.append(
                    heading,
                    preview,
                    details,
                    downloadButton
                );

                show(resizeResult);

            } catch (error) {

                console.error(error);

                alert(error.message || "Image resizing failed.");

            } finally {

                resizeButton.disabled = false;

                resizeButton.innerHTML =
                    '<i class="fa-solid fa-expand"></i> Resize Image';

            }

        });

    }


    /* =========================
       INITIALIZATION
    ========================= */

    filterTools();
    updateWordStatistics();

    console.log(
        "%c AM DIGITAL STUDIO ",
        "background:#8b5cf6;color:white;padding:8px;font-weight:bold;"
    );

    console.log("Free Digital Tools initialized successfully.");

});
