
/* =========================================================
   AM DIGITAL STUDIO — PORTFOLIO JS
   Interactive Portfolio System
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";


    /* =====================================================
       1. ELEMENT SELECTORS
    ===================================================== */

    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("nav-menu");

    const filterButtons = document.querySelectorAll(".filter-btn");
    const portfolioCards = document.querySelectorAll(".portfolio-card");

    const portfolioGrid = document.getElementById("portfolio-grid");
    const portfolioEmpty = document.getElementById("portfolio-empty");

    const projectModal = document.getElementById("project-modal");
    const modalClose = document.getElementById("modal-close");

    const modalImage = document.getElementById("modal-project-image");
    const modalCategory = document.getElementById("modal-project-category");
    const modalTitle = document.getElementById("modal-project-title");
    const modalDescription = document.getElementById("modal-project-description");
    const modalTags = document.getElementById("modal-project-tags");

    const currentYear = document.getElementById("current-year");


    /* =====================================================
       2. MOBILE NAVIGATION
    ===================================================== */

    if (menuToggle && navMenu) {

        menuToggle.addEventListener("click", function () {

            const isOpen = navMenu.classList.toggle("active");

            menuToggle.setAttribute("aria-expanded", isOpen);

            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation menu" : "Open navigation menu"
            );

            menuToggle.innerHTML = isOpen
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-bars"></i>';

        });


        // Close menu when clicking a navigation link

        navMenu.querySelectorAll("a").forEach(function (link) {

            link.addEventListener("click", function () {

                navMenu.classList.remove("active");

                menuToggle.setAttribute("aria-expanded", "false");

                menuToggle.setAttribute("aria-label", "Open navigation menu");

                menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';

            });

        });


        // Close menu when clicking outside

        document.addEventListener("click", function (event) {

            const clickedInsideMenu = navMenu.contains(event.target);
            const clickedToggle = menuToggle.contains(event.target);

            if (!clickedInsideMenu && !clickedToggle) {

                navMenu.classList.remove("active");

                menuToggle.setAttribute("aria-expanded", "false");

                menuToggle.setAttribute("aria-label", "Open navigation menu");

                menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';

            }

        });

    }


    /* =====================================================
       3. PORTFOLIO FILTER SYSTEM
    ===================================================== */

    function filterProjects(category) {

        let visibleProjects = 0;

        portfolioCards.forEach(function (card, index) {

            const projectCategory = card.dataset.category;

            const shouldShow =
                category === "all" || projectCategory === category;

            if (shouldShow) {

                card.classList.remove("hide");

                card.style.animation = "none";

                // Restart animation
                void card.offsetWidth;

                card.style.animation = `projectFadeIn 0.5s ease ${index * 0.06}s both`;

                visibleProjects++;

            } else {

                card.classList.add("hide");

            }

        });


        // Show or hide empty state

        if (portfolioEmpty) {

            if (visibleProjects === 0) {

                portfolioEmpty.classList.add("show");

                if (portfolioGrid) {
                    portfolioGrid.style.display = "none";
                }

            } else {

                portfolioEmpty.classList.remove("show");

                if (portfolioGrid) {
                    portfolioGrid.style.display = "grid";
                }

            }

        }

    }


    // Add click events to filter buttons

    filterButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const selectedCategory = button.dataset.filter;

            // Remove active class from all buttons

            filterButtons.forEach(function (btn) {

                btn.classList.remove("active");

                btn.setAttribute("aria-pressed", "false");

            });


            // Activate selected button

            button.classList.add("active");

            button.setAttribute("aria-pressed", "true");


            // Filter projects

            filterProjects(selectedCategory);

        });

    });


    // Initial filter

    filterProjects("all");


    /* =====================================================
       4. PROJECT DATA
    ===================================================== */

    const projects = {

        "project-01": {

            title: "Modern Website Experience",

            category: "WEB DESIGN",

            description:
                "A visually engaging and responsive digital experience designed for modern audiences. This project focuses on clean layouts, modern UI elements, responsive behavior, and a professional digital identity.",

            image: "images/portfolio-website.jpg",

            tags: [
                "UI/UX",
                "Responsive Design",
                "Web Development",
                "Modern Layout"
            ]

        },


        "project-02": {

            title: "Cinematic Video Production",

            category: "VIDEO EDITING",

            description:
                "A creative video editing project featuring smooth transitions, cinematic color grading, engaging storytelling, and carefully selected sound effects to create a professional visual experience.",

            image: "images/portfolio-video.jpg",

            tags: [
                "Video Editing",
                "CapCut",
                "Color Grading",
                "Transitions"
            ]

        },


        "project-03": {

            title: "Creative Promotional Design",

            category: "GRAPHIC DESIGN",

            description:
                "An eye-catching promotional design created to communicate a brand message effectively. The visual composition combines modern typography, attractive colors, and creative layouts.",

            image: "images/portfolio-graphic.jpg",

            tags: [
                "Graphic Design",
                "Social Media",
                "Posters",
                "Creative Design"
            ]

        },


        "project-04": {

            title: "Brand Identity Design",

            category: "BRANDING",

            description:
                "A cohesive visual identity concept created to establish a recognizable and memorable brand presence. This project focuses on visual consistency and professional presentation.",

            image: "images/portfolio-branding.jpg",

            tags: [
                "Brand Identity",
                "Logo Design",
                "Visual Identity",
                "Branding"
            ]

        },


        "project-05": {

            title: "Interactive Dashboard UI",

            category: "WEB DESIGN",

            description:
                "A clean and intuitive dashboard interface designed with usability and visual hierarchy in mind. The interface presents information through modern components and organized layouts.",

            image: "images/portfolio-dashboard.jpg",

            tags: [
                "Dashboard",
                "UI Design",
                "User Interface",
                "Web Design"
            ]

        },


        "project-06": {

            title: "Social Media Reels",

            category: "VIDEO EDITING",

            description:
                "An engaging short-form video editing project optimized for social media platforms. The content uses dynamic cuts, captions, transitions, and sound design to capture audience attention.",

            image: "images/portfolio-shortvideo.jpg",

            tags: [
                "Reels",
                "YouTube Shorts",
                "CapCut",
                "Social Media"
            ]

        }

    };


    /* =====================================================
       5. OPEN PROJECT MODAL
    ===================================================== */

    const viewProjectButtons = document.querySelectorAll("[data-view-project]");


    function openProjectModal(projectId) {

        const project = projects[projectId];

        if (!project || !projectModal) {
            return;
        }


        // Update modal content

        modalTitle.textContent = project.title;

        modalCategory.textContent = project.category;

        modalDescription.textContent = project.description;

        modalImage.src = project.image;

        modalImage.alt = project.title;


        // Generate project tags

        modalTags.innerHTML = "";

        project.tags.forEach(function (tag) {

            const tagElement = document.createElement("span");

            tagElement.textContent = tag;

            modalTags.appendChild(tagElement);

        });


        // Open modal

        projectModal.classList.add("active");

        projectModal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";


        // Focus close button

        if (modalClose) {
            modalClose.focus();
        }

    }


    // Add event listeners to project buttons

    viewProjectButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const projectId = button.dataset.viewProject;

            openProjectModal(projectId);

        });

    });


    // Also allow clicking the card image area to open details

    portfolioCards.forEach(function (card) {

        const projectId = card.dataset.project;

        const projectViewButton = card.querySelector(".project-view-btn");

        if (!projectViewButton) {
            return;
        }

        card.addEventListener("keydown", function (event) {

            if (
                event.target === card &&
                (event.key === "Enter" || event.key === " ")
            ) {

                event.preventDefault();

                openProjectModal(projectId);

            }

        });

    });


    /* =====================================================
       6. CLOSE PROJECT MODAL
    ===================================================== */

    function closeProjectModal() {

        if (!projectModal) {
            return;
        }

        projectModal.classList.remove("active");

        projectModal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";

    }


    // Close button

    if (modalClose) {

        modalClose.addEventListener("click", closeProjectModal);

    }


    // Click outside modal

    if (projectModal) {

        projectModal.querySelectorAll("[data-close-modal]").forEach(function (element) {

            element.addEventListener("click", closeProjectModal);

        });

    }


    // Escape key

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            closeProjectModal();

        }

    });


    /* =====================================================
       7. CURRENT YEAR
    ===================================================== */

    if (currentYear) {

        currentYear.textContent = new Date().getFullYear();

    }


    /* =====================================================
       8. SMOOTH BACK TO TOP
    ===================================================== */

    const backToTop = document.querySelector(".back-to-top");

    if (backToTop) {

        backToTop.addEventListener("click", function (event) {

            event.preventDefault();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }


    /* =====================================================
       9. PROJECT IMAGE FALLBACK
    ===================================================== */

    document.querySelectorAll(".project-image img").forEach(function (image) {

        image.addEventListener("error", function () {

            image.style.display = "none";

            image.parentElement.style.background =
                "linear-gradient(135deg, #6557ff, #2788ff, #a855f7)";

        });

    });


    /* =====================================================
       10. CONSOLE MESSAGE
    ===================================================== */

    console.log(
        "%c AM Digital Studio | Portfolio Loaded Successfully ",
        "background: linear-gradient(120deg, #6557ff, #2788ff); color: white; padding: 10px; border-radius: 5px; font-weight: bold;"
    );

});
