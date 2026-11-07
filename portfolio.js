
/* =========================================================
   AM DIGITAL STUDIO
   ULTRA PREMIUM PORTFOLIO
   portfolio.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";


    /* =====================================================
       01. SELECT ELEMENTS
    ===================================================== */

    const portfolioGrid = document.getElementById("portfolio-grid");

    const portfolioCards = document.querySelectorAll(
        ".portfolio-card"
    );

    const filterButtons = document.querySelectorAll(
        ".filter-btn"
    );

    const emptyMessage = document.getElementById(
        "portfolio-empty"
    );

    const menuToggle = document.getElementById(
        "menu-toggle"
    );

    const navMenu = document.getElementById(
        "nav-menu"
    );

    const currentYear = document.getElementById(
        "current-year"
    );


    /* =====================================================
       02. CURRENT YEAR
    ===================================================== */

    if (currentYear) {

        currentYear.textContent = new Date().getFullYear();

    }


    /* =====================================================
       03. PORTFOLIO FILTERS
    ===================================================== */

    function filterPortfolio(category) {

        let visibleCount = 0;


        portfolioCards.forEach((card) => {

            const cardCategory = card.dataset.category;

            const shouldShow =
                category === "all" ||
                cardCategory === category;


            if (shouldShow) {

                card.classList.remove("is-hidden");

                visibleCount++;

            } else {

                card.classList.add("is-hidden");

            }

        });


        /* Update Empty Message */

        if (emptyMessage) {

            if (visibleCount === 0) {

                emptyMessage.classList.add("show");

            } else {

                emptyMessage.classList.remove("show");

            }

        }


        /* Update Filter Buttons */

        filterButtons.forEach((button) => {

            const isActive =
                button.dataset.filter === category;

            button.classList.toggle(
                "active",
                isActive
            );

            button.setAttribute(
                "aria-pressed",
                String(isActive)
            );

        });


        /* Update Grid */

        if (portfolioGrid) {

            portfolioGrid.setAttribute(
                "data-active-filter",
                category
            );

        }

    }


    /* =====================================================
       04. FILTER BUTTON EVENTS
    ===================================================== */

    filterButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const category = button.dataset.filter;

            if (!category) return;

            filterPortfolio(category);

        });

    });


    /* =====================================================
       05. MOBILE NAVIGATION
    ===================================================== */

    function closeMobileMenu() {

        if (!menuToggle || !navMenu) return;


        navMenu.classList.remove("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );


        menuToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );


        menuToggle.innerHTML =
            '<i class="fa-solid fa-bars"></i>';

    }


    function openMobileMenu() {

        if (!menuToggle || !navMenu) return;


        navMenu.classList.add("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );


        menuToggle.setAttribute(
            "aria-label",
            "Close navigation menu"
        );


        menuToggle.innerHTML =
            '<i class="fa-solid fa-xmark"></i>';

    }


    if (menuToggle && navMenu) {

        menuToggle.addEventListener("click", () => {

            const isOpen =
                navMenu.classList.contains("active");


            if (isOpen) {

                closeMobileMenu();

            } else {

                openMobileMenu();

            }

        });


        /* Close Menu When Clicking Navigation Links */

        navMenu.querySelectorAll("a").forEach((link) => {

            link.addEventListener("click", () => {

                closeMobileMenu();

            });

        });


        /* Close Menu When Clicking Outside */

        document.addEventListener("click", (event) => {

            const clickedInsideMenu =
                navMenu.contains(event.target);

            const clickedToggle =
                menuToggle.contains(event.target);


            if (
                !clickedInsideMenu &&
                !clickedToggle &&
                navMenu.classList.contains("active")
            ) {

                closeMobileMenu();

            }

        });


        /* Close Menu With Escape */

        document.addEventListener("keydown", (event) => {

            if (
                event.key === "Escape" &&
                navMenu.classList.contains("active")
            ) {

                closeMobileMenu();

                menuToggle.focus();

            }

        });

    }


    /* =====================================================
       06. RESPONSIVE NAVIGATION
    ===================================================== */

    window.addEventListener("resize", () => {

        if (window.innerWidth > 768) {

            closeMobileMenu();

        }

    });


    /* =====================================================
       07. SMOOTH SCROLL
    ===================================================== */

    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId = link.getAttribute("href");


            if (
                !targetId ||
                targetId === "#"
            ) {

                return;

            }


            const targetElement =
                document.querySelector(targetId);


            if (targetElement) {

                event.preventDefault();


                targetElement.scrollIntoView({

                    behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches
                        ? "auto"
                        : "smooth",

                    block: "start"

                });

            }

        });

    });


    /* =====================================================
       08. PROJECT CARD REVEAL ANIMATION
    ===================================================== */

    const revealCards = document.querySelectorAll(
        ".portfolio-card, .featured-project-card, .process-card"
    );


    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    if (
        "IntersectionObserver" in window &&
        !prefersReducedMotion
    ) {

        const revealObserver = new IntersectionObserver(

            (entries, observer) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "is-visible"
                        );

                        observer.unobserve(entry.target);

                    }

                });

            },

            {
                threshold: 0.12,

                rootMargin: "0px 0px -40px 0px"

            }

        );


        revealCards.forEach((card) => {

            revealObserver.observe(card);

        });

    } else {

        revealCards.forEach((card) => {

            card.classList.add("is-visible");

        });

    }


    /* =====================================================
       09. INITIALIZE PORTFOLIO
    ===================================================== */

    filterPortfolio("all");


    /* =====================================================
       10. INITIALIZE NAVIGATION
    ===================================================== */

    closeMobileMenu();


    /* =====================================================
       11. PAGE READY
    ===================================================== */

    document.body.classList.add(
        "portfolio-ready"
    );


});
