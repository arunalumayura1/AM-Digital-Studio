/* =========================================
   AM DIGITAL STUDIO
   FINAL PAYMENT PAGE
   FINALPAY.JS
========================================= */


/* =========================================
   PART 1 — LOAD ORDER DATA
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const orderData = {

        /* Customer Information */

        customerName:
            localStorage.getItem("customerName") || "",

        email:
            localStorage.getItem("customerEmail") || "",

        whatsapp:
            localStorage.getItem("customerWhatsApp") || "",

        country:
            localStorage.getItem("customerCountry") || "",


        /* Service Information */

        service:
            localStorage.getItem("serviceName") || "",

        package:
            localStorage.getItem("selectedPackage") || "",

        delivery:
            localStorage.getItem("selectedDelivery") || "",

        price:
            localStorage.getItem("selectedPrice") || "0",


        /* Project Information */

        projectTitle:
            localStorage.getItem("projectTitle") || "",

        projectDescription:
            localStorage.getItem("projectDescription") || ""

    };


    window.finalOrderData = orderData;


    console.log(
        "Final Payment Order Data:",
        orderData
    );


    fillOrderSummary(orderData);

});


/* =========================================
   PART 2 — HELPER FUNCTIONS
========================================= */

function cleanValue(
    value,
    fallback = "Not provided"
) {

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {

        return fallback;

    }

    return String(value).trim();

}


/* =========================================
   FORMAT PRICE
========================================= */

function formatPrice(price) {

    const numericPrice =
        Number(
            String(price)
                .replace(/[^0-9.]/g, "")
        );


    if (
        Number.isNaN(numericPrice) ||
        numericPrice <= 0
    ) {

        return "Rs.0/-";

    }


    return (
        "Rs." +
        numericPrice.toLocaleString("en-LK") +
        "/-"
    );

}


/* =========================================
   FORMAT PACKAGE
========================================= */

function formatPackage(packageName) {

    if (!packageName) {

        return "Not provided";

    }


    const name =
        String(packageName).trim();


    if (
        name.toLowerCase().includes("package")
    ) {

        return name;

    }


    return (
        name.charAt(0).toUpperCase() +
        name.slice(1).toLowerCase() +
        " Package"
    );

}


/* =========================================
   FORMAT DELIVERY
========================================= */

function formatDelivery(
    service,
    delivery
) {

    service =
        String(service || "").toLowerCase();

    delivery =
        String(delivery || "").toLowerCase();


    let days = 2;


    if (service === "video editing") {

        days =
            delivery === "express"
                ? 1
                : 2;

    }

    else if (service === "web development") {

        days =
            delivery === "express"
                ? 3
                : 7;

    }

    else if (
        service === "logo design" ||
        service === "poster design" ||
        service === "thumbnail design"
    ) {

        days =
            delivery === "express"
                ? 1
                : 2;

    }

    else if (service === "fiverr gig seo") {

        days =
            delivery === "express"
                ? 1
                : 2;

    }


    return (
        days +
        " Day" +
        (days > 1 ? "s" : "") +
        " Delivery"
    );

}


/* =========================================
   PART 3 — FILL ORDER SUMMARY
========================================= */

function fillOrderSummary(orderData) {

    const service =
        cleanValue(orderData.service);


    const packageName =
        formatPackage(
            orderData.package
        );


    const delivery =
        formatDelivery(
            service,
            orderData.delivery
        );


    const price =
        formatPrice(
            orderData.price
        );


    const summaryService =
        document.getElementById(
            "summaryService"
        );


    const summaryPackage =
        document.getElementById(
            "summaryPackage"
        );


    const summaryDelivery =
        document.getElementById(
            "summaryDelivery"
        );


    const summaryEstimatedPrice =
        document.getElementById(
            "summaryEstimatedPrice"
        );


    const summaryTotal =
        document.getElementById(
            "summaryTotal"
        );


    if (summaryService) {

        summaryService.textContent =
            service;

    }


    if (summaryPackage) {

        summaryPackage.textContent =
            packageName;

    }


    if (summaryDelivery) {

        summaryDelivery.textContent =
            delivery;

    }


/* LKR + USD price display */

const USD_TO_LKR_RATE = 335.5;

function formatDualCurrency(amount) {
    const lkr = Number(amount) || 0;
    const usd = lkr / USD_TO_LKR_RATE;

    return "Rs. " +
        lkr.toLocaleString("en-US", {
            maximumFractionDigits: 0
        }) +
        "/- (≈ $" +
        usd.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) +
        " USD)";
}

const basePrice = Number(
    localStorage.getItem("selectedBasePrice")
) || Number(price) || 0;

const deliveryExtra = Number(
    localStorage.getItem("selectedDeliveryExtra")
) || 0;

const totalPrice = Number(
    localStorage.getItem("selectedPrice")
) || Number(price) || 0;

if (summaryEstimatedPrice) {
    summaryEstimatedPrice.textContent =
        formatDualCurrency(basePrice);
}

if (summaryTotal) {
    summaryTotal.textContent =
        formatDualCurrency(totalPrice);
}

const deliveryFeeElement =
    document.getElementById("summaryDeliveryFee");

if (deliveryFeeElement) {
    deliveryFeeElement.textContent =
        formatDualCurrency(deliveryExtra);
}



    console.log(
        "Order Summary Loaded ✓"
    );

}


/* =========================================
   PART 4 — CREATE ORDER MESSAGE
========================================= */

function createOrderMessage() {

    const data =
        window.finalOrderData || {};


    const customerName =
        cleanValue(data.customerName);

    const email =
        cleanValue(data.email);

    const whatsapp =
        cleanValue(data.whatsapp);

    const country =
        cleanValue(data.country);

    const service =
        cleanValue(data.service);

    const packageName =
        formatPackage(data.package);

    const delivery =
        formatDelivery(
            service,
            data.delivery
        );

    const price =
        formatPrice(data.price);

    const projectTitle =
        cleanValue(data.projectTitle);

    const projectDescription =
        cleanValue(
            data.projectDescription
        );


    const message = `NEW ORDER REQUEST
==============================

CUSTOMER INFORMATION

Name: ${customerName}
Email: ${email}
WhatsApp: ${whatsapp}
Country: ${country}


SERVICE DETAILS

Service: ${service}
Package: ${packageName}
Delivery: ${delivery}


ORDER SUMMARY

Estimated Price: ${price}
Total Amount: ${price}


PROJECT INFORMATION

Project Title: ${projectTitle}

Project Description:
${projectDescription}



PAYMENT

Status: ${
    localStorage.getItem("paypalPaymentStatus") === "COMPLETED"
        ? "PayPal payment confirmed"
        : "Payment not confirmed"
}
PayPal Order ID: ${
    localStorage.getItem("paypalOrderID") || "Not available"
}
Amount: ${
    localStorage.getItem("paypalPaidAmount") || "Not paid"
} ${
    localStorage.getItem("paypalPaidCurrency") || ""
}

==============================

AM Digital Studio`;


    return message.trim();

}


/* =========================================
   PART 5 — COPY ORDER DETAILS
========================================= */

async function copyOrderDetails() {

    const message =
        createOrderMessage();


    try {

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard.writeText(
                message
            );

            console.log(
                "Order details copied successfully ✓"
            );

            return true;

        }


        throw new Error(
            "Clipboard API unavailable"
        );

    }

    catch (error) {

        console.log(
            "Using clipboard fallback..."
        );


        const textArea =
            document.createElement("textarea");


        textArea.value =
            message;


        textArea.style.position =
            "fixed";

        textArea.style.left =
            "-9999px";

        textArea.style.top =
            "0";


        document.body.appendChild(
            textArea
        );


        textArea.focus();
        textArea.select();


        try {

            const successful =
                document.execCommand("copy");


            document.body.removeChild(
                textArea
            );


            return successful;

        }

        catch (copyError) {

            document.body.removeChild(
                textArea
            );


            console.error(
                "Copy failed:",
                copyError
            );


            return false;

        }

    }

}


/* =========================================
   PART 6 — FACEBOOK MESSENGER
========================================= */

const FACEBOOK_PAGE_CHAT_URL =
    "https://m.me/amdigitalstudio01";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const goToChatBtn =
            document.getElementById("goToChatBtn");


        if (!goToChatBtn) {

            console.error(
                "Go To Chat button not found."
            );

            return;
        }


        goToChatBtn.addEventListener(
            "click",
            async () => {

                /*
                 * IMPORTANT:
                 * Copy BEFORE opening Messenger.
                 * This keeps the user's click gesture
                 * available for clipboard access.
                 */

                const copied =
                    await copyOrderDetails();


                if (!copied) {

                    showCopyFailedNotification();

                    return;
                }


                /*
                 * Show the green notification.
                 */

                showCopyNotification();


                /*
                 * Open Facebook Messenger
                 * after copying is completed.
                 */

                window.location.href =
                    FACEBOOK_PAGE_CHAT_URL;

            }
        );

    }
);

/* =========================================
   PART 7 — COPY SUCCESS NOTIFICATION
========================================= */

function showCopyNotification() {

    /*
     * Remove old notification
     * if one already exists.
     */

    const oldNotification =
        document.querySelector(
            ".copy-notification"
        );


    if (oldNotification) {

        oldNotification.remove();

    }


    const notification =
        document.createElement("div");


    notification.className =
        "copy-notification";


    notification.innerHTML = `

        <div class="copy-notification-icon">
            ✓
        </div>


        <div class="copy-notification-content">

            <h3>
                Order Details Copied!
            </h3>


            <p>
                Your complete order details are ready
                to paste into the Facebook chat.
            </p>


            <div class="paste-instructions">

                <div>

                    <strong>
                        💻 Computer
                    </strong>

                    <span>
                        Press <b>Ctrl + V</b>
                    </span>

                </div>


                <div>

                    <strong>
                        📱 Phone
                    </strong>

                    <span>
                        Press and hold the message box,
                        then tap <b>Paste</b>
                    </span>

                </div>

            </div>


            <p class="receipt-reminder">

                After pasting the order details,
                attach your payment receipt or
                payment screenshot and send the message.

            </p>

        </div>


        <button
            class="copy-notification-close"
            type="button"
            aria-label="Close">

            ×

        </button>

    `;


    document.body.appendChild(
        notification
    );


    /*
     * Show animation.
     */

    requestAnimationFrame(() => {

        notification.classList.add(
            "show"
        );

    });


    /*
     * Manual close only.
     */

    const closeButton =
        notification.querySelector(
            ".copy-notification-close"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                closeCopyNotification(
                    notification
                );

            }
        );

    }

}


/* =========================================
   CLOSE NOTIFICATION
========================================= */

function closeCopyNotification(
    notification
) {

    if (!notification) {

        return;

    }


    notification.classList.remove(
        "show"
    );


    setTimeout(() => {

        if (notification.parentNode) {

            notification.parentNode.removeChild(
                notification
            );

        }

    }, 400);

}


/* =========================================
   OPTIONAL COPY BUTTON
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const copyButton =
            document.getElementById(
                "copyOrderBtn"
            );


        if (!copyButton) {

            return;

        }


        copyButton.addEventListener(
            "click",
            async () => {

                const copied =
                    await copyOrderDetails();


                if (copied) {

                    showCopyNotification();

                }

            }
        );

    }
);


/* =========================================
   READY
========================================= */

console.log(
    "%cAM Digital Studio Final Payment Page Ready ✓",
    "font-size:16px;font-weight:bold;color:#1677ff;"
);
// ========================================
// PAGE LOADED
// ========================================

window.addEventListener("load", () => {

    document.body.classList.add("page-loaded");

});

/* =========================================
   PAYPAL CHECKOUT — SANDBOX
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const API_URL =
        "https://am-digital-studio-api.amdcreativestudio1.workers.dev";

    const statusBox = document.getElementById("paypal-payment-status");
    const buttonContainer = document.getElementById("paypal-button-container");

    if (!statusBox || !buttonContainer) return;

    const order = window.finalOrderData || {};

    // Convert displayed service names to server-approved IDs.
    const serviceMap = {
        "video editing": "video-editing",
        "logo design": "logo-design",
        "poster design": "poster-design",
        "thumbnail design": "thumbnail-design",
        "youtube thumbnail design": "thumbnail-design",
        "web development": "web-development",
        "fiverr gig seo": "fiverr-seo"
    };

    const service = serviceMap[
        String(order.service || "").trim().toLowerCase()
    ];

    const packageName =
        String(order.package || "").trim().toLowerCase();

    const delivery =
        String(order.delivery || "standard").trim().toLowerCase();

    if (!service || !["basic", "standard", "premium"].includes(packageName)) {
        statusBox.textContent =
            "Order details are incomplete. Please return to the order page.";
        return;
    }

    if (!["standard", "express"].includes(delivery)) {
        statusBox.textContent = "Invalid delivery option.";
        return;
    }

    if (!window.paypal) {
        statusBox.textContent =
            "PayPal could not load. Please refresh and try again.";
        return;
    }

    paypal.Buttons({
        createOrder: async () => {
            statusBox.textContent = "Preparing your PayPal order...";

            const response = await fetch(`${API_URL}/api/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service,
                    package: packageName,
                    delivery
                })
            });

            const data = await response.json();

            if (!response.ok || !data.id) {
                throw new Error(data.error || "Could not create PayPal order.");
            }

            return data.id;
        },

        onApprove: async (data) => {
            statusBox.textContent = "Confirming payment securely...";

            const response = await fetch(`${API_URL}/api/capture-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderID: data.orderID,
                    service,
                    package: packageName,
                    delivery
                })
            });

            const result = await response.json();

            if (!response.ok || result.status !== "COMPLETED") {
                throw new Error(result.error || "Payment could not be confirmed.");
            }

            localStorage.setItem("paypalPaymentStatus", "COMPLETED");
            localStorage.setItem("paypalOrderID", result.orderID);
            localStorage.setItem("paypalPaidAmount", result.amount);
            localStorage.setItem("paypalPaidCurrency", result.currency);

            if (window.amdsUpdatePayment) {
                try {
                    await window.amdsUpdatePayment({ orderID: result.orderID });
                } catch (syncError) {
                    console.error("Payment status database update failed:", syncError);
                    statusBox.textContent = "Payment was confirmed, but the order record could not be updated. Please contact AM Digital Studio with your PayPal order ID.";
                }
            }

            statusBox.textContent =
                `Payment confirmed: ${result.amount} USD. Order ID: ${result.orderID}`;

            statusBox.style.color = "green";
        },

        onCancel: () => {
            statusBox.textContent = "Payment cancelled. No payment confirmation received.";
        },

        onError: (error) => {
            console.error("PayPal error:", error);
            statusBox.textContent =
                "PayPal payment failed. Please try again or contact support.";
        }
    }).render("#paypal-button-container");
});
