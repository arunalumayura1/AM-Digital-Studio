
// ========================================
// AM Digital Studio
// policy.js - Part 1
// Navigation & Basic Functions
// ========================================


// ===============================
// Select Elements
// ===============================

const navbar = document.querySelector(".navbar");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");


// ===============================
// Mobile Menu Toggle
// ===============================

menuToggle.addEventListener("click", () => {

    menuToggle.classList.toggle("active");
    navLinks.classList.toggle("active");

});


// ===============================
// Close Mobile Menu
// ===============================

navItems.forEach(item => {

    item.addEventListener("click", () => {

        menuToggle.classList.remove("active");
        navLinks.classList.remove("active");

    });

});


// ===============================
// Sticky Navbar
// ===============================

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        navbar.classList.add("sticky");

    } else {

        navbar.classList.remove("sticky");

    }

});


// ===============================
// Smooth Scroll
// ===============================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function(e){

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if(target){

            target.scrollIntoView({

                behavior:"smooth"

            });

        }

    });

});


// ===============================
// Console Branding
// ===============================

console.log("%cAM Digital Studio",
"font-size:24px;font-weight:bold;color:#1677ff;");

console.log("%cPrivacy Policy Loaded",
"font-size:15px;color:green;");

// ========================================
// policy.js - Part 2
// Animations & Effects
// ========================================


// ===============================
// Scroll Reveal Animation
// ===============================

const cards = document.querySelectorAll(".policy-card");

function revealCards(){

    const trigger = window.innerHeight * 0.85;

    cards.forEach(card =>{

        const top = card.getBoundingClientRect().top;

        if(top < trigger){

            card.classList.add("show");

        }

    });

}

window.addEventListener("scroll", revealCards);
window.addEventListener("load", revealCards);


// ===============================
// Progress Bar
// ===============================

const progressBar = document.createElement("div");

progressBar.className = "progress-bar";

document.body.appendChild(progressBar);

window.addEventListener("scroll", () =>{

    const scrollTop = document.documentElement.scrollTop;

    const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

    const progress = (scrollTop / scrollHeight) * 100;

    progressBar.style.width = progress + "%";

});


// ===============================
// Back To Top Button
// ===============================

const topButton = document.createElement("button");

topButton.className = "back-to-top";

topButton.innerHTML = "↑";

document.body.appendChild(topButton);

window.addEventListener("scroll", () =>{

    if(window.scrollY > 400){

        topButton.classList.add("show-top");

    }else{

        topButton.classList.remove("show-top");

    }

});

topButton.addEventListener("click", () =>{

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});


// ===============================
// Page Loaded Animation
// ===============================

window.addEventListener("load", () =>{

    document.body.classList.add("page-loaded");

});


// ===============================
// Keyboard Shortcut
// Press H = Home
// ===============================

document.addEventListener("keydown", (e)=>{

    if(e.key.toLowerCase()==="h"){

        window.location.href="home.html";

    }

});


// ===============================
// Footer Year
// ===============================

const year = document.querySelector(".year");

if(year){

    year.textContent = new Date().getFullYear();

}


// ===============================
// Console Message
// ===============================

console.log("%cPrivacy Policy Ready",
"color:#1677ff;font-size:16px;font-weight:bold;");


// ========================================
// End of policy.js
// ========================================
