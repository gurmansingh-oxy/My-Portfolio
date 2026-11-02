
/* =====================================
   GURMAN PORTFOLIO — INTERACTIONS
===================================== */

document.documentElement.classList.add("js-ready");

// 1. MOBILE NAVIGATION
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const open = navLinks.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.textContent = open ? "✕" : "☰";
    });

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.textContent = "☰";
        });
    });
}

// 2. AUTOMATIC FOOTER YEAR
const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// 3. ADD ANIMATED BACKGROUND
const ambient = document.createElement("div");
ambient.id = "ambient-bg";
ambient.setAttribute("aria-hidden", "true");

ambient.innerHTML = `
    <div class="aurora aurora-one"></div>
    <div class="aurora aurora-two"></div>
    <div class="aurora aurora-three"></div>
    <div class="grid-overlay"></div>
    <div class="noise-overlay"></div>
    <canvas id="particle-canvas"></canvas>
`;

document.body.prepend(ambient);

// Keep the ambient background behind the page content.
const cursorGlow = document.createElement("div");
cursorGlow.id = "cursor-glow";
cursorGlow.setAttribute("aria-hidden", "true");
document.body.appendChild(cursorGlow);

// 4. MOUSE GLOW
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (canHover.matches && !reducedMotion.matches) {
    let mouseX = -500;
    let mouseY = -500;
    let glowX = mouseX;
    let glowY = mouseY;
    let pointerMoved = false;

    window.addEventListener("pointermove", event => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        pointerMoved = true;
    }, { passive: true });

    function animateGlow() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;

        cursorGlow.style.transform =
            `translate3d(${glowX - 170}px, ${glowY - 170}px, 0)`;

        cursorGlow.style.opacity = pointerMoved ? "1" : "0";

        requestAnimationFrame(animateGlow);
    }

    animateGlow();
} else {
    cursorGlow.remove();
}

// 5. PARTICLE BACKGROUND
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

let particles = [];
let width = 0;
let height = 0;
let animationFrame;
let lastFrame = 0;

function resizeCanvas() {
    const rect = ambient.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = rect.width;
    height = rect.height;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = reducedMotion.matches
        ? 0
        : Math.min(75, Math.floor(width * height / 18000));

    particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.4,
        speed: Math.random() * 0.22 + 0.06,
        phase: Math.random() * Math.PI * 2
    }));
}

function drawParticles(time = 0) {
    animationFrame = requestAnimationFrame(drawParticles);

    // Limit animation work to about 30 frames per second.
    if (time - lastFrame < 33) return;
    lastFrame = time;

    ctx.clearRect(0, 0, width, height);

    particles.forEach(particle => {
        if (!reducedMotion.matches) {
            particle.y -= particle.speed;
            particle.phase += 0.008;
        }

        if (particle.y < -5) {
            particle.y = height + 5;
            particle.x = Math.random() * width;
        }

        const alpha = 0.3 + (Math.sin(particle.phase) + 1) * 0.25;

        ctx.beginPath();
        ctx.arc(
            particle.x,
            particle.y,
            particle.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = `rgba(190, 165, 255, ${alpha})`;
        ctx.fill();
    });
}

resizeCanvas();
drawParticles();

window.addEventListener("resize", resizeCanvas, { passive: true });

// 6. REVEAL SECTIONS WHEN THEY ENTER THE VIEW
const revealTargets = document.querySelectorAll(
    ".hero-content, .hero-art, .about > *, #skills > *, " +
    "#projects > *, #contact > *, .info-card, .skill, .project-card"
);

revealTargets.forEach((element, index) => {
    element.classList.add("reveal");

    if (index % 3 === 1) {
        element.classList.add("reveal-delay-1");
    } else if (index % 3 === 2) {
        element.classList.add("reveal-delay-2");
    }
});

if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    revealTargets.forEach(element => observer.observe(element));
} else {
    revealTargets.forEach(element => element.classList.add("visible"));
}

// 7. HIGHLIGHT THE CURRENT NAVIGATION SECTION
const sections = document.querySelectorAll("main section[id]");
const navItems = document.querySelectorAll(".nav-links a");

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            navItems.forEach(link => {
                const active = link.getAttribute("href") ===
                    `#${entry.target.id}`;

                if (active) {
                    link.classList.add("active");
                } else {
                    link.classList.remove("active");
                }
            });
        });
    }, {
        rootMargin: "-25% 0px -60% 0px"
    });

    sections.forEach(section => sectionObserver.observe(section));
}

// 8. HANDLE CHANGES TO REDUCED-MOTION PREFERENCE
reducedMotion.addEventListener?.("change", () => {
    resizeCanvas();

    if (reducedMotion.matches) {
        cancelAnimationFrame(animationFrame);
        ctx.clearRect(0, 0, width, height);
    } else {
        cancelAnimationFrame(animationFrame);
        drawParticles();
    }
});
// ===== 9. TYPING ANIMATION =====

const typingElement = document.getElementById("typing-text");

if (typingElement && !reducedMotion.matches) {
    const words = [
        "Developer",
        "AI/ML Student",
        "Python Learner",
        "Problem Solver"
    ];

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function typeEffect() {
        const word = words[wordIndex];

        typingElement.textContent = word.substring(0, charIndex);

        if (!deleting) {
            charIndex++;

            if (charIndex > word.length) {
                deleting = true;
                setTimeout(typeEffect, 1000);
                return;
            }
        } else {
            charIndex--;

            if (charIndex < 0) {
                deleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                charIndex = 0;
            }
        }

        setTimeout(typeEffect, deleting ? 45 : 100);
    }

    typeEffect();
} else if (typingElement) {
    typingElement.textContent = "Developer";
}


// ===== 10. 3D PROJECT CARD TILT =====

const projectCards = document.querySelectorAll(".project-card");

if (canHover.matches && !reducedMotion.matches) {
    projectCards.forEach(card => {
        card.addEventListener("pointermove", event => {
            const rect = card.getBoundingClientRect();

            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;

            card.style.setProperty("--tilt-x", `${(x - 0.5) * 12}deg`);
            card.style.setProperty("--tilt-y", `${(0.5 - y) * 12}deg`);
        });

        card.addEventListener("pointerleave", () => {
            card.style.setProperty("--tilt-x", "0deg");
            card.style.setProperty("--tilt-y", "0deg");
        });
    });
}


// ===== 11. NEON MOUSE TRAIL =====

if (canHover.matches && !reducedMotion.matches) {
    let lastTrail = 0;

    window.addEventListener("pointermove", event => {
        const now = performance.now();

        if (now - lastTrail < 35) return;

        lastTrail = now;

        const particle = document.createElement("span");
        particle.className = "trail-particle";

        particle.style.left = `${event.clientX}px`;
        particle.style.top = `${event.clientY}px`;

        document.body.appendChild(particle);

        setTimeout(() => particle.remove(), 700);
    }, { passive: true });
}