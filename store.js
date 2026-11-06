/* =====================================================
   AM DIGITAL STUDIO — STORE LOGIC
   Edit product prices/images and WhatsApp number here.
===================================================== */

const AM_STORE_CONFIG = {
    WHATSAPP_NUMBER: "94715445967",

    CURRENCY: "LKR",
    LOCALE: "en-LK"
};

const STORE_PRODUCTS = [
    {
        id: "am-classic-tee",
        name: "AM Classic T-Shirt",
        category: "tshirts",
        categoryLabel: "T-Shirts",
        price: 2500,
        images: ["bshirt.png", "wshirt.png"],
        badge: "AM ESSENTIAL",
        description: "A clean everyday T-shirt featuring the AM Digital Studio identity. Comfortable, simple and creator-ready.",
        details: ["AM Digital Studio inspired design", "Available in multiple sizes", "Colour and stock confirmed when ordering"],
        sizes: ["S", "M", "L", "XL", "XXL"]
    },
    {
        id: "am-signature-hoodie",
        name: "AM Signature Hoodie",
        category: "hoodies",
        categoryLabel: "Hoodies",
        price: 4500,
        images: ["bhoodie.png", "whoodie.png"],
        badge: "FEATURED",
        description: "A versatile hoodie mockup for the AM community, designed for a relaxed everyday look.",
        details: ["AM signature chest design", "Size selection available", "Colour and stock confirmed when ordering"],
        sizes: ["S", "M", "L", "XL", "XXL"]
    },
    {
        id: "am-logo-mug",
        name: "AM Logo Mug",
        category: "mugs",
        categoryLabel: "Mugs",
        price: 1500,
        images: ["bmug.png", "wmug.png"],
        badge: "DAILY PICK",
        description: "A simple branded mug for your desk, study table or creative workspace.",
        details: ["AM Digital Studio branding", "Great for desk and study setups", "Print and availability confirmed when ordering"],
        sizes: []
    },
    {
        id: "am-classic-cap",
        name: "AM Classic Cap",
        category: "caps",
        categoryLabel: "Caps",
        price: 1800,
        images: ["bcap.png", "wcap.png"],
        badge: "AM STYLE",
        description: "A minimal cap concept featuring the AM mark. A simple addition to your everyday collection.",
        details: ["Minimal AM front design", "Adjustable style subject to stock", "Colour confirmed when ordering"],
        sizes: ["One Size"]
    },
    {
        id: "am-wristband",
        name: "AM Silicone Wristband",
        category: "wristbands",
        categoryLabel: "Wristbands",
        price: 500,
        images: ["bband.png", "wband.png"],
        badge: "COMMUNITY",
        description: "A lightweight AM community wristband with a clean, minimal design.",
        details: ["AM identity inspired", "Lightweight wristband concept", "Colour and stock confirmed when ordering"],
        sizes: ["One Size"]
    },
    {
        id: "am-study-flashcards",
        name: "AM Study Flash Cards",
        category: "flashcards",
        categoryLabel: "Flash Cards",
        price: 1200,
        images: ["bcards.png", "wcards.png"],
        badge: "LEARN MORE",
        description: "A compact flash-card set concept to support quick revision, active recall and organised learning.",
        details: ["Study and revision card set", "Topic and card count to be confirmed", "Availability confirmed when ordering"],
        sizes: []
    }
];

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const money = value => new Intl.NumberFormat(AM_STORE_CONFIG.LOCALE, {
    style: "currency", currency: AM_STORE_CONFIG.CURRENCY, maximumFractionDigits: 0
}).format(value);

let activeCategory = "all";
let activeProduct = null;
let activeImageIndex = 0;
let cart = loadCart();

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem("amds-store-cart") || "[]");
        if (!Array.isArray(saved)) return [];
        return saved.filter(item => STORE_PRODUCTS.some(product => product.id === item.id)
            && Number.isInteger(item.quantity) && item.quantity > 0)
            .map(item => ({ id: item.id, size: item.size || "", quantity: Math.min(item.quantity, 99) }));
    } catch {
        return [];
    }
}

function saveCart() {
    localStorage.setItem("amds-store-cart", JSON.stringify(cart));
}

function getProduct(id) {
    return STORE_PRODUCTS.find(product => product.id === id);
}

function cartQuantity() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function cartSubtotal() {
    return cart.reduce((sum, item) => sum + getProduct(item.id).price * item.quantity, 0);
}

function renderProducts() {
    const grid = $("#productGrid");
    const sort = $("#sortProducts")?.value || "featured";
    let products = STORE_PRODUCTS.filter(product => activeCategory === "all" || product.category === activeCategory);

    if (sort === "price-low") products.sort((a, b) => a.price - b.price);
    if (sort === "price-high") products.sort((a, b) => b.price - a.price);
    if (sort === "name") products.sort((a, b) => a.name.localeCompare(b.name));

    $("#productCountLabel").textContent = `${products.length} ${products.length === 1 ? "product" : "products"}`;
    if (!products.length) {
        grid.innerHTML = '<div class="no-products">No products found in this category.</div>';
        return;
    }

    grid.innerHTML = products.map(product => `
        <article class="store-product-card">
            <div class="product-image-wrap" data-view-product="${product.id}" tabindex="0" role="button" aria-label="View ${product.name}">
                <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                <span class="product-tag">${product.badge}</span>
            </div>
            <div class="product-card-body">
                <span class="product-category-label">${product.categoryLabel}</span>
                <h3>${product.name}</h3>
                <p class="product-card-description">${product.description}</p>
                <div class="product-card-bottom">
                    <div class="product-price">${money(product.price)}<small>Sample price</small></div>
                    <button class="product-view-btn" type="button" data-view-product="${product.id}">View Details <i class="fa-solid fa-arrow-right"></i></button>
                </div>
            </div>
        </article>
    `).join("");
}

function openProductModal(productId) {
    const product = getProduct(productId);
    if (!product) return;

    activeProduct = product;

    const hasSizes = product.sizes.length > 0;

    // Start with first image
    activeImageIndex = 0;

    $("#productModalContent").innerHTML = `
        <div class="product-modal-image">

            <div class="product-gallery">

                <img
                    id="productGalleryImage"
                    src="${product.images[0]}"
                    alt="${product.name}"
                >

                <button
                    class="gallery-arrow gallery-prev"
                    id="galleryPrev"
                    type="button"
                    aria-label="Previous image"
                >
                    <i class="fa-solid fa-chevron-left"></i>
                </button>

                <button
                    class="gallery-arrow gallery-next"
                    id="galleryNext"
                    type="button"
                    aria-label="Next image"
                >
                    <i class="fa-solid fa-chevron-right"></i>
                </button>

            </div>

            <div class="gallery-counter" id="galleryCounter">
                1 / ${product.images.length}
            </div>

        </div>

        <div class="product-modal-info">

            <span class="store-eyebrow">
                ${product.categoryLabel}
            </span>

            <h2 id="modalProductName">
                ${product.name}
            </h2>

            <span class="modal-price">
                ${money(product.price)}
            </span>

            <p>${product.description}</p>

            <ul class="product-detail-list">
                ${product.details.map(detail => `
                    <li>
                        <i class="fa-solid fa-check"></i>
                        ${detail}
                    </li>
                `).join("")}
            </ul>

            ${hasSizes ? `
                <label class="product-option-label" for="productSize">
                    Select size / option
                </label>

                <select class="product-option-select" id="productSize">
                    ${product.sizes.map(size => `
                        <option value="${size}">${size}</option>
                    `).join("")}
                </select>
            ` : ""}

            <label class="product-option-label" for="productQuantity">
                Quantity
            </label>

            <select class="product-option-select" id="productQuantity">
                ${Array.from({length:10},(_,i)=>`
                    <option value="${i+1}">${i+1}</option>
                `).join("")}
            </select>

            <button
                class="primary-btn modal-add-btn"
                id="modalAddToCart"
                type="button"
            >
                <i class="fa-solid fa-cart-plus"></i>
                Add to Cart
            </button>

            <div class="modal-stock-note">
                Availability and final price will be confirmed by AM Digital Studio.
            </div>

        </div>
    `;

    $("#productModal").classList.add("is-open");

    $("#productModal").setAttribute("aria-hidden", "false");

    document.body.classList.add("store-modal-open");
}
function changeProductImage(direction) {

    if (!activeProduct) return;

    const totalImages = activeProduct.images.length;

    activeImageIndex += direction;

    if (activeImageIndex >= totalImages) {
        activeImageIndex = 0;
    }

    if (activeImageIndex < 0) {
        activeImageIndex = totalImages - 1;
    }

    $("#productGalleryImage").src =
        activeProduct.images[activeImageIndex];

    $("#galleryCounter").textContent =
        `${activeImageIndex + 1} / ${totalImages}`;
}
function closeProductModal() {
    $("#productModal").classList.remove("is-open");
    $("#productModal").setAttribute("aria-hidden", "true");
    if (!$("#cartOverlay").classList.contains("is-open") && !$("#checkoutModal").classList.contains("is-open")) {
        document.body.classList.remove("store-modal-open");
    }
}

function addToCart(productId, size = "", quantity = 1) {
    const existing = cart.find(item => item.id === productId && item.size === size);
    if (existing) existing.quantity = Math.min(99, existing.quantity + quantity);
    else cart.push({ id: productId, size, quantity });
    saveCart();
    renderCart();
    closeProductModal();
    openCart();
}

function renderCart() {
    const count = cartQuantity();
    const subtotal = cartSubtotal();
    $("#cartCount").textContent = count;
    $("#drawerCartCount").textContent = `(${count})`;
    $("#cartSubtotal").textContent = money(subtotal);
    $("#cartTotal").textContent = money(subtotal);
    $("#checkoutTotal").textContent = money(subtotal);

    const empty = count === 0;
    $("#cartEmpty").classList.toggle("is-visible", empty);
    $("#cartItems").style.display = empty ? "none" : "block";
    $("#cartSummary").classList.toggle("is-hidden", empty);

    $("#cartItems").innerHTML = cart.map((item, index) => {
        const product = getProduct(item.id);
        return `
            <div class="cart-item">
              <img src="${product.images[0]}" alt="${product.name}">
                <div>
                    <h4>${product.name}</h4>
                    <div class="cart-item-meta">${item.size ? `Option: ${item.size} · ` : ""}${money(product.price)} each</div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn" type="button" data-cart-action="decrease" data-index="${index}" aria-label="Decrease quantity"><i class="fa-solid fa-minus"></i></button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" type="button" data-cart-action="increase" data-index="${index}" aria-label="Increase quantity"><i class="fa-solid fa-plus"></i></button>
                        <button class="remove-item-btn" type="button" data-cart-action="remove" data-index="${index}" aria-label="Remove item"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                </div>
                <strong class="cart-item-price">${money(product.price * item.quantity)}</strong>
            </div>`;
    }).join("");
}

function openCart() {
    $("#cartOverlay").classList.add("is-open");
    $("#cartOverlay").setAttribute("aria-hidden", "false");
    document.body.classList.add("store-modal-open");
}
function closeCart() {
    $("#cartOverlay").classList.remove("is-open");
    $("#cartOverlay").setAttribute("aria-hidden", "true");
    if (!$("#productModal").classList.contains("is-open") && !$("#checkoutModal").classList.contains("is-open")) {
        document.body.classList.remove("store-modal-open");
    }
}
function openCheckout() {
    if (!cart.length) return;
    closeCart();
    $("#checkoutModal").classList.add("is-open");
    $("#checkoutModal").setAttribute("aria-hidden", "false");
    $("#checkoutTotal").textContent = money(cartSubtotal());
    document.body.classList.add("store-modal-open");
}
function closeCheckout() {
    $("#checkoutModal").classList.remove("is-open");
    $("#checkoutModal").setAttribute("aria-hidden", "true");
    document.body.classList.remove("store-modal-open");
}

function buildWhatsAppMessage(order) {
    const lines = [
        "*AM DIGITAL STUDIO — NEW STORE ORDER*",
        "",
        `Name: ${order.name}`,
        `Contact: ${order.phone}`,
        `Delivery address: ${order.address}`,
        "",
        "*ORDER ITEMS*",
        ...cart.map((item, index) => {
            const product = getProduct(item.id);
            return `${index + 1}. ${product.name}${item.size ? ` (${item.size})` : ""} x ${item.quantity} — ${money(product.price * item.quantity)}`;
        }),
        "",
        `*Estimated subtotal: ${money(cartSubtotal())}*`,
        "Delivery charges and final availability to be confirmed.",
        order.note ? `\nAdditional note: ${order.note}` : "",
        "",
        "Please confirm this order and the available payment/delivery options."
    ];
    return lines.join("\n");
}

function submitWhatsAppOrder(event) {
    event.preventDefault();
    if (!cart.length) return;

    const name = $("#customerName").value.trim();
    const phone = $("#customerPhone").value.trim();
    const address = $("#customerAddress").value.trim();
    const note = $("#customerNote").value.trim();

    if (!name || !phone || !address) {
        alert("Please complete your name, contact number and delivery address.");
        return;
    }

    if (!/^94\d{9}$/.test(AM_STORE_CONFIG.WHATSAPP_NUMBER)) {
        alert("WhatsApp ordering is ready, but the store WhatsApp number has not been configured yet. Open store.js and replace WHATSAPP_NUMBER with your number in international format (example: 947XXXXXXXX).");
        return;
    }

    const message = buildWhatsAppMessage({ name, phone, address, note });
    const url = `https://wa.me/${AM_STORE_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
}

function initStore() {
    renderProducts();
    renderCart();

    $("#categoryFilters").addEventListener("click", event => {
        const button = event.target.closest("[data-category]");
        if (!button) return;
        activeCategory = button.dataset.category;
        $$(".category-filter").forEach(filter => filter.classList.toggle("active", filter === button));
        renderProducts();
    });

    $("#sortProducts").addEventListener("change", renderProducts);
    $("#productGrid").addEventListener("click", event => {
        const target = event.target.closest("[data-view-product]");
        if (target) openProductModal(target.dataset.viewProduct);
    });
    $("#productGrid").addEventListener("keydown", event => {
        if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-view-product]")) {
            event.preventDefault();
            openProductModal(event.target.dataset.viewProduct);
        }
    });

$("#productModal").addEventListener("click", event => {

    if (event.target.closest("[data-close-modal]")) {
        closeProductModal();
    }

    if (event.target.closest("#galleryPrev")) {
        changeProductImage(-1);
    }

    if (event.target.closest("#galleryNext")) {
        changeProductImage(1);
    }

    if (event.target.closest("#modalAddToCart") && activeProduct) {

        const size = $("#productSize")?.value || "";

        const quantity = Number(
            $("#productQuantity")?.value || 1
        );

        addToCart(activeProduct.id, size, quantity);
    }

    });

    $("#openCartBtn").addEventListener("click", openCart);
    $("#cartOverlay").addEventListener("click", event => {
        if (event.target.closest("[data-close-cart]")) closeCart();
        const action = event.target.closest("[data-cart-action]");
        if (!action) return;
        const index = Number(action.dataset.index);
        const item = cart[index];
        if (!item) return;
        if (action.dataset.cartAction === "increase") item.quantity = Math.min(99, item.quantity + 1);
        if (action.dataset.cartAction === "decrease") item.quantity -= 1;
        if (action.dataset.cartAction === "remove" || item.quantity <= 0) cart.splice(index, 1);
        saveCart();
        renderCart();
    });

    $("#checkoutBtn").addEventListener("click", openCheckout);
    $("#checkoutModal").addEventListener("click", event => {
        if (event.target.closest("[data-close-checkout]")) closeCheckout();
    });
    $("#checkoutForm").addEventListener("submit", submitWhatsAppOrder);

    $("#storeMenuToggle").addEventListener("click", () => {
        const open = $("#storeNavLinks").classList.toggle("is-open");
        $("#storeMenuToggle").setAttribute("aria-expanded", String(open));
        $("#storeMenuToggle").setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    $$("#storeNavLinks a").forEach(link => link.addEventListener("click", () => {
        $("#storeNavLinks").classList.remove("is-open");
        $("#storeMenuToggle").setAttribute("aria-expanded", "false");
    }));

    $$("[data-close-cart]").forEach(button => button.addEventListener("click", closeCart));
    $("#storeBackToTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => {
        $("#storeBackToTop").classList.toggle("show-top", window.scrollY > 450);
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeProductModal();
            closeCart();
            closeCheckout();
        }
    });
}

document.addEventListener("DOMContentLoaded", initStore);


// Match the existing site's global page fade-in effect.
window.addEventListener("load", () => {
    document.body.classList.add("page-loaded");
});
