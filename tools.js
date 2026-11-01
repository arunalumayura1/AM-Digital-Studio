
/* ==========================================
   AM DIGITAL STUDIO
   FREE DIGITAL TOOLS - COMPLETE JAVASCRIPT
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    const $ = (selector) => document.querySelector(selector);

    const $$ = (selector) => document.querySelectorAll(selector);

    /* ======================================
       1. SEARCH AND FILTER
    ====================================== */

    const searchInput = $("#toolSearch");
    const filterButtons = $$(".tool-filter");
    const toolCards = $$(".tool-card");
    const noResults = $("#noToolsResults");

    let activeFilter = "all";

    function filterTools() {

        const searchText = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

        let visibleCount = 0;

        toolCards.forEach(card => {

            const category = card.dataset.category || "";
            const text = card.innerText.toLowerCase();

            const matchesCategory =
                activeFilter === "all" || category === activeFilter;

            const matchesSearch = text.includes(searchText);

            const visible = matchesCategory && matchesSearch;

            card.style.display = visible ? "" : "none";

            if (visible) visibleCount++;

        });

        if (noResults) {
            noResults.style.display =
                visibleCount === 0 ? "block" : "none";
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterTools);
    }

    filterButtons.forEach(button => {

        button.addEventListener("click", function () {

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            this.classList.add("active");

            activeFilter = this.dataset.filter || "all";

            filterTools();

        });

    });


    /* ======================================
       2. TOOL WORKSPACE
    ====================================== */

    const workspace = $("#toolWorkspace");
    const workspaceTitle = $("#workspaceTitle");
    const workspaceDescription = $("#workspaceDescription");
    const closeWorkspace = $("#closeWorkspace");

    const toolInformation = {

        compressor: {
            title: "Image Compressor",
            description: "Compress images and download smaller files."
        },

        qr: {
            title: "QR Code Generator",
            description: "Create and download custom QR codes."
        },

        palette: {
            title: "Color Palette Generator",
            description: "Generate beautiful color combinations."
        },

        word: {
            title: "Word Counter",
            description: "Count words, characters and paragraphs."
        },

        resizer: {
            title: "Image Resizer",
            description: "Resize images to your preferred dimensions."
        }

    };

    function openTool(toolName) {

        const information = toolInformation[toolName];

        if (!information || !workspace) return;

        $$(".tool-panel").forEach(panel => {
            panel.classList.remove("active");
        });

        const selectedPanel = $("#panel-" + toolName);

        if (!selectedPanel) return;

        selectedPanel.classList.add("active");

        workspaceTitle.textContent = information.title;
        workspaceDescription.textContent = information.description;

        workspace.style.display = "block";

        workspace.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    $$("[data-open-tool]").forEach(button => {

        button.addEventListener("click", function () {

            openTool(this.dataset.openTool);

        });

    });

    if (closeWorkspace) {

        closeWorkspace.addEventListener("click", function () {

            workspace.style.display = "none";

            $$(".tool-panel").forEach(panel => {
                panel.classList.remove("active");
            });

        });

    }


    /* ======================================
       3. COMMON HELPERS
    ====================================== */

    function showMessage(container, message) {

        if (!container) return;

        container.textContent = message;

    }

    function readImage(file, callback, errorCallback) {

        if (!file || !file.type.startsWith("image/")) {

            errorCallback("Please select a valid image file.");

            return;

        }

        const image = new Image();

        const objectURL = URL.createObjectURL(file);

        image.onload = function () {

            callback(image, objectURL);

        };

        image.onerror = function () {

            URL.revokeObjectURL(objectURL);

            errorCallback("Unable to load this image.");

        };

        image.src = objectURL;

    }

    function canvasToBlob(canvas, type, quality) {

        return new Promise((resolve, reject) => {

            canvas.toBlob(blob => {

                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Image processing failed."));
                }

            }, type, quality);

        });

    }

    function downloadBlob(blob, filename) {

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);

    }

    async function copyText(text) {

        try {

            if (navigator.clipboard && window.isSecureContext) {

                await navigator.clipboard.writeText(text);

            } else {

                const temporaryInput = document.createElement("textarea");

                temporaryInput.value = text;

                temporaryInput.style.position = "fixed";
                temporaryInput.style.opacity = "0";

                document.body.appendChild(temporaryInput);

                temporaryInput.select();

                const copied = document.execCommand("copy");

                temporaryInput.remove();

                if (!copied) {
                    throw new Error("Copy failed");
                }

            }

            return true;

        } catch (error) {

            console.error("Clipboard error:", error);

            return false;

        }

    }


    /* ======================================
       4. IMAGE COMPRESSOR
    ====================================== */

    const compressInput = $("#compressInput");
    const compressQuality = $("#compressQuality");
    const compressQualityValue = $("#compressQualityValue");
    const compressButton = $("#compressBtn");
    const compressResult = $("#compressResult");

    let compressedImageBlob = null;

    if (compressQuality && compressQualityValue) {

        compressQuality.addEventListener("input", function () {

            compressQualityValue.textContent = this.value + "%";

        });

    }

    if (compressButton) {

        compressButton.addEventListener("click", async function () {

            const file = compressInput?.files?.[0];

            if (!file) {

                showMessage(compressResult, "Please select an image first.");

                return;

            }

            if (file.size > 20 * 1024 * 1024) {

                showMessage(compressResult, "Maximum image size is 20 MB.");

                return;

            }

            this.disabled = true;
            this.textContent = "Compressing...";

            readImage(file, async function (image, objectURL) {

                try {

                    const canvas = document.createElement("canvas");

                    canvas.width = image.naturalWidth;
                    canvas.height = image.naturalHeight;

                    const context = canvas.getContext("2d");

                    context.drawImage(image, 0, 0);

                    const quality = Number(compressQuality.value) / 100;

                    const isPNG = file.type === "image/png";

                    const outputType = isPNG
                        ? "image/png"
                        : "image/jpeg";

                    compressedImageBlob = await canvasToBlob(
                        canvas,
                        outputType,
                        quality
                    );

                    const originalSize = file.size;
                    const compressedSize = compressedImageBlob.size;

                    const savedPercentage = Math.max(
                        0,
                        ((originalSize - compressedSize) / originalSize) * 100
                    );

                    const downloadName =
                        file.name.replace(/\.[^/.]+$/, "") + "-compressed." +
                        (isPNG ? "png" : "jpg");

                    compressResult.innerHTML = "";

                    const heading = document.createElement("h4");
                    heading.textContent = "Compression Complete";

                    const details = document.createElement("p");

                    details.textContent =
                        "Original: " + formatBytes(originalSize) +
                        " | Compressed: " + formatBytes(compressedSize) +
                        " | Saved: " + savedPercentage.toFixed(1) + "%";

                    const preview = document.createElement("img");

                    preview.src = URL.createObjectURL(compressedImageBlob);
                    preview.alt = "Compressed image preview";

                    const downloadButton = document.createElement("button");

                    downloadButton.textContent = "Download Compressed Image";

                    downloadButton.addEventListener("click", function () {

                        downloadBlob(compressedImageBlob, downloadName);

                    });

                    compressResult.append(
                        heading,
                        details,
                        preview,
                        downloadButton
                    );

                    URL.revokeObjectURL(objectURL);

                } catch (error) {

                    console.error(error);

                    showMessage(compressResult, "Image compression failed.");

                } finally {

                    compressButton.disabled = false;
                    compressButton.innerHTML =
                        '<i class="fas fa-compress"></i> Compress Image';

                }

            }, function (message) {

                showMessage(compressResult, message);

                compressButton.disabled = false;
                compressButton.textContent = "Compress Image";

            });

        });

    }

    function formatBytes(bytes) {

        if (bytes === 0) return "0 Bytes";

        const units = ["Bytes", "KB", "MB", "GB"];

        const index = Math.floor(Math.log(bytes) / Math.log(1024));

        return (
            (bytes / Math.pow(1024, index)).toFixed(2) +
            " " +
            units[index]
        );

    }


    /* ======================================
       5. QR CODE GENERATOR
    ====================================== */

    const qrText = $("#qrText");
    const qrColor = $("#qrColor");
    const qrBackground = $("#qrBackground");
    const generateQR = $("#generateQR");
    const qrCanvas = $("#qrCanvas");
    const qrResult = $("#qrResult");
    const downloadQR = $("#downloadQR");

    let qrGenerated = false;

    if (qrResult) {
        qrResult.style.display = "none";
    }

    function loadQRCodeLibrary() {

        return new Promise((resolve, reject) => {

            if (window.QRCode) {

                resolve();

                return;

            }

            const script = document.createElement("script");

            script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";

            script.onload = resolve;

            script.onerror = () => {
                reject(new Error("QR library could not be loaded."));
            };

            document.head.appendChild(script);

        });

    }

    if (generateQR) {

        generateQR.addEventListener("click", async function () {

            const value = qrText.value.trim();

            if (!value) {

                alert("Please enter text or a website URL.");

                return;

            }

            generateQR.disabled = true;
            generateQR.textContent = "Generating...";

            try {

                await loadQRCodeLibrary();

                qrCanvas.innerHTML = "";

                new QRCode(qrCanvas, {

                    text: value,

                    width: 220,
                    height: 220,

                    colorDark: qrColor.value,
                    colorLight: qrBackground.value,

                    correctLevel: QRCode.CorrectLevel.H

                });

                qrGenerated = true;

                if (qrResult) {
                    qrResult.style.display = "block";
                }

            } catch (error) {

                console.error(error);

                alert("QR Code generation failed. Please check your internet connection.");

            } finally {

                generateQR.disabled = false;
                generateQR.innerHTML =
                    '<i class="fas fa-qrcode"></i> Generate QR Code';

            }

        });

    }

    if (downloadQR) {

        downloadQR.addEventListener("click", function () {

            if (!qrGenerated) {

                alert("Generate a QR code first.");

                return;

            }

            const canvas = qrCanvas.querySelector("canvas");

            const image = qrCanvas.querySelector("img");

            if (canvas) {

                canvas.toBlob(blob => {

                    if (blob) {
                        downloadBlob(blob, "am-digital-studio-qr.png");
                    }

                });

            } else if (image && image.src) {

                const link = document.createElement("a");

                link.href = image.src;
                link.download = "am-digital-studio-qr.png";

                link.click();

            }

        });

    }


    /* ======================================
       6. COLOR PALETTE GENERATOR
    ====================================== */

    const palettePreview = $("#palettePreview");
    const generatePalette = $("#generatePalette");
    const copyPalette = $("#copyPalette");

    let currentPalette = [];

    function randomHexColor() {

        return "#" + Math.floor(
            Math.random() * 16777215
        ).toString(16).padStart(6, "0").toUpperCase();

    }

    function createPalette() {

        if (!palettePreview) return;

        currentPalette = [];

        palettePreview.innerHTML = "";

        for (let i = 0; i < 5; i++) {

            const color = randomHexColor();

            currentPalette.push(color);

            const colorBox = document.createElement("div");

            colorBox.className = "palette-color";

            colorBox.style.backgroundColor = color;

            colorBox.textContent = color;

            colorBox.title = "Click to copy " + color;

            colorBox.addEventListener("click", async function () {

                const copied = await copyText(color);

                alert(copied ? color + " copied!" : "Could not copy color.");

            });

            palettePreview.appendChild(colorBox);

        }

    }

    if (generatePalette) {

        generatePalette.addEventListener("click", createPalette);

    }

    if (copyPalette) {

        copyPalette.addEventListener("click", async function () {

            if (!currentPalette.length) {

                alert("Generate a palette first.");

                return;

            }

            const copied = await copyText(currentPalette.join("\n"));

            alert(copied ? "Palette copied successfully!" : "Could not copy palette.");

        });

    }

    createPalette();


    /* ======================================
       7. WORD COUNTER
    ====================================== */

    const wordInput = $("#wordInput");

    const wordCount = $("#wordCount");
    const characterCount = $("#characterCount");
    const sentenceCount = $("#sentenceCount");
    const paragraphCount = $("#paragraphCount");

    const copyWordText = $("#copyWordText");
    const clearWordText = $("#clearWordText");

    function updateWordStatistics() {

        if (!wordInput) return;

        const text = wordInput.value;

        const trimmedText = text.trim();

        const words = trimmedText
            ? trimmedText.split(/\s+/).filter(Boolean)
            : [];

        const characters = text.length;

        const sentences = trimmedText
            ? (trimmedText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [])
                .filter(sentence => sentence.trim()).length
            : 0;

        const paragraphs = trimmedText
            ? trimmedText.split(/\n+/).filter(p => p.trim()).length
            : 0;

        if (wordCount) wordCount.textContent = words.length;

        if (characterCount) characterCount.textContent = characters;

        if (sentenceCount) sentenceCount.textContent = sentences;

        if (paragraphCount) paragraphCount.textContent = paragraphs;

    }

    if (wordInput) {

        wordInput.addEventListener("input", updateWordStatistics);

    }

    if (copyWordText) {

        copyWordText.addEventListener("click", async function () {

            if (!wordInput.value.trim()) {

                alert("There is no text to copy.");

                return;

            }

            const copied = await copyText(wordInput.value);

            alert(copied ? "Text copied successfully!" : "Could not copy text.");

        });

    }

    if (clearWordText) {

        clearWordText.addEventListener("click", function () {

            if (!wordInput) return;

            wordInput.value = "";

            updateWordStatistics();

        });

    }


    /* ======================================
       8. IMAGE RESIZER
    ====================================== */

    const resizeInput = $("#resizeInput");
    const resizeWidth = $("#resizeWidth");
    const resizeHeight = $("#resizeHeight");
    const maintainRatio = $("#maintainRatio");
    const resizeButton = $("#resizeBtn");
    const resizeResult = $("#resizeResult");

    let originalImageWidth = 0;
    let originalImageHeight = 0;
    let resizedImageBlob = null;

    if (resizeInput) {

        resizeInput.addEventListener("change", function () {

            const file = this.files[0];

            if (!file) return;

            readImage(file, function (image, objectURL) {

                originalImageWidth = image.naturalWidth;
                originalImageHeight = image.naturalHeight;

                resizeWidth.value = originalImageWidth;
                resizeHeight.value = originalImageHeight;

                URL.revokeObjectURL(objectURL);

                showMessage(
                    resizeResult,
                    "Image loaded: " +
                    originalImageWidth + " × " + originalImageHeight + " px"
                );

            }, function (message) {

                showMessage(resizeResult, message);

            });

        });

    }

    if (resizeWidth && resizeHeight && maintainRatio) {

        resizeWidth.addEventListener("input", function () {

            if (
                maintainRatio.checked &&
                originalImageWidth &&
                originalImageHeight
            ) {

                const width = Number(this.value);

                if (width > 0) {

                    resizeHeight.value = Math.round(
                        width * originalImageHeight / originalImageWidth
                    );

                }

            }

        });

        resizeHeight.addEventListener("input", function () {

            if (
                maintainRatio.checked &&
                originalImageWidth &&
                originalImageHeight
            ) {

                const height = Number(this.value);

                if (height > 0) {

                    resizeWidth.value = Math.round(
                        height * originalImageWidth / originalImageHeight
                    );

                }

            }

        });

    }

    if (resizeButton) {

        resizeButton.addEventListener("click", function () {

            const file = resizeInput?.files?.[0];

            const width = Number(resizeWidth.value);
            const height = Number(resizeHeight.value);

            if (!file) {

                showMessage(resizeResult, "Please select an image first.");

                return;

            }

            if (
                !Number.isInteger(width) ||
                !Number.isInteger(height) ||
                width < 1 ||
                height < 1 ||
                width > 10000 ||
                height > 10000
            ) {

                showMessage(
                    resizeResult,
                    "Enter valid dimensions between 1 and 10000 pixels."
                );

                return;

            }

            resizeButton.disabled = true;
            resizeButton.textContent = "Resizing...";

            readImage(file, async function (image, objectURL) {

                try {

                    const canvas = document.createElement("canvas");

                    canvas.width = width;
                    canvas.height = height;

                    const context = canvas.getContext("2d");

                    context.drawImage(image, 0, 0, width, height);

                    resizedImageBlob = await canvasToBlob(
                        canvas,
                        "image/png"
                    );

                    resizeResult.innerHTML = "";

                    const details = document.createElement("p");

                    details.textContent =
                        "New dimensions: " + width + " × " + height + " px";

                    const preview = document.createElement("img");

                    preview.src = URL.createObjectURL(resizedImageBlob);
                    preview.alt = "Resized image preview";

                    const downloadButton = document.createElement("button");

                    downloadButton.textContent = "Download Resized Image";

                    downloadButton.addEventListener("click", function () {

                        downloadBlob(
                            resizedImageBlob,
                            "am-digital-studio-resized.png"
                        );

                    });

                    resizeResult.append(
                        details,
                        preview,
                        downloadButton
                    );

                    URL.revokeObjectURL(objectURL);

                } catch (error) {

                    console.error(error);

                    showMessage(resizeResult, "Image resizing failed.");

                } finally {

                    resizeButton.disabled = false;
                    resizeButton.innerHTML =
                        '<i class="fas fa-expand"></i> Resize Image';

                }

            }, function (message) {

                showMessage(resizeResult, message);

                resizeButton.disabled = false;
                resizeButton.textContent = "Resize Image";

            });

        });

    }


    /* ======================================
       9. FOOTER YEAR
    ====================================== */

    const yearElement = $("#toolsYear");

    if (yearElement) {

        yearElement.textContent = new Date().getFullYear();

    }


    /* ======================================
       10. INITIALIZE
    ====================================== */

    filterTools();

    console.log("AM Digital Studio Tools initialized successfully.");

});
