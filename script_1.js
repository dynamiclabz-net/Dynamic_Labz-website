// =========================================
// HYBRID PRELOADER & SEAMLESS TRANSITIONS
// =========================================
document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById('preloader');
    const geomLogo = document.querySelector('.geom-logo');
    const gemLines = document.querySelectorAll('.gem-line');
    const progressText = document.getElementById('progress-text');
    const loadingTextWrap = document.querySelector('.loading-text');
    const pageTransition = document.getElementById('page-transition');

    // 1. Check browser memory: Is this their first page load of the session?
    const isFirstVisit = !sessionStorage.getItem('dynamicLabzLoaded');

    if (isFirstVisit && preloader) {
        // ==========================================
        // SCENARIO A: FIRST VISIT (Cinematic Preloader)
        // ==========================================
        document.body.style.overflow = 'hidden';
        if (typeof lenis !== 'undefined') lenis.stop();

        // Setup SVG Lines
        gemLines.forEach(line => {
            const length = line.getTotalLength();
            line.style.strokeDasharray = length;
            line.style.strokeDashoffset = length;
        });

        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 2;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                executeExitAnimation();
            }
            if(progressText) progressText.innerText = `${progress}%`;

            const drawProgress = progress / 100;
            gemLines.forEach(line => {
                const length = line.getTotalLength();
                gsap.to(line, { strokeDashoffset: length * (1 - drawProgress), duration: 0.3, ease: "power1.out" });
            });
        }, 150);

        function executeExitAnimation() {
            gemLines.forEach(line => line.classList.add('filled'));
            if(loadingTextWrap) loadingTextWrap.style.opacity = '0';

            setTimeout(() => {
                const tl = gsap.timeline({
                    onComplete: () => {
                        preloader.style.display = 'none';
                        document.body.style.overflow = '';
                        if (typeof lenis !== 'undefined') lenis.start();
                        
                        // Mark the site as loaded in memory so this doesn't run again!
                        sessionStorage.setItem('dynamicLabzLoaded', 'true');
                        
                        // Fade out the transition overlay
                        if(pageTransition) pageTransition.style.opacity = '0';
                    }
                });

                tl.to(geomLogo, { scale: 35, opacity: 0, duration: 1.0, ease: "power3.in" })
                  .to(preloader, { opacity: 0, duration: 0.5 }, "-=0.4");
            }, 150);
        }
    } else {
        // ==========================================
        // SCENARIO B: SUBSEQUENT VISIT (Seamless Fade)
        // ==========================================
        if (preloader) preloader.style.display = 'none'; // Instantly hide the big preloader
        
        // Just fade out the dark screen to reveal the new page beautifully
        if (pageTransition) {
            setTimeout(() => {
                pageTransition.style.opacity = '0';
            }, 50); // Tiny delay ensures the browser has rendered the CSS
        }
    }

    // ==========================================
    // 2. INTERCEPT CLICKS FOR FADE-OUT TRANSITION
    // ==========================================
    const links = document.querySelectorAll('a');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetUrl = this.getAttribute('href');
            const targetObj = this.getAttribute('target');

            if (!targetUrl) return;

            // SMART DETECTION: Check if the link is just scrolling to a section on the SAME page (like #services)
            // We don't want to trigger reloading/transitions just for scrolling!
            const currentPath = window.location.pathname;
            const isSamePageAnchor = targetUrl.includes('#') && (
                targetUrl.startsWith('#') || 
                currentPath.endsWith(targetUrl.split('#')[0]) || 
                (currentPath.endsWith('/') && targetUrl.split('#')[0] === 'index.html')
            );

            // Only intercept true internal page changes (ignore emails, external links, and same-page scrolling)
            if (!targetUrl.startsWith('http') && 
                !targetUrl.startsWith('mailto:') &&
                !targetUrl.startsWith('tel:') &&
                targetObj !== '_blank' &&
                !isSamePageAnchor) {
                
                e.preventDefault(); // Stop the harsh browser jump
                
                // --- THE HOMEPAGE LOGIC UPGRADE ---
                // Is the user navigating back to the Home page?
                const isNavigatingToHome = targetUrl.startsWith('index.html') || targetUrl === '/';

                if (isNavigatingToHome) {
                    // Force the browser to "forget" the visit so the cinematic preloader plays!
                    sessionStorage.removeItem('dynamicLabzLoaded');
                }
                // ----------------------------------

                // Fade screen to black
                const pageTransition = document.getElementById('page-transition');
                if (pageTransition) {
                    pageTransition.style.opacity = '1';
                    pageTransition.style.pointerEvents = 'all'; // Prevent double-clicking
                }
                
                // Wait for the black screen to cover the viewport (0.4s), then navigate
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 400); 
            }
        });
    });
});

// 1. INIT SMOOTH SCROLL (Lenis) & CAPTURE VELOCITY
let scrollVelocity = 0; // Global variable to track scroll speed

const lenis = new Lenis({ 
    smooth: true, 
    lerp: 0.08 
});

function raf(time) { 
    lenis.raf(time); 
    // Capture the exact velocity of the user's scroll
    scrollVelocity = lenis.velocity; 
    requestAnimationFrame(raf); 
}
requestAnimationFrame(raf);

// 2. THE QUANTUM NETWORK (Hyperspace Canvas API)
const canvas = document.getElementById('quantum-network');
const ctx = canvas.getContext('2d');
let width, height, particles = [];
let mouse = { x: null, y: null, radius: 150 };

window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
window.addEventListener('resize', initCanvas);

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
    }
    
    // THE HYPERSPACE DRAW FUNCTION
    draw() {
        ctx.beginPath();
        let stretchY = scrollVelocity * 0.8; 
        
        if (Math.abs(stretchY) > 1) {
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y - stretchY);
            
            // NEW: Multiplied by 3 for significantly thicker warp lines
            ctx.lineWidth = this.size * 2;
            
            ctx.strokeStyle = 'rgba(118, 31, 227, 0.8)';
            ctx.lineCap = "round";
            ctx.stroke();
        } else {
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(118, 31, 227, 0.8)';
            ctx.fill();
        }
    }
    
    update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
            this.x -= directionX;
            this.y -= directionY;
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 10;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 10;
            }
        }
    }
}

function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    
    // OLD: let numParticles = (width * height) / 9000;
    // NEW: Dynamic density based on screen size (less dense on mobile)
    let densityDivider = window.innerWidth < 768 ? 12000 : 8000;
    let numParticles = (width * height) / densityDivider;
    
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
}
initCanvas();

function animateCanvas() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        for (let j = i; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                ctx.beginPath();

                let speedFactor = Math.abs(scrollVelocity) / 30;

                // NEW: Updated math to match the new 150 distance
                let lineOpacity = Math.max(0, (1 - distance / 150) - speedFactor);

                ctx.strokeStyle = `rgba(118, 31, 227, ${lineOpacity})`;

                // NEW: Thinner, cleaner connecting lines
                ctx.lineWidth = 1;

                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateCanvas);
}
animateCanvas();

// 4. GSAP / CURSOR LOGIC
gsap.registerPlugin(ScrollTrigger);
const cursorRing = document.querySelector('.cursor-ring');

document.addEventListener('mousemove', (e) => {
    if(window.innerWidth > 992) {
        gsap.to(cursorRing, { x: e.clientX, y: e.clientY, duration: 0.1 });
    }
});

document.querySelectorAll('a, .glass-card, .portfolio-card').forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to(cursorRing, { scale: 1.5, duration: 0.2, overwrite: "auto" }));
    el.addEventListener('mouseleave', () => gsap.to(cursorRing, { scale: 1, duration: 0.2, overwrite: "auto" }));
});

// Infinite Marquee for Tech Stack (Scrolling Left)
    gsap.to(".stack-track", {
        xPercent: -50,
        repeat: -1,
        duration: 25, // Slightly slower for readability
        ease: "linear"
    });

// Fade Ups
gsap.utils.toArray('.fade-up').forEach(elem => {
    gsap.from(elem, {
        scrollTrigger: { trigger: elem, start: "top 85%" },
        y: 40, opacity: 0, duration: 1, ease: "power2.out"
    });
});

// Cinematic Title Reveal
const heroTitle = new SplitType('.reveal-text', { types: 'chars' });
gsap.fromTo(heroTitle.chars, 
    { opacity: 0, filter: "blur(10px)", y: 20 },
    { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.8, stagger: 0.02, ease: "power3.out", delay: 0.2 }
);

// --------------------------------------------------------
// 5. 3D MAGNETIC BENTO BOXES
// --------------------------------------------------------
// NEW: Added a safety check so it doesn't crash pages without this library
if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll(".portfolio-card"), {
        max: 8,              // Maximum tilt rotation (degrees)
        speed: 400,          // Speed of the enter/exit transition
        glare: true,         // Enables the glass glare effect
        "max-glare": 0.15,   // Maximum opacity of the glare (0 to 1)
        scale: 1.02          // Slight pop-out effect on hover
    });
}

// =========================================
// TESTIMONIAL CAROUSEL (BUTTONS & DOTS)
// =========================================
const testCarousel = document.querySelector('.test-carousel');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const dotsContainer = document.querySelector('.carousel-dots');

if (testCarousel) {
    const cards = testCarousel.querySelectorAll('.test-card');
    
    // 1. Generate the Dots dynamically
    if (dotsContainer && cards.length > 0) {
        cards.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active'); // First dot is active by default
            
            // Allow users to click a dot to jump to that card
            dot.addEventListener('click', () => {
                // Calculate card width + the 2rem (32px) gap
                const cardWidth = cards[0].offsetWidth + 32; 
                testCarousel.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
            });
            
            dotsContainer.appendChild(dot);
        });
    }

    // 2. Update the Active Dot when scrolling
    testCarousel.addEventListener('scroll', () => {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        const scrollPos = testCarousel.scrollLeft;
        const cardWidth = cards[0].offsetWidth + 32; 
        
        // Math to figure out which card is currently in the center
        const currentIndex = Math.round(scrollPos / cardWidth);
        
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    });

    // 3. Left and Right Button Logic
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            const cardWidth = cards[0].offsetWidth + 32;
            testCarousel.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            const cardWidth = cards[0].offsetWidth + 32;
            testCarousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });
    }
}

// =========================================
// FULLSCREEN CASE STUDY LOGIC
// =========================================

let allCaseStudies = {
//<!-- The MEWA Modal -->
    'cs-the-mewa':`<div class="case-study-overlay" id="cs-the-mewa" data-lenis-prevent>
        <button class="close-cs-btn" onclick="closeCaseStudy('cs-the-mewa')">
            <i class="fa-solid fa-xmark"></i>
        </button>
        
        <div class="container" style="max-width: 1200px;"> 
            
            <div class="cs-header fade-up" style="text-align: center; border-bottom: none; padding-bottom: 0;">
                <span class="p-category text-brand">Case Study</span>
                <h1 class="hero-title reveal-text" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem;">The MEWA</h1>
                <p class="hero-desc" style="margin: 0 auto;">Fintech Web & App Platform for Financial Advisory</p>
            </div>

            <div class="cs-content fade-up">
                
                <div class="cs-slider-wrapper" style="position: relative; margin-top: 3rem; margin-bottom: 4rem; border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); height: 500px; background: var(--surface);">
                    <div class="cs-slider" style="display: flex; width: 100%; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none;">
                        
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_The-MEWA/MewaApp-mix-devices-dark.png" alt="The MEWA App Screenshot 1" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_The-MEWA/MewaApp-Login.png" alt="The MEWA App Screenshot 1" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_The-MEWA/MewaApp-FII-DII.png" alt="The MEWA App Screenshot 2" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_The-MEWA/MewaApp-Equity.png" alt="The MEWA App Screenshot 3" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_The-MEWA/MewaApp-Commodity.png" alt="The MEWA App Screenshot 3" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                    </div>
                    
                    <button class="slider-btn prev-cs-btn" style="position: absolute; z-index: 3; top: 50%; left: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="slider-btn next-cs-btn" style="position: absolute; z-index: 3; top: 50%; right: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-right"></i></button>
                </div>

                <div class="cs-grid" style="grid-template-columns: 1fr; gap: 4rem;">
                    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Problem Statement</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 1.5rem; font-weight: 500;">Delivering Real-Time Financial Intelligence</h4>
                        <p class="cs-text">In the fast-paced world of stock market trading, retail investors constantly struggle to find reliable, real-time market recommendations. Existing platforms in the market were either too complex for everyday users, lacked instant alert delivery, or did not offer a secure infrastructure for personalized financial advisory.</p>
                        <p class="cs-text">Our client required a highly secure, subscription-based ecosystem that could deliver instantaneous stock alerts, manage tiered user memberships seamlessly, and present complex financial data through a clean, intuitive interface across both web and mobile devices.</p>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Our Solution</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 1.5rem; font-weight: 500;">Secure Cross-Platform Fintech Ecosystem</h4>
                        <p class="cs-text">Dynamic Labz engineered a robust, high-performance web portal and mobile application ecosystem for The MEWA. We focused heavily on backend security and data delivery speed, ensuring that premium subscribers receive real-time stock recommendations without a millisecond of delay.</p>
                        <p class="cs-text">The platform features a deeply integrated subscription management system, allowing users to seamlessly upgrade tiers and unlock premium advisory features. We implemented strict Role-Based Access Control (RBAC) to protect sensitive financial data, alongside an automated push-notification engine to ensure traders never miss a crucial market movement. The entire UI/UX was designed to inspire trust and simplify the trading advisory experience.</p>
                    </div>

                    <!-- <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
                        <div class="glass-card sec-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden;">
                                <img loading="lazy" src="assets/images/portfolio/mewa-sec1.jpg" alt="Real-Time Alerts" class="sec-img" style="width: 100%; height: 100%; object-fit: fill; filter: grayscale(40%); transition: 0.5s ease;">
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand" style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION 01</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Real-Time Market Alerts</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">Instantaneous push notifications and live feeds for premium stock recommendations.</p>
                            </div>
                        </div>

                        <div class="glass-card sec-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden;">
                                <img loading="lazy" src="assets/images/portfolio/mewa-sec2.jpg" alt="Subscription Management" class="sec-img" style="width: 100%; height: 100%; object-fit: fill; filter: grayscale(40%); transition: 0.5s ease;">
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand" style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION 02</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Subscription Engine</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">Secure payment gateways managing automated billing and tiered access control.</p>
                            </div>
                        </div>

                        <div class="glass-card sec-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden;">
                                <img loading="lazy" src="assets/images/portfolio/mewa-sec3.jpg" alt="Advisory Dashboard" class="sec-img" style="width: 100%; height: 100%; object-fit: fill; filter: grayscale(40%); transition: 0.5s ease;">
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand" style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION 03</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Advisory Dashboard</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">A clean, data-rich interface providing users with in-depth financial insights and portfolio strategies.</p>
                            </div>
                        </div>
                    </div> -->

                    <div>
                        <h3 class="cs-section-title text-brand">Key Features</h3>
                        <ul class="pillar-list" style="margin-top: 1.5rem;">
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Instantaneous Alert Delivery:</span> Low-latency push notifications ensuring traders never miss market moves.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Secure Payment Integration:</span> Encrypted processing for recurring subscriptions and premium memberships.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Cross-Platform Architecture:</span> A unified experience across the web portal, iOS, and Android applications.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Admin Command Center:</span> A robust backend allowing the advisory team to broadcast updates instantly to specific user tiers.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Enterprise-Grade Security:</span> Strict data protection protocols safeguarding user identities and financial transactions.</li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Results</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Scaling Financial Advisory Operations</h4>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Zero-Latency Alert Delivery</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">Successfully architected a data pipeline capable of delivering real-time stock recommendations without delays.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Streamlined User Onboarding</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">Automated the subscription and registration process, drastically reducing drop-offs during sign-up.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Enhanced Retention Rates</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">The premium, user-friendly interface significantly improved customer satisfaction and recurring subscription renewals.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Secure Data Infrastructure</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">Achieved 100% compliance with digital security standards, fostering immense trust with retail investors.</p>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Benefits</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Benefits of The MEWA Platform</h4>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-chart-line text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Predictable Revenue</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Drive consistent business growth through a fully automated subscription management engine.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-face-smile text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Customer Trust</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Build immense credibility with a fast, secure, and professional financial interface.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-mobile-screen text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Omnichannel Access</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Engage users wherever they are via seamlessly synced mobile and web platforms.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-gears text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Operational Efficiency</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Empower the advisory team to manage users and broadcast alerts effortlessly from one dashboard.</p>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 2rem; margin-bottom: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">FAQ</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Frequently Asked Questions</h4>
                        
                        <div class="faq-container" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">How secure is the user data and payment information?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">We utilize enterprise-grade encryption and partner with industry-leading, compliant payment gateways to ensure all financial and personal data is absolutely secure.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Is the platform available on both iOS and Android?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">Yes, The MEWA was engineered as a cross-platform solution, ensuring users have a flawless experience whether they are on an iPhone, Android device, or desktop browser.</p>
                                </div>
                            </div>

                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">How fast are the stock market alerts delivered?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">The architecture is optimized for zero-latency delivery, meaning push notifications hit user devices instantaneously the moment an advisory is published.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card" style="padding: 4rem; text-align: center; border-color: var(--brand); box-shadow: 0 10px 30px var(--brand-glow);">
                        <div class="quote-icon text-brand" style="margin-bottom: 2rem; display: flex; justify-content: center; opacity: 1;"><i class="fa-solid fa-quote-left" style="font-size: 3rem;"></i></div>
                        <p style="font-size: 1.25rem; font-style: italic; line-height: 1.8; margin-bottom: 2.5rem; color: white;">"Dynamic Labz built exactly what we envisioned—a blazing fast, highly secure platform that our traders can rely on. Their understanding of backend security and mobile app performance is top-tier. Highly recommended for complex fintech architecture."</p>
                        <strong class="text-brand" style="font-size: 1.2rem; font-family: var(--font-mono); text-transform: uppercase;">Founder & Lead Advisor</strong>
                        <span style="display: block; font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem;">The MEWA</span>
                    </div>

                </div>
            </div>
        </div>
    </div>`,
    
    //<!-- Baker's Hub Modal -->
    'cs-bakers-hub':`<div class="case-study-overlay" id="cs-bakers-hub" data-lenis-prevent>
        <button class="close-cs-btn" onclick="closeCaseStudy('cs-bakers-hub')">
            <i class="fa-solid fa-xmark"></i>
        </button>
        
        <div class="container" style="max-width: 1200px;"> 
            
            <div class="cs-header fade-up" style="text-align: center; border-bottom: none; padding-bottom: 0;">
                <span class="p-category text-brand">Case Study</span>
                <h1 class="hero-title reveal-text" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem;">Bakers Hub</h1>
                <p class="hero-desc" style="margin: 0 auto;">Baker's Bookkeeping Mobile App & Management Solution</p>
            </div>

            <div class="cs-content fade-up">
                
                <div class="cs-slider-wrapper" style="position: relative; margin-top: 3rem; margin-bottom: 4rem; border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); height: 500px; background: var(--surface);">
                    <div class="cs-slider" style="display: flex; width: 100%; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none;">
                        
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_BakersHub/BakersHub1.jpg" alt="Bakers Hub App Screenshot 1" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_BakersHub/BakersHub2.jpg" alt="Bakers Hub App Screenshot 2" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_BakersHub/BakersHub3.jpg" alt="Bakers Hub App Screenshot 3" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_BakersHub/BakersHub4.jpg" alt="Bakers Hub App Screenshot 3" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                    </div>
                    
                    <button class="slider-btn prev-cs-btn" style="position: absolute; z-index: 3; top: 50%; left: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="slider-btn next-cs-btn" style="position: absolute; z-index: 3; top: 50%; right: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-right"></i></button>
                </div>

                <div class="cs-grid" style="grid-template-columns: 1fr; gap: 4rem;">
                    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Problem Statement</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 1.5rem; font-weight: 500;">Managing Bakery Operations Efficiently</h4>
                        <p class="cs-text">Bakers juggle multiple responsibilities daily, from tracking sales and purchases to managing deliveries and maintaining ingredient stock. Traditional bookkeeping methods—often involving paper logs or spreadsheets—are time-consuming, prone to errors, and lack automated tracking.</p>
                        <p class="cs-text">Our client faced significant challenges in keeping financial records organized. They needed a comprehensive bookkeeping app that not only simplified sales tracking but also provided features like delivery notifications, inventory management, task scheduling, and price calculation for their baked products. An all-in-one digital solution was essential to boost efficiency.</p>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Our Solution</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 1.5rem; font-weight: 500;">Custom Baker's Bookkeeping App</h4>
                        <p class="cs-text">Recognizing the bakery industry's unique needs, Dynamic Labz developed a feature-rich mobile app tailored specifically for bakers. Available on both iOS and Android, the app seamlessly integrates sales tracking, purchase management, reminders, and business insights in one easy-to-use interface.</p>
                        <p class="cs-text">The app allows bakers to log every sale effortlessly. A built-in delivery notification system alerts them ahead of time, reducing missed deadlines. Additionally, an intuitive price calculator helps determine accurate pricing considering ingredient costs and margins. It also includes shopping list generation and task lists with deadline alerts, fully customized with a baker-friendly color theme.</p>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
                        <div class="glass-card sec-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden;">
                                <img loading="lazy" src="assets/images/project_BakersHub/order.png" alt="Sales Management" class="sec-img" style="width: 100%; height: 100%; object-fit: fill; filter: grayscale(40%); transition: 0.5s ease;">
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand" style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION 01</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Sales & Delivery Management</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">Easily log sales and set delivery alerts to ensure no orders are missed.</p>
                            </div>
                        </div>

                        <div class="glass-card sec-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden;">
                                <img loading="lazy" src="assets/images/project_BakersHub/expense.png" alt="Expense Adder" class="sec-img" style="width: 100%; height: 100%; object-fit: fill; filter: grayscale(40%); transition: 0.5s ease;">
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand" style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION 02</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Expense Details Adder</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">Track expenses and create auto-generated shopping lists based on supply needs.</p>
                            </div>
                        </div>

                        <div class="glass-card sec-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden;">
                                <img loading="lazy" src="assets/images/project_BakersHub/price_calculator.png" alt="Price Calculator" class="sec-img" style="width: 100%; height: 100%; object-fit: fill; filter: grayscale(40%); transition: 0.5s ease;">
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand" style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION 03</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Smart Price Calculator</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">Get an accurate cost estimate for each baked product, ensuring optimal pricing.</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand">Key Features</h3>
                        <ul class="pillar-list" style="margin-top: 1.5rem;">
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Sales & Delivery Tracking:</span> Record sales and receive automated delivery reminders.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Expense & Purchase Management:</span> Log expenses and generate smart shopping lists.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Price Calculator:</span> Calculate costs based on ingredients, labor, and profit margins.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Task List with Deadline Alerts:</span> Built-in to-do list with notifications for urgent tasks.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Cross-Platform:</span> Fully available and optimized for both iOS and Android devices.</li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Results</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Transforming Bakery Business Operations</h4>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">80% Faster Order Management</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">With automated sales tracking and delivery reminders, bakers reduced their order processing time by 80%, ensuring seamless customer service.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Significant Reduction in Financial Errors</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">The built-in bookkeeping features eliminated manual calculation errors, improving financial accuracy and reducing discrepancies.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Better Inventory & Purchase Planning</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">With smart shopping lists and purchase tracking, bakers optimized their ingredient procurement, reducing last-minute shortages.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Higher Productivity with Task Automation</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">The task list and deadline notifications kept bakers on top of their daily responsibilities, boosting efficiency.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Increased Profitability & Pricing Accuracy</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">The price calculator ensured precise costing, allowing bakers to set competitive yet profitable prices for their products.</p>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Benefits</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Benefits of Baker's Bookkeeping App</h4>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-chart-line text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Increased Sales</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Boost your revenue with optimized store features and effective marketing strategies.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-face-smile text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Customer Experience</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Provide a smooth and enjoyable shopping experience to retain customers.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-eye text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Brand Visibility</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Increase your brand's online presence with a well-designed and optimized app.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-gears text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Efficient Processes</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Simplify management with efficient inventory and customer support solutions.</p>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 2rem; margin-bottom: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">FAQ</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Frequently Asked Questions</h4>
                        
                        <div class="faq-container" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Is this app only for bakery businesses?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">No, while designed for bakers, the app's features—such as sales tracking, inventory management, and task automation—can be customized for other small businesses as well.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Can I customize the app's theme to match my bakery's brand colors?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">Yes! The app supports custom branding, allowing users to adjust colors and interface elements to match their bakery's style.</p>
                                </div>
                            </div>

                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">How does the delivery reminder feature work?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">When you log a sale with a delivery date, the system automatically notifies you before the due date to ensure timely fulfillment.</p>
                                </div>
                            </div>

                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Can multiple employees use the app?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">Yes, the app supports multiple user roles, allowing bakery staff to collaborate on sales, inventory, and task management.</p>
                                </div>
                            </div>

                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Is the app available on both Android and iOS?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">Absolutely! The app is fully functional on both platforms, ensuring smooth usability across different devices.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card" style="padding: 4rem; text-align: center; border-color: var(--brand); box-shadow: 0 10px 30px var(--brand-glow);">
                        <div class="quote-icon text-brand" style="margin-bottom: 2rem; display: flex; justify-content: center; opacity: 1;"><i class="fa-solid fa-quote-left" style="font-size: 3rem;"></i></div>
                        <p style="font-size: 1.25rem; font-style: italic; line-height: 1.8; margin-bottom: 2.5rem; color: white;">"Dynamic Labz delivered an outstanding solution tailored to our bakery business. Their bookkeeping app has completely transformed how we track sales, purchases, and deliveries. The automated reminders and pricing calculator alone have saved us countless hours! Their team understood our needs perfectly."</p>
                        <strong class="text-brand" style="font-size: 1.2rem; font-family: var(--font-mono); text-transform: uppercase;">Snehi Shah</strong>
                        <span style="display: block; font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem;">BakersHub</span>
                    </div>

                </div>
            </div>
        </div>
    </div>`,

    //<!-- E-Checkup Modal -->
    'cs-e-checkup':`<div class="case-study-overlay" id="cs-e-checkup" data-lenis-prevent>
        <button class="close-cs-btn" onclick="closeCaseStudy('cs-e-checkup')"><i class="fa-solid fa-xmark"></i></button>
        <div class="container" style="max-width: 1200px;">
    
            <div class="cs-header fade-up" style="text-align: center; border-bottom: none; padding-bottom: 0;">
                <span class="p-category text-brand">Case Study</span>
                <h1 class="hero-title reveal-text" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem;">
                    E-Checkup</h1>
                <p class="hero-desc" style="margin: 0 auto;">Smart Healthcare Coordination & Case Management App</p>
            </div>
    
            <div class="cs-content fade-up">
    
                <div class="cs-slider-wrapper"
                    style="position: relative; margin-top: 3rem; margin-bottom: 4rem; border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); height: 500px; background: var(--surface);">
                    
                    <div class="cs-slider" style="display: flex; width: 100%; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none;">
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_E-Checkup/E-Checkup-1.png" alt="E-Checkup App"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_E-Checkup/E-Checkup-2.png" alt="E-Checkup App"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_E-Checkup/E-Checkup-3.png" alt="E-Checkup App"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_E-Checkup/E-Checkup-4.png" alt="E-Checkup App"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_E-Checkup/E-Checkup-5.png" alt="E-Checkup App"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_E-Checkup/E-Checkup-6.png" alt="E-Checkup App"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_E-Checkup/E-Checkup-7.png" alt="E-Checkup App"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                    </div>
    
                    <button class="slider-btn prev-cs-btn"
                        style="position: absolute; z-index: 3; top: 50%; left: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i
                            class="fa-solid fa-chevron-left"></i></button>
                    <button class="slider-btn next-cs-btn"
                        style="position: absolute; z-index: 3; top: 50%; right: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i
                            class="fa-solid fa-chevron-right"></i></button>
                </div>
    
                <div class="cs-grid" style="grid-template-columns: 1fr; gap: 4rem;">
    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Problem Statement</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 1.5rem; font-weight: 500;">Fragmented Healthcare
                            Coordination</h4>
                        <p class="cs-text">Managing medical examinations and healthcare cases for policyholders is
                            traditionally a disjointed process. Patients, diagnostic centers, and insurance providers often
                            struggle with fragmented communication, scattered medical records, and an opaque view of case
                            progress. This lack of a unified system leads to delayed appointments, misplaced documents, and
                            inefficiencies for both the patient and the healthcare provider.</p>
                        <p class="cs-text">There was a critical need for a centralized, smart platform that could bridge the
                            gap between policyholders and service providers, ensuring seamless scheduling, secure data
                            handling, and absolute transparency throughout the medical coordination lifecycle.</p>
                    </div>
    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Our Solution</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 1.5rem; font-weight: 500;">Smart Healthcare
                            Coordination Ecosystem</h4>
                        <p class="cs-text">Dynamic Labz architected eCheckup—a highly secure, smart healthcare coordination
                            application tailored specifically for policyholders and medical service providers. We
                            centralized the entire case management process into a single, intuitive mobile interface.</p>
                        <p class="cs-text">The app empowers users to easily schedule video consultations, diagnostic center
                            visits, and online checkups. To ensure everyone stays in the loop, we integrated an instant
                            notification engine that provides real-time updates to all stakeholders. Furthermore, we
                            implemented a secure, encrypted document vault for medical reports alongside integrated
                            financial reporting tools designed to streamline operations for service providers.</p>
                    </div>
    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
                        <div class="glass-card sec-card"
                            style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div
                                style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden; background: rgba(118, 31, 227, 0.05); display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-stethoscope text-brand" style="font-size: 4rem; opacity: 0.5;"></i>
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand"
                                    style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION
                                    01</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Seamless Scheduling</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">Effortlessly book
                                    and manage video consultations, diagnostic center visits, or online medical checkups.
                                </p>
                            </div>
                        </div>
    
                        <div class="glass-card sec-card"
                            style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div
                                style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden; background: rgba(118, 31, 227, 0.05); display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-file-medical text-brand" style="font-size: 4rem; opacity: 0.5;"></i>
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand"
                                    style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION
                                    02</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Secure Document Vault</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">A fully encrypted
                                    system for uploading, storing, and sharing diagnostic reports and sensitive medical
                                    records.</p>
                            </div>
                        </div>
    
                        <div class="glass-card sec-card"
                            style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div
                                style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden; background: rgba(118, 31, 227, 0.05); display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-chart-pie text-brand" style="font-size: 4rem; opacity: 0.5;"></i>
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand"
                                    style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION
                                    03</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Transparent Case Tracking</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">Live progress
                                    tracking for policyholder cases, paired with integrated financial reporting for
                                    providers.</p>
                            </div>
                        </div>
                    </div>
    
                    <div>
                        <h3 class="cs-section-title text-brand">Key Features</h3>
                        <ul class="pillar-list" style="margin-top: 1.5rem;">
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Omnichannel
                                    Scheduling:</span> Book video consultations, clinic visits, and diagnostic tests
                                directly through the app.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Instant
                                    Notifications:</span> Real-time push alerts that keep patients, doctors, and providers
                                synchronized on case updates.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Secure Data
                                    Uploads:</span> Highly secure, compliant document handling for medical reports and
                                prescriptions.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Live Case
                                    Management:</span> Transparent status tracking from the initial checkup request to final
                                case closure.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Provider Financial
                                    Dashboard:</span> Integrated financial and billing reports simplifying backend
                                accounting for healthcare services.</li>
                        </ul>
                    </div>
    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Results</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Transforming Medical
                            Coordination</h4>
    
                        <div
                            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Enhanced Patient
                                    Experience</strong>
                                <p
                                    style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">
                                    Policyholders can now schedule and manage their healthcare requirements in minutes,
                                    eliminating long wait times and confusion.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Synchronized
                                    Communication</strong>
                                <p
                                    style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">
                                    The instant notification system completely resolved miscommunications between diagnostic
                                    centers, doctors, and patients.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Zero Data Loss</strong>
                                <p
                                    style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">
                                    Centralizing records via secure document uploads ensured that critical medical reports
                                    are never misplaced or inaccessible.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Streamlined Provider
                                    Billing</strong>
                                <p
                                    style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">
                                    Integrated financial reporting drastically reduced administrative overhead for
                                    healthcare service providers.</p>
                            </div>
                        </div>
                    </div>
    
                    <div style="margin-top: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Benefits</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Benefits of eCheckup App</h4>
    
                        <div
                            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                            <div class="glass-card"
                                style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-user-doctor text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Accessibility</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
                                    Provide policyholders with immediate, round-the-clock access to schedule necessary
                                    medical consultations.</p>
                            </div>
                            <div class="glass-card"
                                style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-shield-halved text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Data Security</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
                                    Maintain strict confidentiality and compliance with encrypted medical record handling.
                                </p>
                            </div>
                            <div class="glass-card"
                                style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-magnifying-glass-chart text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Total Transparency</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Give
                                    all parties a clear, transparent view of case progression from opening to closure.</p>
                            </div>
                            <div class="glass-card"
                                style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-money-check-dollar text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Operational Efficiency</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
                                    Automate coordination and financial reporting, allowing providers to focus entirely on
                                    patient care.</p>
                            </div>
                        </div>
                    </div>
    
                    <div style="margin-top: 2rem; margin-bottom: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">FAQ</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Frequently Asked Questions
                        </h4>
    
                        <div class="faq-container" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div class="faq-item glass-card"
                                style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header"
                                    style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Can users
                                        upload past medical history and reports?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon"
                                        style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
                                        Yes, eCheckup features a highly secure document upload functionality that allows
                                        users to store and share past medical records and diagnostic reports with their
                                        assigned doctors.</p>
                                </div>
                            </div>
    
                            <div class="faq-item glass-card"
                                style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header"
                                    style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">How do the
                                        video consultations work?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon"
                                        style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
                                        Policyholders can schedule an online checkup directly through the app. At the
                                        scheduled time, they can join a secure, high-quality video call with their
                                        healthcare provider within the application environment.</p>
                                </div>
                            </div>
    
                            <div class="faq-item glass-card"
                                style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header"
                                    style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">How does
                                        the app handle financial reporting for providers?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon"
                                        style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
                                        The app includes an integrated financial module for service providers, allowing them
                                        to track completed cases, manage billing, and generate automated financial reports
                                        seamlessly.</p>
                                </div>
                            </div>
                        </div>
                    </div>
    
                    <div class="glass-card"
                        style="padding: 4rem; text-align: center; border-color: var(--brand); box-shadow: 0 10px 30px var(--brand-glow);">
                        <div class="quote-icon text-brand"
                            style="margin-bottom: 2rem; display: flex; justify-content: center; opacity: 1;"><i
                                class="fa-solid fa-quote-left" style="font-size: 3rem;"></i></div>
                        <p
                            style="font-size: 1.25rem; font-style: italic; line-height: 1.8; margin-bottom: 2.5rem; color: white;">
                            "Dynamic Labz successfully translated a complex web of healthcare logistics into a sleek,
                            user-friendly mobile application. eCheckup has revolutionized our case management process,
                            drastically improving communication between our policyholders and diagnostic partners."</p>
                        <strong class="text-brand"
                            style="font-size: 1.2rem; font-family: var(--font-mono); text-transform: uppercase;">Management
                            Team</strong>
                        <span
                            style="display: block; font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem;">eCheckup</span>
                    </div>
    
                </div>
            </div>
        </div>
    </div>`,

    //<!-- E-Hunt Modal -->
    'cs-e-hunt':`<div class="case-study-overlay" id="cs-e-hunt" data-lenis-prevent>
        <button class="close-cs-btn" onclick="closeCaseStudy('cs-e-hunt')"><i class="fa-solid fa-xmark"></i></button>
        <div class="container" style="max-width: 1200px;">
    
            <div class="cs-header fade-up" style="text-align: center; border-bottom: none; padding-bottom: 0;">
                <span class="p-category text-brand">Case Study</span>
                <h1 class="hero-title reveal-text" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem;">E-Hunt
                </h1>
                <p class="hero-desc" style="margin: 0 auto;">Internal Claim Investigation & Management App</p>
            </div>
    
            <div class="cs-content fade-up">
    
                <div class="cs-slider-wrapper"
                    style="position: relative; margin-top: 3rem; margin-bottom: 4rem; border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); height: 500px; background: var(--surface);">
                    <div class="cs-slider" style="display: flex; width: 100%; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none;">
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_E-Hunt/E-Hunt-1.png" alt="E-Hunt App Dashboard" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_E-Hunt/E-Hunt-2.png" alt="E-Hunt App Dashboard" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_E-Hunt/E-Hunt-3.png" alt="E-Hunt App Dashboard" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                    </div>
    
                    <button class="slider-btn prev-cs-btn"
                        style="position: absolute; z-index: 3; top: 50%; left: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i
                            class="fa-solid fa-chevron-left"></i></button>
                    <button class="slider-btn next-cs-btn"
                        style="position: absolute; z-index: 3; top: 50%; right: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i
                            class="fa-solid fa-chevron-right"></i></button>
                </div>
    
                <div class="cs-grid" style="grid-template-columns: 1fr; gap: 4rem;">
    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Problem Statement</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 1.5rem; font-weight: 500;">Streamlining Claim
                            Investigations</h4>
                        <p class="cs-text">Ericson Healthcare required an efficient, specialized method to handle health
                            insurance claims. Their existing investigation processes were bogged down by manual tracking,
                            fragmented communication between field agents and in-house teams, and inefficient document
                            handling.</p>
                        <p class="cs-text">Managing sensitive health insurance claims demands strict data security and rapid
                            processing. The lack of a dedicated, centralized mobile tool was causing bottlenecks in case
                            resolution and making it difficult to maintain peak productivity and compliance across their
                            investigation workflows.</p>
                    </div>
    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Our Solution</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 1.5rem; font-weight: 500;">Secure In-House
                            Investigation Tool</h4>
                        <p class="cs-text">Dynamic Labz engineered E-Hunt—a highly secure, specialized mobile application
                            designed exclusively for Ericson Healthcare's in-house employees and field investigators. We
                            built a robust internal ecosystem that completely digitizes and simplifies the case handling
                            process.</p>
                        <p class="cs-text">The app empowers investigators to securely log case details, track progress in
                            real-time, and upload sensitive evidence directly from the field. By automating workflow routing
                            and ensuring enterprise-grade data encryption, E-Hunt dramatically improves overall productivity
                            while strictly safeguarding health insurance data.</p>
                    </div>
    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
                        <div class="glass-card sec-card"
                            style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div
                                style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden; background: rgba(118, 31, 227, 0.05); display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-file-shield text-brand" style="font-size: 4rem; opacity: 0.5;"></i>
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand"
                                    style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION
                                    01</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Secure Case Handling</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">End-to-end encrypted
                                    workflows ensuring sensitive health insurance data is strictly protected.</p>
                            </div>
                        </div>
    
                        <div class="glass-card sec-card"
                            style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div
                                style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden; background: rgba(118, 31, 227, 0.05); display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-list-check text-brand" style="font-size: 4rem; opacity: 0.5;"></i>
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand"
                                    style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION
                                    02</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Streamlined Investigations</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">Optimized data entry
                                    and evidence tracking tools specifically built for field agents and claim managers.</p>
                            </div>
                        </div>
    
                        <div class="glass-card sec-card"
                            style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div
                                style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden; background: rgba(118, 31, 227, 0.05); display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-chart-line text-brand" style="font-size: 4rem; opacity: 0.5;"></i>
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand"
                                    style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION
                                    03</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Enhanced Productivity</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">Centralized
                                    operational dashboard reducing manual bottlenecks and accelerating claim resolutions.
                                </p>
                            </div>
                        </div>
                    </div>
    
                    <div>
                        <h3 class="cs-section-title text-brand">Key Features</h3>
                        <ul class="pillar-list" style="margin-top: 1.5rem;">
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Exclusive Internal
                                    Access:</span> Strict authentication protocols limiting access solely to authorized
                                Ericson Healthcare employees.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Real-Time Case
                                    Tracking:</span> Live updates on claim statuses, investigation progress, and required
                                pending actions.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Secure Evidence
                                    Uploads:</span> Compliant, encrypted document and photo capture directly from mobile
                                devices in the field.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Workflow
                                    Automation:</span> Automated task routing and notifications to streamline the entire
                                investigation pipeline.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Comprehensive
                                    Reporting:</span> Built-in analytics tools to evaluate case resolution times and overall
                                team productivity.</li>
                        </ul>
                    </div>
    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Results</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Accelerating Claim Resolutions
                        </h4>
    
                        <div
                            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Faster Resolutions</strong>
                                <p
                                    style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">
                                    Significantly reduced the average turnaround time taken to investigate and process
                                    health insurance claims.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Zero Data Breaches</strong>
                                <p
                                    style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">
                                    Enterprise-grade encryption and secure servers ensured 100% compliance with strict
                                    healthcare data security standards.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Increased Productivity</strong>
                                <p
                                    style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">
                                    Automated workflows and digital tracking saved hundreds of administrative hours per
                                    month for the in-house team.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Centralized Operations</strong>
                                <p
                                    style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">
                                    Eliminated scattered communication by bringing all field agents and managers onto a
                                    single, unified platform.</p>
                            </div>
                        </div>
                    </div>
    
                    <div style="margin-top: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Benefits</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Benefits of the E-Hunt
                            Platform</h4>
    
                        <div
                            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                            <div class="glass-card"
                                style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-lock text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Data Security</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
                                    Protect sensitive health and insurance data with top-tier encryption and Role-Based
                                    Access Control.</p>
                            </div>
                            <div class="glass-card"
                                style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-bolt text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Operational Efficiency</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
                                    Streamline the entire claims process, from initial assignment to final investigation
                                    closure.</p>
                            </div>
                            <div class="glass-card"
                                style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-arrow-up-right-dots text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Scalability</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Built
                                    on a robust architecture that easily handles an increasing volume of claims as the
                                    company grows.</p>
                            </div>
                            <div class="glass-card"
                                style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-users-viewfinder text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Team Coordination</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
                                    Seamlessly connect field agents with in-house managers for instant, real-time
                                    collaboration.</p>
                            </div>
                        </div>
                    </div>
    
                    <div style="margin-top: 2rem; margin-bottom: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">FAQ</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Frequently Asked Questions
                        </h4>
    
                        <div class="faq-container" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div class="faq-item glass-card"
                                style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header"
                                    style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Is the app
                                        available to the public?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon"
                                        style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
                                        No, E-Hunt is a proprietary internal tool designed exclusively for authorized
                                        Ericson Healthcare employees and investigators.</p>
                                </div>
                            </div>
    
                            <div class="faq-item glass-card"
                                style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header"
                                    style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">How does
                                        the app handle sensitive health data?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon"
                                        style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">It
                                        utilizes enterprise-level encryption and strict role-based access control (RBAC) to
                                        ensure all case data complies with stringent healthcare security regulations.</p>
                                </div>
                            </div>
    
                            <div class="faq-item glass-card"
                                style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header"
                                    style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Can
                                        investigators upload evidence directly from the field?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon"
                                        style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
                                        Yes, the app features a highly secure upload portal that allows field agents to
                                        capture and instantly sync documents, photos, and reports from their mobile devices
                                        to the central database.</p>
                                </div>
                            </div>
                        </div>
                    </div>
    
                    <div class="glass-card"
                        style="padding: 4rem; text-align: center; border-color: var(--brand); box-shadow: 0 10px 30px var(--brand-glow);">
                        <div class="quote-icon text-brand"
                            style="margin-bottom: 2rem; display: flex; justify-content: center; opacity: 1;"><i
                                class="fa-solid fa-quote-left" style="font-size: 3rem;"></i></div>
                        <p
                            style="font-size: 1.25rem; font-style: italic; line-height: 1.8; margin-bottom: 2.5rem; color: white;">
                            "Dynamic Labz perfectly understood the complexities of our internal workflows. The E-Hunt app
                            has revolutionized how we manage claim investigations, providing our team with a secure,
                            incredibly efficient tool that has drastically improved our turnaround times."</p>
                        <strong class="text-brand"
                            style="font-size: 1.2rem; font-family: var(--font-mono); text-transform: uppercase;">Management
                            Team</strong>
                        <span style="display: block; font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem;">Ericson
                            Healthcare</span>
                    </div>
    
                </div>
            </div>
        </div>
    </div>`,

    //<!-- Barecce Modal -->
    'modal-barecce':`<div class="case-study-overlay" id="modal-barecce" data-lenis-prevent>
        <button class="close-cs-btn" onclick="closeCaseStudy('modal-barecce')">
            <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="container" style="max-width: 1200px;">
            
            <div class="cs-header fade-up" style="text-align: center; border-bottom: none; padding-bottom: 0;">
                <span class="p-category text-brand">Case Study</span>
                <h1 class="hero-title reveal-text" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem;">Barecce</h1>
                <p class="hero-desc" style="margin: 0 auto; max-width: 800px;">Creative Agency Landing Page & Lead Generation Platform</p>
            </div>

            <div class="cs-content fade-up">
                
                <div class="cs-slider-wrapper" style="position: relative; margin-top: 3rem; margin-bottom: 4rem; border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); height: 500px; background: var(--surface);">
                    <div class="cs-slider" style="display: flex; width: 100%; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none;">
                        
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_Barecee/2.png" alt="Barecce Screenshot" style="max-width: 100%; max-height: 100%;">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_Barecee/website1.png" alt="Barecce Screenshot" style="max-width: 100%; max-height: 100%;">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_Barecee/website2.png" alt="Barecce Screenshot" style="max-width: 100%; max-height: 100%;">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_Barecee/website3.png" alt="Barecce Screenshot" style="max-width: 100%; max-height: 100%;">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_Barecee/website4.png" alt="Barecce Screenshot" style="max-width: 100%; max-height: 100%;">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_Barecee/website5.png" alt="Barecce Screenshot" style="max-width: 100%; max-height: 100%;">
                        </div>
                        
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_Barecee/mobile-shot.png" alt="Barecce Screenshot 2" style="max-width: 100%; max-height: 150%; object-fit: contain; border-radius: 12px;">
                        </div>
                        
                    </div>
                    
                    <button class="slider-btn prev-cs-btn" style="position: absolute; z-index: 3; top: 50%; left: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="slider-btn next-cs-btn" style="position: absolute; z-index: 3; top: 50%; right: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-right"></i></button>
                </div>

                <div class="cs-grid" style="grid-template-columns: 1fr; gap: 4rem;">
                    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">The Goal</h3>
                        <p class="cs-text">Barecce needed a stunning and super-fast website ready in time for a major corporate event. The main challenge was making sure the site looked highly interactive and animated without slowing down how fast it loaded for visitors.</p>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">How We Built It</h3>
                        <p class="cs-text">We built a custom, highly interactive website using modern animation tools to create smooth, scroll-based effects. By keeping the code clean and direct, we made sure the design looked exactly like the original vision while loading almost instantly.</p>
                        <p class="cs-text">Instead of using a complex and hard-to-maintain background server, we connected their contact forms directly to a secure email system. This means customer inquiries go straight to the client without the risk of server crashes or security issues.</p>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">The Launch</h3>
                        <p class="cs-text">We launched the website on a highly reliable hosting platform, carefully managing the domain setup to ensure it went live right on time without any hiccups. The final result is a website that turns casual visitors into potential clients much better than average sites.</p>
                    </div>

                    <div style="margin-top: 1rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Benefits</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Why this works for Creative Agencies</h4>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-bolt text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Instant Speeds</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Pages load immediately, keeping visitors happy and helping the site show up higher in search results.</p>
                            </div>
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-wand-magic-sparkles text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Premium Look and Feel</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Custom animations that perfectly match the agency's high-end brand identity.</p>
                            </div>
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-envelope-circle-check text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Hassle-Free Contact Forms</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">No confusing server maintenance needed. Customer messages go straight to the agency's inbox instantly.</p>
                            </div>
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-server text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Zero Hosting Costs</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Set up on a highly reliable system that stays online 24/7 without any monthly hosting fees.</p>
                            </div>

                        </div>
                    </div>

                    <div class="glass-card" style="padding: 4rem; text-align: center; border-color: var(--brand); box-shadow: 0 10px 30px var(--brand-glow); margin-top: 2rem;">
                        <div class="quote-icon text-brand" style="margin-bottom: 2rem; display: flex; justify-content: center; opacity: 1;"><i class="fa-solid fa-quote-left" style="font-size: 3rem;"></i></div>
                        <p style="font-size: 1.25rem; font-style: italic; line-height: 1.8; margin-bottom: 2.5rem; color: white;">"Dynamic Labz delivered a striking digital presence under an incredibly tight deadline. The animations are flawless, and the site speed is phenomenal. It perfectly captures our creative capabilities as an agency."</p>
                        <strong class="text-brand" style="font-size: 1.2rem; font-family: var(--font-mono); text-transform: uppercase;">Founder & Creative Director</strong>
                        <span style="display: block; font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem;">Barecce Agency</span>
                    </div>

                </div>
            </div>
        </div>
    </div>`,

    //<!-- JumpinGo Modal -->
    'modal-jumpingo':`<div class="case-study-overlay" id="modal-jumpingo" data-lenis-prevent>
        <button class="close-cs-btn" onclick="closeCaseStudy('modal-jumpingo')">
            <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="container" style="max-width: 1200px;">
            
            <div class="cs-header fade-up" style="text-align: center; border-bottom: none; padding-bottom: 0;">
                <span class="p-category text-brand">Case Study</span>
                <h1 class="hero-title reveal-text" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem;">JumpinGo</h1>
                <p class="hero-desc" style="margin: 0 auto; max-width: 800px;">High-Volume Event Ticketing & Booking Portal</p>
            </div>

            <div class="cs-content fade-up">
                
                <div class="cs-slider-wrapper" style="position: relative; margin-top: 3rem; margin-bottom: 4rem; border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); height: 500px; background: var(--surface);">
                    <div class="cs-slider" style="display: flex; width: 100%; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none;">
                        
                        <!-- Dashboard Screens -->
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_JumpinGo/JumpinGo-dashboard1.png" alt="JumpinGo Portal Screenshot" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_JumpinGo/JumpinGo-dashboard2.png" alt="JumpinGo Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_JumpinGo/JumpinGo-dashboard3.png" alt="JumpinGo Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_JumpinGo/JumpinGo-dashboard4.png" alt="JumpinGo Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_JumpinGo/JumpinGo-dashboard5.png" alt="JumpinGo Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <!-- Website Screens -->
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_JumpinGo/JumpinGo-website1.png" alt="JumpinGo Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_JumpinGo/JumpinGo-website2.png" alt="JumpinGo Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_JumpinGo/JumpinGo-website3.png" alt="JumpinGo Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_JumpinGo/JumpinGo-website4.png" alt="JumpinGo Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_JumpinGo/JumpinGo-website5.png" alt="JumpinGo Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_JumpinGo/JumpinGo-website6.png" alt="JumpinGo Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        
                    </div>
                    
                    <button class="slider-btn prev-cs-btn" style="position: absolute; z-index: 3; top: 50%; left: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="slider-btn next-cs-btn" style="position: absolute; z-index: 3; top: 50%; right: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-right"></i></button>
                </div>

                <div class="cs-grid" style="grid-template-columns: 1fr; gap: 4rem;">
                    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">The Goal</h3>
                        <p class="cs-text">JumpinGo, a traveling jumping park festival, experiences massive bursts of website visitors the exact moment tickets go on sale for a new city. Their biggest challenge was keeping the website online during these intense traffic spikes while ensuring families could easily book specific time slots without the system double-booking.</p>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">How We Built It</h3>
                        <p class="cs-text">Instead of relying on standard website templates that crack under pressure, we built a custom, highly reliable booking system designed specifically to handle thousands of simultaneous users. We streamlined the checkout process, making it incredibly fast for parents to select a date, pick a time slot, and securely pay for their tickets in just a few clicks.</p>
                        <p class="cs-text">Behind the scenes, we created a smart calendar system that updates ticket availability instantly for everyone browsing, completely eliminating the risk of overselling a time slot.</p>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">The Launch</h3>
                        <p class="cs-text">During the first major ticket drop on the new platform, the system flawlessly handled the massive surge of excited customers. Thousands of tickets were processed in minutes with zero website crashes or slowdowns, resulting in a completely sold-out event and a stress-free experience for the business owners.</p>
                    </div>

                    <div style="margin-top: 1rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Benefits</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Why this works for Event Organizers</h4>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-shield-halved text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Crash-Proof Reliability</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">The website stays online and fast, even when thousands of people try to buy tickets at the exact same second.</p>
                            </div>
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-cart-arrow-down text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Lightning-Fast Checkout</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">A simple, straightforward buying process that gets customers from selecting a time to paying in under a minute.</p>
                            </div>
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-calendar-check text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Accurate Availability</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Inventory updates instantly, so you never have to deal with the headache of refunding overbooked time slots.</p>
                            </div>
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-ticket text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Automated Ticketing</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Customers receive their digital tickets and receipts instantly via email, completely hands-off for your team.</p>
                            </div>

                        </div>
                    </div>

                    <div style="margin-top: 2rem; margin-bottom: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">FAQ</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Frequently Asked Questions</h4>
                        
                        <div class="faq-container" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Can customers buy tickets for different time slots at once?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">Yes, the checkout flow allows parents and groups to select multiple time slots or different packages in a single, unified transaction.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">How are the tickets delivered?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">As soon as the payment is confirmed, the system instantly emails a digital ticket containing a unique QR code for quick, secure scanning at the event entrance.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card" style="padding: 4rem; text-align: center; border-color: var(--brand); box-shadow: 0 10px 30px var(--brand-glow); margin-top: 2rem;">
                        <div class="quote-icon text-brand" style="margin-bottom: 2rem; display: flex; justify-content: center; opacity: 1;"><i class="fa-solid fa-quote-left" style="font-size: 3rem;"></i></div>
                        <p style="font-size: 1.25rem; font-style: italic; line-height: 1.8; margin-bottom: 2.5rem; color: white;">"Dynamic Labz completely changed the game for us. Our old website crashed every time we announced a new city. With this new portal, we sold out our biggest event in record time without a single technical glitch!"</p>
                        <strong class="text-brand" style="font-size: 1.2rem; font-family: var(--font-mono); text-transform: uppercase;">Event Director</strong>
                        <span style="display: block; font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem;">JumpinGo Festival</span>
                    </div>

                </div>
            </div>
        </div>
    </div>`,

    //<!-- DiamondFairPrice Modal -->
    'modal-diamond':`<div class="case-study-overlay" id="modal-diamond" data-lenis-prevent>
        <button class="close-cs-btn" onclick="closeCaseStudy('modal-diamond')">
            <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="container" style="max-width: 1200px;">
            
            <div class="cs-header fade-up" style="text-align: center; border-bottom: none; padding-bottom: 0;">
                <span class="p-category text-brand">Case Study</span>
                <h1 class="hero-title reveal-text" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem;">Diamond Fair Price</h1>
                <p class="hero-desc" style="margin: 0 auto; max-width: 800px;">Interactive Educational Platform & Selection Tool</p>
            </div>

            <div class="cs-content fade-up">
                
                <div class="cs-slider-wrapper" style="position: relative; margin-top: 3rem; margin-bottom: 4rem; border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); height: 500px; background: var(--surface);">
                    <div class="cs-slider" style="display: flex; width: 100%; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none;">
                        
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_DiamondFairPrice/DFP-website1.png" alt="Diamond Fair Price Landing Page" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_DiamondFairPrice/DFP-website2.png" alt="Diamond Fair Price Landing Page" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_DiamondFairPrice/DFP-website3.png" alt="Diamond Fair Price Landing Page" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_DiamondFairPrice/DFP-website4.png" alt="Diamond Fair Price Landing Page" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_DiamondFairPrice/DFP-website5.png" alt="Diamond Fair Price Landing Page" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_DiamondFairPrice/DFP-website6.png" alt="Diamond Fair Price Landing Page" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        
                    </div>
                    
                    <button class="slider-btn prev-cs-btn" style="position: absolute; z-index: 3; top: 50%; left: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="slider-btn next-cs-btn" style="position: absolute; z-index: 3; top: 50%; right: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-right"></i></button>
                </div>

                <div class="cs-grid" style="grid-template-columns: 1fr; gap: 4rem;">
                    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">The Goal</h3>
                        <p class="cs-text">Diamond Fair Price wanted to change how people shop for luxury jewelry online. Instead of overwhelming buyers with heavy walls of text or confusing pricing charts, they needed a beautiful, interactive platform that could educate visitors on the "4Cs" of diamond grading and help them figure out exactly what kind of stone fits their preferences.</p>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">How We Built It</h3>
                        <p class="cs-text">We built a visually striking landing page paired with a custom, step-by-step selection tool. The interface allows users to seamlessly click through different diamond shapes, adjust the carat weight, and select their desired color, clarity, and cut.</p>
                        <p class="cs-text">We focused heavily on keeping the design clean and uncluttered, ensuring that the tool felt like a premium luxury experience. The transitions between steps are smooth and intuitive, keeping the user completely focused on finding their perfect diamond without any frustration.</p>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">The Launch</h3>
                        <p class="cs-text">The final platform serves as a powerful guide for first-time diamond buyers. By turning a complicated educational process into an easy-to-use digital tool, the website keeps visitors highly engaged and builds massive trust in the brand before a purchase is ever made.</p>
                    </div>

                    <div style="margin-top: 1rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Benefits</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Why this works for Luxury Retailers</h4>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-gem text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Interactive Learning</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Replaces boring text guides with a hands-on tool, making the complicated process of grading diamonds highly visual and fun.</p>
                            </div>
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-crown text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Premium Aesthetic</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">A sleek, high-end design that perfectly matches the luxury expectations of people buying fine jewelry.</p>
                            </div>
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-list-check text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Simplified Choices</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Breaks down a stressful buying decision into simple, clear steps so the customer feels confident, not confused.</p>
                            </div>
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-stopwatch text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Higher Engagement</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Visitors spend significantly more time on the website playing with different diamond combinations, building brand loyalty.</p>
                            </div>

                        </div>
                    </div>

                    <div style="margin-top: 2rem; margin-bottom: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">FAQ</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Frequently Asked Questions</h4>
                        
                        <div class="faq-container" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Does the tool work well on mobile phones?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">Yes, the entire interactive selection process was carefully built to be fully responsive, meaning users get the exact same smooth, premium experience whether they are on a laptop or scrolling on their phone.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Is it possible to add live pricing later?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">Absolutely. While the tool currently focuses on education and selection, the way it was built allows for easy future updates, such as connecting it to a live market pricing system if needed.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card" style="padding: 4rem; text-align: center; border-color: var(--brand); box-shadow: 0 10px 30px var(--brand-glow); margin-top: 2rem;">
                        <div class="quote-icon text-brand" style="margin-bottom: 2rem; display: flex; justify-content: center; opacity: 1;"><i class="fa-solid fa-quote-left" style="font-size: 3rem;"></i></div>
                        <p style="font-size: 1.25rem; font-style: italic; line-height: 1.8; margin-bottom: 2.5rem; color: white;">"Dynamic Labz created an incredibly elegant solution for what is usually a very confusing process. The interactive tool is beautiful, easy to use, and perfectly captures the high-end luxury feel we wanted for our customers."</p>
                        <strong class="text-brand" style="font-size: 1.2rem; font-family: var(--font-mono); text-transform: uppercase;">Management Team</strong>
                        <span style="display: block; font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem;">Diamond Fair Price</span>
                    </div>

                </div>
            </div>
        </div>
    </div>`,

    //<!-- Jirawala Tours & Travels Modal -->
    'modal-jirawala':`<div class="case-study-overlay" id="modal-jirawala" data-lenis-prevent>
        <button class="close-cs-btn" onclick="closeCaseStudy('modal-jirawala')">
            <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="container" style="max-width: 1200px;">
            
            <div class="cs-header fade-up" style="text-align: center; border-bottom: none; padding-bottom: 0;">
                <span class="p-category text-brand">Case Study</span>
                <h1 class="hero-title reveal-text" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem;">Jirawala Tours & Travels</h1>
                <p class="hero-desc" style="margin: 0 auto; max-width: 800px;">Custom Taxi Booking & Fare Estimation Portal</p>
            </div>

            <div class="cs-content fade-up">
                
                <div class="cs-slider-wrapper" style="position: relative; margin-top: 3rem; margin-bottom: 4rem; border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); height: 500px; background: var(--surface);">
                    <div class="cs-slider" style="display: flex; width: 100%; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none;">
                        
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_Jirawala/website1.png" alt="Jirawala Booking Portal" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_Jirawala/website2.png" alt="Jirawala Fare Estimator" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_Jirawala/website3.png" alt="Jirawala Fare Estimator" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_Jirawala/website4.png" alt="Jirawala Fare Estimator" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_Jirawala/website5.png" alt="Jirawala Fare Estimator" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        
                    </div>
                    
                    <button class="slider-btn prev-cs-btn" style="position: absolute; z-index: 3; top: 50%; left: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="slider-btn next-cs-btn" style="position: absolute; z-index: 3; top: 50%; right: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-right"></i></button>
                </div>

                <div class="cs-grid" style="grid-template-columns: 1fr; gap: 4rem;">
                    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">The Goal</h3>
                        <p class="cs-text">Jirawala Tours & Travels needed a digital platform to streamline their taxi rental business for holidays, vacations, and corporate tours. They wanted a system where customers could easily enter their travel destinations, instantly view an estimated cost, and submit a booking request for final confirmation by an executive.</p>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">How We Built It</h3>
                        <p class="cs-text">We built a sleek, highly professional website focused entirely on the customer booking experience. The core of the platform is a dynamic booking engine. Customers simply input their pickup location, drop-off destination, and preferred vehicle type to get an immediate fare estimate.</p>
                        <p class="cs-text">Once the user is satisfied with the estimate and submits their itinerary, the system instantly routes all their details to the Jirawala team. This allows a booking executive to quickly follow up and finalize the trip with all the necessary context already in hand.</p>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">The Launch</h3>
                        <p class="cs-text">The new platform significantly reduced the amount of time the team spent on the phone just answering "how much does it cost?" queries. By providing upfront estimates and a simple digital booking flow, the website dramatically increased the number of serious, highly-qualified booking leads the business receives daily.</p>
                    </div>

                    <div style="margin-top: 1rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Benefits</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Why this works for Transport Businesses</h4>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-calculator text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Instant Estimates</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Giving customers an immediate price builds trust and keeps them from checking competitors' rates.</p>
                            </div>
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-filter text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Qualified Leads</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Executives only spend time calling customers who have already seen the price and are ready to book.</p>
                            </div>
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-car text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Fleet Showcase</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Clearly displays the available vehicles so customers can confidently choose the right size for their group.</p>
                            </div>
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-mobile-screen text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Mobile-First Booking</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Optimized heavily for smartphones so travelers can easily book a trip while on the go.</p>
                            </div>

                        </div>
                    </div>

                    <div style="margin-top: 2rem; margin-bottom: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">FAQ</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Frequently Asked Questions</h4>
                        
                        <div class="faq-container" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">How does the website handle multi-city tours?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">The booking form is designed to accommodate complex itineraries, allowing users to detail their full trip so the executive can provide a highly accurate final quote.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Is the fare estimate legally binding?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">No, the website clearly indicates that the generated price is an estimate. This sets the right expectation before the human executive calls to confirm the final booking details.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card" style="padding: 4rem; text-align: center; border-color: var(--brand); box-shadow: 0 10px 30px var(--brand-glow); margin-top: 2rem;">
                        <div class="quote-icon text-brand" style="margin-bottom: 2rem; display: flex; justify-content: center; opacity: 1;"><i class="fa-solid fa-quote-left" style="font-size: 3rem;"></i></div>
                        <p style="font-size: 1.25rem; font-style: italic; line-height: 1.8; margin-bottom: 2.5rem; color: white;">"Our new website has completely changed how we handle inquiries. Instead of spending hours on the phone quoting prices, customers now send us complete booking requests with their routes already mapped out. It's incredibly efficient!"</p>
                        <strong class="text-brand" style="font-size: 1.2rem; font-family: var(--font-mono); text-transform: uppercase;">Management Team</strong>
                        <span style="display: block; font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem;">Jirawala Tours & Travels</span>
                    </div>

                </div>
            </div>
        </div>
    </div>`,

    //<!-- Property Management Modal -->
    'cs-property-management':`<div class="case-study-overlay" id="cs-property-management" data-lenis-prevent>
        <button class="close-cs-btn" onclick="closeCaseStudy('cs-property-management')">
            <i class="fa-solid fa-xmark"></i>
        </button>
        
        <div class="container" style="max-width: 1200px;"> 
            
            <div class="cs-header fade-up" style="text-align: center; border-bottom: none; padding-bottom: 0;">
                <span class="p-category text-brand">Case Study</span>
                <h1 class="hero-title reveal-text" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem;">Property Management</h1>
                <p class="hero-desc" style="margin: 0 auto;">Enhancing In-House Property Selection & Visit Planning</p>
            </div>

            <div class="cs-content fade-up">
                
                <div class="cs-slider-wrapper" style="position: relative; margin-top: 3rem; margin-bottom: 4rem; border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); height: 500px; background: var(--surface);">
                    
                    <div class="cs-slider" style="display: flex; width: 100%; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none;">
                        
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_SquareSecond/ssc-inquiry-form.png" alt="Raw Screenshot 1" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_SquareSecond/ssc-property-detail-design.png" alt="Raw Screenshot 2" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_SquareSecond/ssc-property-detail-design_1.png" alt="Raw Screenshot 3" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_SquareSecond/ssc-property-detail-design_2.png" alt="Raw Screenshot 3" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_SquareSecond/ssc-property-detail-design_3.png" alt="Raw Screenshot 3" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_SquareSecond/ssc-property-detail-design_4.png" alt="Raw Screenshot 3" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        
                    </div>
                    
                    <button class="slider-btn prev-cs-btn" style="position: absolute; z-index: 3; top: 50%; left: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="slider-btn next-cs-btn" style="position: absolute; z-index: 3; top: 50%; right: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-right"></i></button>
                </div>

                <div class="cs-grid" style="grid-template-columns: 1fr; gap: 4rem;">
                    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Problem Statement</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 1.5rem; font-weight: 500;">Enhancing In-House Property Selection Process</h4>
                        <p class="cs-text">The client, a leading property broker, faced significant challenges in managing property recommendations for walk-in clients. Their existing process was entirely manual, requiring employees to verbally gather client requirements and manually search through property records. This not only consumed valuable time but also led to inconsistencies and errors in capturing client preferences.</p>
                        <p class="cs-text">Additionally, the manual system made it difficult to plan property visits effectively. Coordinating schedules between clients, property owners, and brokers required extensive back-and-forth communication, causing delays and confusion. The client needed a comprehensive solution to streamline these processes, improve data accuracy, and enhance the overall client experience.</p>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Our Solution</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 1.5rem; font-weight: 500;">Property Listing & Visit Planning Portal</h4>
                        <p class="cs-text">We developed an in-depth property listing portal tailored for the client's in-house operations. This portal streamlines the entire property selection process, starting with an extensive client requirement form comprising over 35+ questions. Once submitted, the system applies intelligent filters based on primary criteria—such as identifying properties within a 2.5 km radius.</p>
                        <p class="cs-text">The portal then presents the top 15 property matches with a visually appealing UI/UX design. Clients can shortlist properties they find interesting, moving seamlessly to the visit planner. Notifications are automatically sent to property owners, ensuring smooth coordination.</p>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
                        
                        <div class="glass-card sec-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden;">
                                <img loading="lazy" src="assets/images/project_SquareSecond/ssc-inquiry-form.png" alt="Inquiry Form" class="sec-img" style="width: 100%; height: 100%; object-fit: fill; filter: grayscale(40%); transition: 0.5s ease;">
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand" style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION 01</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Property Inquiry Form</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">A dynamic, user-friendly form capturing detailed client preferences effortlessly.</p>
                            </div>
                        </div>

                        <div class="glass-card sec-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden;">
                                <img loading="lazy" src="assets/images/project_SquareSecond/ssc-property-detail-design.png" alt="Match Results" class="sec-img" style="width: 100%; height: 100%; object-fit: fill; filter: grayscale(40%); transition: 0.5s ease;">
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand" style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION 02</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Property Match Results</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">A visually appealing dashboard showcasing top property matches with detailed insights.</p>
                            </div>
                        </div>

                        <div class="glass-card sec-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden;">
                                <img loading="lazy" src="assets/images/project_SquareSecond/ssc-visit-plan_with_time.png" alt="Visit Planner" class="sec-img" style="width: 100%; height: 100%; object-fit: fill; filter: grayscale(40%); transition: 0.5s ease;">
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand" style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION 03</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Visit Planner</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">Simplified interface for scheduling property visits, enhancing client convenience and engagement.</p>
                            </div>
                        </div>
                        
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand">Key Features</h3>
                        <ul class="pillar-list" style="margin-top: 1.5rem;">
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Advanced Client Requirement Form:</span> Over 35+ detailed fields capturing precise preferences.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Intelligent Matching Algorithm:</span> Prioritizes top 15 properties based on location and parameters.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Seamless Visit Planning:</span> Effortless scheduling with automated notifications to owners.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Robust Management Module:</span> Simplified property addition with over 70+ data points and RBAC.</li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Results</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Achieving Operational Excellence</h4>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Streamlined Onboarding</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">Reduced manual effort with an automated, in-depth client requirement form, enhancing efficiency.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);"> Improved Property Match Accuracy</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">The intelligent algorithm ensures high-quality matches, aligning perfectly with client preferences.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);"> Enhanced Client Experience</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">Engaging UI/UX fosters better client interaction, leading to quicker and more confident decisions.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Optimized Visit Planning</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">Simplified scheduling process improves coordination between clients, brokers, and property owners.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Efficient Data Management</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">Secure property database with comprehensive details, improving internal data handling and accessibility.</p>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Benefits</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Benefits of Property Management Portal</h4>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-chart-line text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Increased Sales</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Boost your revenue with optimized portal features and effective matching strategies.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-face-smile text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Customer Experience</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Provide a smooth and enjoyable property selection experience to retain clients.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-eye text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Brand Visibility</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Increase your firm's professional presence with a well-designed digital infrastructure.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-gears text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Efficient Processes</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Simplify portal management with efficient property databases and visit planners.</p>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 2rem; margin-bottom: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">FAQ</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Frequently Asked Questions</h4>
                        
                        <div class="faq-container" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Can the portal be customized to fit different business models?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">Yes, the portal is highly customizable to cater to unique business requirements across the real estate industry.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">How secure is the data within the portal?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">We implement role-based access control and secure database practices to ensure data integrity and confidentiality.</p>
                                </div>
                            </div>

                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Is it possible to integrate this portal with existing CRM systems?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">Yes, the portal can be integrated with most CRM platforms for seamless data synchronization.</p>
                                </div>
                            </div>

                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Can new properties be added easily by employees?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">Absolutely. The property management module includes a user-friendly form with over 70+ data fields for comprehensive listings.</p>
                                </div>
                            </div>

                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Does the system support multi-user access with different roles?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">Yes, the portal supports multiple user roles, providing specific access permissions based on employee hierarchy.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card" style="padding: 4rem; text-align: center; border-color: var(--brand); box-shadow: 0 10px 30px var(--brand-glow);">
                        <div class="quote-icon text-brand" style="margin-bottom: 2rem; display: flex; justify-content: center; opacity: 1;"><i class="fa-solid fa-quote-left" style="font-size: 3rem;"></i></div>
                        <p style="font-size: 1.25rem; font-style: italic; line-height: 1.8; margin-bottom: 2.5rem; color: white;">"We had a seamless experience working with Divyam from Dynamic Labz. His commitment to delivering on time and a thorough understanding of our project requirements and its technical nuances made the entire process stress-free."</p>
                        <strong class="text-brand" style="font-size: 1.2rem; font-family: var(--font-mono); text-transform: uppercase;">Pratik Thakkar</strong>
                        <span style="display: block; font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem;">Square Second Consultants</span>
                    </div>

                </div>
            </div>
        </div>
    </div>`,

    //<!-- AI Document Modal -->
    'cs-ai-validation':`<div class="case-study-overlay" id="cs-ai-validation" data-lenis-prevent>
        <button class="close-cs-btn" onclick="closeCaseStudy('cs-ai-validation')">
            <i class="fa-solid fa-xmark"></i>
        </button>
        
        <div class="container" style="max-width: 1200px;"> 
            
            <div class="cs-header fade-up" style="text-align: center; border-bottom: none; padding-bottom: 0;">
                <span class="p-category text-brand">Case Study</span>
                <h1 class="hero-title reveal-text" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem;">AI Document Validation</h1>
                <p class="hero-desc" style="margin: 0 auto;">Enterprise AI Automation System</p>
            </div>

            <div class="cs-content fade-up">
                
                <div class="cs-slider-wrapper" style="position: relative; margin-top: 3rem; margin-bottom: 4rem; border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); height: 500px; background: var(--surface);">
                    <div class="cs-slider" style="display: flex; width: 100%; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none;">
                        
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/portfolio/ai-slide1.jpg" alt="AI Dashboard Screenshot 1" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/portfolio/ai-slide2.jpg" alt="AI Dashboard Screenshot 2" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/portfolio/ai-slide3.jpg" alt="AI Dashboard Screenshot 3" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                    </div>
                    
                    <button class="slider-btn prev-cs-btn" style="position: absolute; z-index: 3; top: 50%; left: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="slider-btn next-cs-btn" style="position: absolute; z-index: 3; top: 50%; right: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-right"></i></button>
                </div>

                <div class="cs-grid" style="grid-template-columns: 1fr; gap: 4rem;">
                    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Problem Statement</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 1.5rem; font-weight: 500;">Manual Validation Challenges in MedTech</h4>
                        <p class="cs-text">A leading MedTech firm in the UK was facing significant inefficiencies in processing and validating crucial data from 25+ police forces. Their workflow required manually reviewing PDF and DOCX files containing essential field information, ensuring compliance and accuracy across 15+ key parameters. This process was time-consuming, prone to human error, and lacked scalability.</p>
                        <p class="cs-text">With hundreds of documents arriving daily, their team struggled to maintain speed and accuracy. Delays in validation impacted decision-making and operational efficiency, while errors led to compliance risks. The company needed an intelligent, automated solution to streamline data validation, reduce turnaround time, and enhance precision.</p>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Our Solution</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 1.5rem; font-weight: 500;">AI-Powered Document Validation System</h4>
                        <p class="cs-text">To tackle the inefficiencies in manual validation, we developed a state-of-the-art AI-powered document validation system designed specifically for the MedTech firm. This intelligent system automates the extraction, analysis, and validation of key fields from incoming documents, ensuring unmatched accuracy and efficiency. Our AI model was meticulously trained on real-world police reports to recognize diverse formats, handle inconsistencies, and validate critical data points seamlessly.</p>
                        <p class="cs-text">The system operates in three core stages: Document Parsing, AI-Driven Validation, and Structured Output Generation. First, incoming PDFs and DOCX files from 25+ police forces are scanned and processed using advanced OCR and NLP techniques. Once extracted, each of the 15+ key fields undergoes rigorous validation using AI algorithms that detect missing or incomplete information. The final output is then converted into a structured JSON format, enabling seamless integration with the client's existing infrastructure.</p>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
                        <div class="glass-card sec-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden;">
                                <img loading="lazy" src="assets/images/portfolio/ai-sec1.jpg" alt="Document Upload" class="sec-img" style="width: 100%; height: 100%; object-fit: fill; filter: grayscale(40%); transition: 0.5s ease;">
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand" style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION 01</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Document Upload & Processing</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">AI instantly scans and extracts data from police reports.</p>
                            </div>
                        </div>

                        <div class="glass-card sec-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden;">
                                <img loading="lazy" src="assets/images/portfolio/ai-sec2.jpg" alt="Validation Check" class="sec-img" style="width: 100%; height: 100%; object-fit: fill; filter: grayscale(40%); transition: 0.5s ease;">
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand" style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION 02</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Validation & Compliance Check</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">Automated field validation ensures all required data is complete.</p>
                            </div>
                        </div>

                        <div class="glass-card sec-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden;">
                                <img loading="lazy" src="assets/images/portfolio/ai-sec3.jpg" alt="JSON Output" class="sec-img" style="width: 100%; height: 100%; object-fit: fill; filter: grayscale(40%); transition: 0.5s ease;">
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand" style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION 03</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">JSON Output Generation</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">Clean, structured JSON is created for seamless system integration.</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand">Key Features</h3>
                        <ul class="pillar-list" style="margin-top: 1.5rem;">
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Automated Document Parsing:</span> Instantly reads and extracts key data from police reports, eliminating manual entry.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">AI-Powered Field Validation:</span> Machine learning algorithms ensure critical fields are accurately validated, flagging missing data.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Seamless JSON Output:</span> Delivers a well-formatted JSON response, making it easier to integrate with existing MedTech systems.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Drastic Turnaround Reduction:</span> What used to take hours of manual validation is now completed in seconds.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Scalable & Future-Proof Model:</span> The AI continuously learns from new patterns, adapting to evolving compliance standards.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Enhanced Security:</span> Built with robust encryption ensuring sensitive reports are processed securely.</li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Results</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Transforming Efficiency & Accuracy with AI</h4>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">99% Accuracy in Data Validation</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">With AI-driven field extraction, validation accuracy surged to 99%, eliminating manual errors.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">90% Reduction in Turnaround Time</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">Previously taking hours, the AI-powered system completes the task in seconds, enabling real-time decisions.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Scalable to 25+ Police Forces</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">The solution seamlessly handles validation requests from multiple departments, standardizing data.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Seamless Integration</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">The JSON-based structured output ensured smooth integration with internal software, enhancing workflow automation.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Future-Proof AI Model</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">Continuous learning capabilities mean the AI system adapts to new document formats and validation rules.</p>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Benefits</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Benefits of AI-Powered Document Validation System</h4>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-chart-line text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Increased Sales</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Boost your revenue with optimized features and effective data processing strategies.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-face-smile text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Customer Experience</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Provide a smooth and error-free operational experience to retain enterprise clients.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-eye text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Brand Visibility</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Increase your brand's presence with a highly scalable and optimized automated infrastructure.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-gears text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Efficient Processes</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Simplify management with efficient data automation and operational support solutions.</p>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 2rem; margin-bottom: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">FAQ</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Frequently Asked Questions</h4>
                        
                        <div class="faq-container" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Can the AI handle different document formats?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">Yes, our model supports PDFs and DOCX formats, ensuring flexible document processing.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">How does the system ensure high validation accuracy?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">Our AI undergoes continuous training with real-world data, improving field extraction and minimizing false positives/negatives.</p>
                                </div>
                            </div>

                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">What happens if a field is missing?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">The system flags missing fields in the JSON response, allowing immediate corrective actions.</p>
                                </div>
                            </div>

                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Can the solution be expanded to validate additional fields?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">Yes, the AI model is scalable and can be trained to validate more fields as per requirements.</p>
                                </div>
                            </div>

                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">How secure is the data processing?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">We implement end-to-end encryption and compliance standards to ensure data privacy and security.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card" style="padding: 4rem; text-align: center; border-color: var(--brand); box-shadow: 0 10px 30px var(--brand-glow);">
                        <div class="quote-icon text-brand" style="margin-bottom: 2rem; display: flex; justify-content: center; opacity: 1;"><i class="fa-solid fa-quote-left" style="font-size: 3rem;"></i></div>
                        <p style="font-size: 1.25rem; font-style: italic; line-height: 1.8; margin-bottom: 2.5rem; color: white;">"Dynamic Labz transformed our document validation process with their AI-powered solution. What used to take our team hours of manual effort is now completed in seconds, with an astounding 99% accuracy rate. Their system not only improved our efficiency but also ensured compliance across 25+ police forces. The integration was seamless, and their team provided outstanding support throughout the process. This solution has been a game-changer for us!"</p>
                        <strong class="text-brand" style="font-size: 1.2rem; font-family: var(--font-mono); text-transform: uppercase;">CEO of MedTech Company</strong>
                        <span style="display: block; font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem;">Client identity withheld due to confidentiality agreement</span>
                    </div>

                </div>
            </div>
        </div>
    </div>`,

    //<!-- Sanki Events Modal -->
    'cs-sanki-events':`<div class="case-study-overlay" id="cs-sanki-events" data-lenis-prevent>
        <button class="close-cs-btn" onclick="closeCaseStudy('cs-sanki-events')">
            <i class="fa-solid fa-xmark"></i>
        </button>
    
        <div class="container" style="max-width: 1200px;">
            <div class="cs-header fade-up" style="text-align: center; border-bottom: none; padding-bottom: 0;">
                <span class="p-category text-brand">Case Study</span>
                <h1 class="hero-title reveal-text" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem;">Sanki
                    Events</h1>
                <p class="hero-desc" style="margin: 0 auto;">In-House ERP for Operations, Accounts & Ticket Management</p>
            </div>
    
            <div class="cs-content fade-up">
                <!-- Image Slider -->
                <div class="cs-slider-wrapper"
                    style="position: relative; margin-top: 3rem; margin-bottom: 4rem; border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); height: 500px; background: var(--surface);">
                    <div class="cs-slider"
                        style="display: flex; width: 100%; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none;">
    
                        <div
                            style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_Sanki-Events/sankievents1.png"
                                alt="Sanki Events ERP Dashboard 1"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
    
                        <div
                            style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_Sanki-Events/sankievents2.png"
                                alt="Sanki Events ERP Dashboard 2"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
    
                        <div
                            style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_Sanki-Events/sankievents3.png"
                                alt="Sanki Events ERP Dashboard 3"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
    
                        <div
                            style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_Sanki-Events/sankievents4.png"
                                alt="Sanki Events ERP Dashboard 4"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                    </div>
                    <button class="slider-btn prev-cs-btn"
                        style="position: absolute; z-index: 3; top: 50%; left: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i
                            class="fa-solid fa-chevron-left"></i></button>
                    <button class="slider-btn next-cs-btn"
                        style="position: absolute; z-index: 3; top: 50%; right: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i
                            class="fa-solid fa-chevron-right"></i></button>
                </div>
    
                <div class="cs-grid" style="grid-template-columns: 1fr; gap: 4rem;">
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Problem Statement</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 1.5rem; font-weight: 500;">Managing High-Volume
                            Navratri Ticket Resales</h4>
                        <p class="cs-text">Sanki Events, a prominent ticketing company and official reselling partner for
                            major events like Navratri, faced immense challenges in tracking operations. Relying on manual
                            logs, spreadsheets, and disjointed communication made it incredibly difficult to maintain an
                            accurate count of physical and digital tickets distributed among their internal team.</p>
                        <p class="cs-text">Furthermore, managing daily accounts, reconciling cash flows, and monitoring the
                            sales performance of different team members in real-time was becoming an operational bottleneck.
                            This lack of centralized visibility led to discrepancies, delayed reporting, and revenue leaks
                            during peak event seasons.</p>
                    </div>
    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Our Solution</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 1.5rem; font-weight: 500;">Centralized Ticketing &
                            Accounts ERP</h4>
                        <p class="cs-text">Dynamic Labz architected a highly secure, bespoke in-house ERP system
                            specifically tailored to the fast-paced nature of event ticketing. The platform serves as a
                            centralized hub where administrators can digitally allocate ticket quotas to various team
                            members, track live sales progress, and monitor inventory depletion instantly.</p>
                        <p class="cs-text">The system features a robust accounting module that automates financial
                            reconciliations, tracks operational expenses, and provides real-time visibility into the overall
                            cash flow. We integrated Role-Based Access Control (RBAC) to ensure that ground-level sellers
                            only see their specific data and remittance requirements, while management gets a comprehensive,
                            bird's-eye view of the entire operation.</p>
                    </div>
    
                    <div>
                        <h3 class="cs-section-title text-brand">Key Features</h3>
                        <ul class="pillar-list" style="margin-top: 1.5rem;">
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Real-Time Ticket
                                    Inventory:</span> Live tracking of allocated, sold, and remaining tickets across the
                                entire team network.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Automated Accounts
                                    Management:</span> Centralized tracking of daily revenue, cash flows, and operational
                                expenses to prevent leaks.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Role-Based Access
                                    Control (RBAC):</span> Secure, tailored dashboards for administrators, sub-admins, and
                                ground-level sales executives.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Team Performance
                                    Tracking:</span> Instant visibility into individual team member sales metrics and
                                pending cash remittances.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Data Export &
                                    Reporting:</span> Automated generation of financial ledgers and end-of-day sales reports
                                for seamless auditing.</li>
                        </ul>
                    </div>
    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Results</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Streamlining High-Stakes Event
                            Operations</h4>
    
                        <div
                            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">100% Inventory Accuracy</strong>
                                <p
                                    style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">
                                    Eliminated lost or untracked tickets through strict digital allocation and live
                                    inventory depletion tracking.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Streamlined Financials</strong>
                                <p
                                    style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">
                                    Automated ledger reconciliation prevented cash discrepancies at the end of the day,
                                    securing overall revenue.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Maximized Team
                                    Efficiency</strong>
                                <p
                                    style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">
                                    Replaced endless manual messaging and physical ledgers with a single, live operational
                                    dashboard.</p>
                            </div>
                        </div>
                    </div>
    
                    <div class="glass-card"
                        style="padding: 4rem; text-align: center; border-color: var(--brand); box-shadow: 0 10px 30px var(--brand-glow); margin-top: 4rem;">
                        <div class="quote-icon text-brand"
                            style="margin-bottom: 2rem; display: flex; justify-content: center; opacity: 1;"><i
                                class="fa-solid fa-quote-left" style="font-size: 3rem;"></i></div>
                        <p
                            style="font-size: 1.25rem; font-style: italic; line-height: 1.8; margin-bottom: 2.5rem; color: white;">
                            "The in-house ERP developed by Dynamic Labz brought absolute clarity to our ticketing
                            operations. Tracking thousands of Navratri tickets and managing accounts across our team used to
                            be chaotic, but now everything is seamlessly automated in one dashboard."</p>
                        <strong class="text-brand"
                            style="font-size: 1.2rem; font-family: var(--font-mono); text-transform: uppercase;">Akshat
                            Shah</strong>
                        <span style="display: block; font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem;">Founder
                            of Sanki Events</span>
                    </div>
    
                </div>
            </div>
        </div>
    </div>`,

    //<!-- OvenFresh Modal -->
    'cs-ovenfresh':`<div class="case-study-overlay" id="cs-ovenfresh" data-lenis-prevent>
        <button class="close-cs-btn" onclick="closeCaseStudy('cs-ovenfresh')">
            <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="container" style="max-width: 1200px;">
            
            <div class="cs-header fade-up" style="text-align: center; border-bottom: none; padding-bottom: 0;">
                <span class="p-category text-brand">Case Study</span>
                <h1 class="hero-title reveal-text" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem;">OvenFresh</h1>
                <p class="hero-desc" style="margin: 0 auto; max-width: 800px;">Premium E-Commerce Bakery & Gifting Platform</p>
            </div>

            <div class="cs-content fade-up">
                
                <div class="cs-slider-wrapper" style="position: relative; margin-top: 3rem; margin-bottom: 4rem; border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); height: 500px; background: var(--surface);">
                    <div class="cs-slider" style="display: flex; width: 100%; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none;">
                        
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_OvenFresh/ovenfresh1.png" alt="OvenFresh E-Commerce Storefront" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        
                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_OvenFresh/ovenfresh2.png" alt="OvenFresh Custom Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_OvenFresh/ovenfresh3.png" alt="OvenFresh Custom Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_OvenFresh/ovenfresh4.png" alt="OvenFresh Custom Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_OvenFresh/ovenfresh5.png" alt="OvenFresh Custom Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_OvenFresh/ovenfresh6.png" alt="OvenFresh Custom Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_OvenFresh/ovenfresh7.png" alt="OvenFresh Custom Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_OvenFresh/ovenfresh8.png" alt="OvenFresh Custom Checkout Flow" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                        
                    </div>
                    
                    <button class="slider-btn prev-cs-btn" style="position: absolute; z-index: 3; top: 50%; left: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="slider-btn next-cs-btn" style="position: absolute; z-index: 3; top: 50%; right: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i class="fa-solid fa-chevron-right"></i></button>
                </div>

                <div class="cs-grid" style="grid-template-columns: 1fr; gap: 4rem;">
                    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">The Goal</h3>
                        <p class="cs-text">OvenFresh, a premium bakery known for its high-quality cakes, artisanal treats, and elaborate gifting hampers, needed to scale their digital presence. The goal was to build a robust e-commerce storefront that provided an appetizing, seamless online shopping experience while handling complex variables like customized cake messages, eggless options, and highly specific delivery time slots across Mumbai.</p>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">How We Built It</h3>
                        <p class="cs-text">We architected a conversion-optimized web platform with a custom checkout flow tailored specifically for the bakery and gifting industry. The frontend was designed to heavily showcase their premium product imagery, allowing users to effortlessly navigate through dozens of categories from Bento Cakes to Floral Bouquets.</p>
                        <p class="cs-text">Behind the scenes, we integrated a dynamic delivery scheduling system. This smart backend validates customer locations in real-time and manages intricate delivery logistics—such as blocking out specific dates, managing "Midnight Delivery" requests, and automating "Same Day" order cut-offs.</p>
                    </div>

                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">The Launch</h3>
                        <p class="cs-text">The launch of the new storefront successfully bridged OvenFresh's decades-old artisanal heritage with modern digital convenience. The frictionless checkout drastically reduced cart abandonment, enabling the brand to effortlessly capture high-value orders and easily withstand massive traffic surges during peak festival and holiday seasons.</p>
                    </div>

                    <div style="margin-top: 1rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Benefits</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Why this works for Premium Retailers</h4>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-cake-candles text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Dynamic Cataloging</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Easily showcase hundreds of items with customized product variations like weight, flavor, and personalized messages.</p>
                            </div>
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-truck-fast text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Smart Scheduling</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">An integrated slot-based delivery system that flawlessly manages standard, midnight, and future-dated delivery logistics.</p>
                            </div>
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-cart-shopping text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Seamless Checkout</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">A secure, frictionless buying pipeline designed to minimize required clicks and maximize online sales conversions.</p>
                            </div>
                            
                            <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-mobile-screen text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Mobile-Optimized UX</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Flawless performance and layout scaling on smartphones, ensuring customers can quickly buy a gift on the go.</p>
                            </div>

                        </div>
                    </div>

                    <div style="margin-top: 2rem; margin-bottom: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">FAQ</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Frequently Asked Questions</h4>
                        
                        <div class="faq-container" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Can customers select specific delivery times?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">Yes, the custom checkout allows users to choose exact delivery dates and time slots based on the real-time availability logic we programmed for the bakery.</p>
                                </div>
                            </div>
                            
                            <div class="faq-item glass-card" style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Is the platform capable of handling festival traffic spikes?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon" style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">Absolutely. The web architecture is built to scale seamlessly, ensuring zero downtime and lightning-fast speeds even during massive holiday order surges.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card" style="padding: 4rem; text-align: center; border-color: var(--brand); box-shadow: 0 10px 30px var(--brand-glow); margin-top: 2rem;">
                        <div class="quote-icon text-brand" style="margin-bottom: 2rem; display: flex; justify-content: center; opacity: 1;"><i class="fa-solid fa-quote-left" style="font-size: 3rem;"></i></div>
                        <p style="font-size: 1.25rem; font-style: italic; line-height: 1.8; margin-bottom: 2.5rem; color: white;">"Dynamic Labz delivered an exceptional e-commerce platform that perfectly captures the essence of OvenFresh. The seamless ordering process and smart delivery scheduling have transformed our digital sales."</p>
                        <strong class="text-brand" style="font-size: 1.2rem; font-family: var(--font-mono); text-transform: uppercase;">Management Team</strong>
                        <span style="display: block; font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem;">OvenFresh</span>
                    </div>

                </div>
            </div>
        </div>
    </div>`,

    //<!-- Ruby Chemicals Modal -->
    'cs-ruby-chemicals':`<div class="case-study-overlay" id="cs-ruby-chemicals" data-lenis-prevent>
        <button class="close-cs-btn" onclick="closeCaseStudy('cs-ruby-chemicals')"><i
                class="fa-solid fa-xmark"></i></button>
        <div class="container" style="max-width: 1200px;">
            <div class="cs-header fade-up" style="text-align: center; border-bottom: none; padding-bottom: 0;">
                <span class="p-category text-brand">Case Study</span>
                <h1 class="hero-title reveal-text" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem;">Ruby
                    Chemicals</h1>
                <p class="hero-desc" style="margin: 0 auto;">Manufacturing & Supply Chain ERP Platform</p>
            </div>
            <div class="cs-content fade-up">
    
                <div class="cs-slider-wrapper"
                    style="position: relative; margin-top: 3rem; margin-bottom: 4rem; border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); height: 500px; background: var(--surface);">
                    <div class="cs-slider"
                        style="display: flex; width: 100%; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none;">
                        <div
                            style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_RubyChemicals/ruby1.png" alt="Ruby Chemicals ERP Dashboard"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div
                            style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_RubyChemicals/ruby2.png" alt="Ruby Chemicals ERP Dashboard"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div
                            style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_RubyChemicals/ruby3.png" alt="Ruby Chemicals ERP Dashboard"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div
                            style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_RubyChemicals/ruby4.png" alt="Ruby Chemicals ERP Dashboard"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div
                            style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_RubyChemicals/ruby5.png" alt="Ruby Chemicals ERP Dashboard"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div
                            style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_RubyChemicals/ruby6.png" alt="Ruby Chemicals ERP Dashboard"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div
                            style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_RubyChemicals/ruby7.png" alt="Ruby Chemicals ERP Dashboard"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
                    </div>
                    <button class="slider-btn prev-cs-btn"
                        style="position: absolute; z-index: 3; top: 50%; left: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i
                            class="fa-solid fa-chevron-left"></i></button>
                    <button class="slider-btn next-cs-btn"
                        style="position: absolute; z-index: 3; top: 50%; right: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i
                            class="fa-solid fa-chevron-right"></i></button>
                </div>
    
                <div class="cs-grid" style="grid-template-columns: 1fr; gap: 4rem;">
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Problem Statement</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 1.5rem; font-weight: 500;">Scaling Chemical Production
                            & Quality Assurance</h4>
                        <p class="cs-text">Ruby Chemicals, a premier manufacturer of construction chemicals, waterproofing
                            solutions, and industrial flooring based in Ahmedabad, was experiencing rapid operational
                            growth. With an expanding product line and an increasing number of private label and toll
                            manufacturing clients, their legacy manual tracking systems were struggling to keep up with
                            production volume.</p>
                        <p class="cs-text">Managing raw material sourcing, multi-stage chemical batch processing, quality
                            control testing, and private label packaging required absolute precision. The lack of a
                            centralized digital system led to siloed data and inefficient inventory management, which
                            threatened to bottleneck their commitment to impeccable quality and on-time delivery.</p>
                    </div>
    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Our Solution</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 1.5rem; font-weight: 500;">Bespoke Manufacturing &
                            Supply Chain ERP</h4>
                        <p class="cs-text">Dynamic Labz engineered a customized Manufacturing & Supply Chain ERP tailored
                            specifically for the construction chemical industry. We integrated their entire production
                            lifecycle—from raw material procurement to final dispatch—into a unified, highly secure
                            dashboard.</p>
                        <p class="cs-text">The ERP features real-time inventory tracking, automated batch formulation
                            oversight, and a dedicated Quality Control module that ensures every product meets strict
                            specifications before leaving their state-of-the-art laboratory. Furthermore, for their contract
                            manufacturing division, we built an integrated tracking system that securely manages proprietary
                            formulations and B2B order timelines.</p>
                    </div>
    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
                        <div class="glass-card sec-card"
                            style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div
                                style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden; background: rgba(118, 31, 227, 0.05); display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-flask text-brand" style="font-size: 4rem; opacity: 0.5;"></i>
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand"
                                    style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION
                                    01</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Automated Batch Processing</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">Precision
                                    formulation tracking and real-time oversight of chemical mixing to ensure consistent
                                    quality.</p>
                            </div>
                        </div>
    
                        <div class="glass-card sec-card"
                            style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div
                                style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden; background: rgba(118, 31, 227, 0.05); display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-boxes-stacked text-brand" style="font-size: 4rem; opacity: 0.5;"></i>
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand"
                                    style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION
                                    02</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Inventory & Supply Chain</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">Automated raw
                                    material alerts and comprehensive stock management to prevent production bottlenecks.
                                </p>
                            </div>
                        </div>
    
                        <div class="glass-card sec-card"
                            style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                            <div
                                style="height: 220px; border-bottom: 1px solid var(--border-color); overflow: hidden; background: rgba(118, 31, 227, 0.05); display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-microscope text-brand" style="font-size: 4rem; opacity: 0.5;"></i>
                            </div>
                            <div style="padding: 2.5rem; flex-grow: 1;">
                                <span class="text-brand"
                                    style="font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 1px;">SECTION
                                    03</span>
                                <h4 style="margin: 1rem 0; font-size: 1.3rem;">Quality Control Hub</h4>
                                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">Integrated lab
                                    testing logs and automated generation of safety and compliance reports for every batch.
                                </p>
                            </div>
                        </div>
                    </div>
    
                    <div>
                        <h3 class="cs-section-title text-brand">Key Features</h3>
                        <ul class="pillar-list" style="margin-top: 1.5rem;">
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Real-Time Inventory
                                    Management:</span> Automated tracking of raw materials and finished goods with low-stock
                                alerts.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Batch Processing
                                    Oversight:</span> Granular control over chemical formulations and multi-stage
                                manufacturing workflows.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Contract
                                    Manufacturing Integration:</span> Secure handling of toll manufacturing orders and
                                proprietary private label recipes.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Integrated QC
                                    Logging:</span> Digital quality control checkpoints directly linked to their laboratory
                                testing protocols.</li>
                            <li><i class="fa-solid fa-check"></i> <span style="color: var(--text-main);">Automated
                                    Compliance Reporting:</span> Instant generation of safety data sheets and
                                industry-standard compliance documents.</li>
                        </ul>
                    </div>
    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Results</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Achieving Manufacturing
                            Excellence</h4>
    
                        <div
                            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">100% Data
                                    Centralization</strong>
                                <p
                                    style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">
                                    Unified all manufacturing, inventory, and sales data into a single, highly accessible
                                    digital ecosystem.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Accelerated Processing</strong>
                                <p
                                    style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">
                                    Streamlined batch approvals and reduced production bottlenecks, speeding up overall
                                    delivery times.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Zero Compliance Errors</strong>
                                <p
                                    style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">
                                    Automated reporting completely eliminated manual data entry mistakes in safety and
                                    quality documentation.</p>
                            </div>
                            <div class="glass-card" style="padding: 2rem;">
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Enhanced B2B Operations</strong>
                                <p
                                    style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.5;">
                                    Structured workflows significantly improved transparency and satisfaction for their
                                    private label clients.</p>
                            </div>
                        </div>
                    </div>
    
                    <div style="margin-top: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Benefits</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Benefits of Custom
                            Manufacturing ERP</h4>
    
                        <div
                            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                            <div class="glass-card"
                                style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-gears text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Operational Efficiency</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
                                    Streamline production cycles and drastically reduce manual oversight across the factory
                                    floor.</p>
                            </div>
                            <div class="glass-card"
                                style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-chart-pie text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Cost Reduction</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
                                    Optimize raw material procurement and minimize chemical wastage through precise
                                    inventory tracking.</p>
                            </div>
                            <div class="glass-card"
                                style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-arrow-up-right-dots text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Scalability</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">Easily
                                    add new chemical product lines or contract manufacturing clients without straining the
                                    system.</p>
                            </div>
                            <div class="glass-card"
                                style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-clipboard-check text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Quality Assurance</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
                                    Maintain the highest industry standards with automated QC enforcement at every stage.
                                </p>
                            </div>
                        </div>
                    </div>
    
                    <div style="margin-top: 2rem; margin-bottom: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">FAQ</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Frequently Asked Questions
                        </h4>
    
                        <div class="faq-container" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div class="faq-item glass-card"
                                style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header"
                                    style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Can the
                                        ERP handle custom formulations for contract manufacturing?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon"
                                        style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
                                        Yes, the system includes a flexible formulation engine that allows admins to save
                                        and track proprietary recipes securely for toll manufacturing clients.</p>
                                </div>
                            </div>
    
                            <div class="faq-item glass-card"
                                style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header"
                                    style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Does the
                                        system track raw material expiry dates?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon"
                                        style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
                                        Absolutely. The inventory module includes strict batch-tracking and expiry alerts,
                                        ensuring only optimal materials are used in production.</p>
                                </div>
                            </div>
    
                            <div class="faq-item glass-card"
                                style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header"
                                    style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Is the
                                        data secure for B2B clients?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon"
                                        style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
                                        The platform utilizes stringent Role-Based Access Control (RBAC), ensuring that
                                        private label clients and internal teams only see the data relevant to their
                                        specific permissions, keeping all proprietary information strictly confidential.</p>
                                </div>
                            </div>
                        </div>
                    </div>
    
                    <div class="glass-card"
                        style="padding: 4rem; text-align: center; border-color: var(--brand); box-shadow: 0 10px 30px var(--brand-glow);">
                        <div class="quote-icon text-brand"
                            style="margin-bottom: 2rem; display: flex; justify-content: center; opacity: 1;"><i
                                class="fa-solid fa-quote-left" style="font-size: 3rem;"></i></div>
                        <p
                            style="font-size: 1.25rem; font-style: italic; line-height: 1.8; margin-bottom: 2.5rem; color: white;">
                            "Dynamic Labz provided us with exactly what we needed to scale our operations. Their custom ERP
                            completely transformed how we manage our batch processing and inventory, allowing us to maintain
                            our strict quality standards while significantly boosting our production capacity."</p>
                        <strong class="text-brand"
                            style="font-size: 1.2rem; font-family: var(--font-mono); text-transform: uppercase;">Management
                            Team</strong>
                        <span style="display: block; font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem;">Ruby
                            Chemicals</span>
                    </div>
    
                </div>
            </div>
        </div>
    </div>`,

    //<!-- TCA Modal -->
    'cs-tca':`<div class="case-study-overlay" id="cs-tca" data-lenis-prevent>
        <button class="close-cs-btn" onclick="closeCaseStudy('cs-tca')">
            <i class="fa-solid fa-xmark"></i>
        </button>
    
        <div class="container" style="max-width: 1200px;">
    
            <div class="cs-header fade-up" style="text-align: center; border-bottom: none; padding-bottom: 0;">
                <span class="p-category text-brand">Admin Ecosystem</span>
                <h1 class="hero-title reveal-text" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 0.5rem;">TCA
                </h1>
    
                <div style="margin: 0 auto; max-width: 800px;">
                    <strong
                        style="display: block; font-size: clamp(1.2rem, 3vw, 1.8rem); color: var(--text-main); font-weight: 600; margin-bottom: 0.5rem; letter-spacing: 0.5px;">
                        Tigray Community Atlanta
                    </strong>
                    <p class="hero-desc" style="margin: 0 auto;">
                        Comprehensive Donation & Fund Management ERP
                    </p>
                </div>
            </div>
    
            <div class="cs-content fade-up">
    
                <div class="cs-slider-wrapper"
                    style="position: relative; margin-top: 3rem; margin-bottom: 4rem; border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); height: 500px; background: var(--surface);">
                    <div class="cs-slider"
                        style="display: flex; width: 100%; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none;">
    
                        <div
                            style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_TCA/tca1.png" alt="TCA Admin Dashboard"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
    
                        <div
                            style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_TCA/tca2.png" alt="TCA User Profile Ledger"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div
                            style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_TCA/tca3.png" alt="TCA User Profile Ledger"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div
                            style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_TCA/tca4.png" alt="TCA User Profile Ledger"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>

                        <div
                            style="min-width: 100%; height: 100%; flex: 0 0 auto; scroll-snap-align: start; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                            <img loading="lazy" src="assets/images/project_TCA/tca5.png" alt="TCA User Profile Ledger"
                                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                        </div>
    
                    </div>
    
                    <button class="slider-btn prev-cs-btn"
                        style="position: absolute; z-index: 3; top: 50%; left: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i
                            class="fa-solid fa-chevron-left"></i></button>
                    <button class="slider-btn next-cs-btn"
                        style="position: absolute; z-index: 3; top: 50%; right: 20px; transform: translateY(-50%); background: rgba(3,1,8,0.6); border: 1px solid var(--brand); color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(5px); transition: 0.3s;"><i
                            class="fa-solid fa-chevron-right"></i></button>
                </div>
    
                <div class="cs-grid" style="grid-template-columns: 1fr; gap: 4rem;">
    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">The Goal</h3>
                        <p class="cs-text">Tigray Community Atlanta (TCA) needed a highly secure, centralized system to
                            manage the flow of community capital. Their core requirement was an internal admin ecosystem
                            capable of accurately tracking incoming donations from community members and overseeing the
                            outward distribution of those funds to individuals in need, replacing inefficient manual
                            tracking with absolute transparency.</p>
                    </div>
    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">How We Built It</h3>
                        <p class="cs-text">We engineered a bespoke ERP-style admin panel tailored specifically to non-profit
                            financial logistics. The core of the platform is a robust relational database that captures and
                            categorizes all incoming donation streams.</p>
                        <p class="cs-text">To ensure granular transparency, we architected a detailed user profile system.
                            Administrators can now instantly pull up individual donor profiles, view lifetime contribution
                            metrics, and track the exact lifecycle of specific transactions—from the moment a donation is
                            logged to its final distribution as relief funding.</p>
                    </div>
    
                    <div>
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">The Launch</h3>
                        <p class="cs-text">The deployment of this internal panel brought total operational clarity to TCA's
                            management team. By automating the ledger and housing all transaction histories in one highly
                            accessible, secure dashboard, we drastically reduced administrative overhead and ensured that
                            relief funds could be managed and distributed with complete confidence and accountability.</p>
                    </div>
    
                    <div style="margin-top: 1rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">Benefits</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Why this works for Community
                            Organizations</h4>
    
                        <div
                            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
    
                            <div class="glass-card"
                                style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-table-columns text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Centralized Dashboard</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">A
                                    real-time, bird's-eye view tracking all incoming donations and outgoing community relief
                                    funds in one place.</p>
                            </div>
    
                            <div class="glass-card"
                                style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-address-card text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Comprehensive Profiles</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
                                    Deep-dive into individual member histories, allowing admins to instantly view lifetime
                                    contributions and logs.</p>
                            </div>
    
                            <div class="glass-card"
                                style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-file-invoice-dollar text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Transparent Ledger</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">A
                                    highly secure, easily searchable record of every specific transaction moving through the
                                    organization.</p>
                            </div>
    
                            <div class="glass-card"
                                style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                                <i class="fa-solid fa-clock-rotate-left text-brand" style="font-size: 1.8rem;"></i>
                                <strong style="font-size: 1.1rem; color: var(--text-main);">Operational Efficiency</strong>
                                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
                                    Replaces manual spreadsheets with automated data handling, saving hundreds of
                                    administrative hours annually.</p>
                            </div>
    
                        </div>
                    </div>
    
                    <div style="margin-top: 2rem; margin-bottom: 2rem;">
                        <h3 class="cs-section-title text-brand" style="margin-bottom: 0.5rem;">FAQ</h3>
                        <h4 style="font-size: 1.4rem; margin-bottom: 2rem; font-weight: 500;">Frequently Asked Questions
                        </h4>
    
                        <div class="faq-container" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div class="faq-item glass-card"
                                style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header"
                                    style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">Can
                                        administrators track individual donor history?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon"
                                        style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
                                        Yes, the platform features detailed user profiles that log every individual
                                        transaction, providing a complete and searchable historical ledger for every
                                        community member.</p>
                                </div>
                            </div>
    
                            <div class="faq-item glass-card"
                                style="padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; overflow: hidden;">
                                <div class="faq-header"
                                    style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                                    <strong style="font-size: 1.1rem; color: var(--text-main); line-height: 1.4;">How does
                                        the system handle the distribution of funds?</strong>
                                    <i class="fa-solid fa-plus text-brand faq-icon"
                                        style="transition: transform 0.3s; flex-shrink: 0;"></i>
                                </div>
                                <div class="faq-content">
                                    <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
                                        The admin panel includes specialized modules to track outgoing funds, ensuring
                                        relief money is accurately logged, categorized, and reconciled against the intended
                                        beneficiaries.</p>
                                </div>
                            </div>
                        </div>
                    </div>
    
                    <div class="glass-card"
                        style="padding: 4rem; text-align: center; border-color: var(--brand); box-shadow: 0 10px 30px var(--brand-glow); margin-top: 2rem;">
                        <div class="quote-icon text-brand"
                            style="margin-bottom: 2rem; display: flex; justify-content: center; opacity: 1;"><i
                                class="fa-solid fa-quote-left" style="font-size: 3rem;"></i></div>
                        <p
                            style="font-size: 1.25rem; font-style: italic; line-height: 1.8; margin-bottom: 2.5rem; color: white;">
                            "The custom admin ecosystem engineered by Dynamic Labz completely transformed how we manage our
                            community funds. We now have total transparency and can easily track every donation and
                            distribution with total confidence."</p>
                        <strong class="text-brand"
                            style="font-size: 1.2rem; font-family: var(--font-mono); text-transform: uppercase;">Management
                            Team</strong>
                        <span style="display: block; font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem;">Tigray
                            Community Atlanta</span>
                    </div>
    
                </div>
            </div>
        </div>
    </div>`,

}


function openCaseStudy(id) {
    const modalHtml = allCaseStudies[id];

    if (!modalHtml) {
        console.error(`Case study not found: ${id}`);
        return;
    }

    // Remove existing modal if any
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const overlay = document.getElementById(id);

    // Force initial position
    gsap.set(overlay, { y: "100%" });

    // Animate in
    gsap.to(overlay, {
        y: "0%",
        duration: 0.8,
        ease: "power4.out"
    });

    // Stop scrolling
    if (typeof lenis !== 'undefined') {
        lenis.stop();
    }

    document.body.style.overflow = "hidden";

    // Reinitialize slider/buttons if needed
    initializeCaseStudyFeatures(overlay);
}

function initializeCaseStudyFeatures(modal) {
    const slider = modal.querySelector('.cs-slider');

    if (!slider) return;

    const prevBtn = modal.querySelector('.prev-cs-btn');
    const nextBtn = modal.querySelector('.next-cs-btn');

    prevBtn?.addEventListener('click', () => {
        slider.scrollBy({
            left: -slider.clientWidth,
            behavior: 'smooth'
        });
    });

    nextBtn?.addEventListener('click', () => {
        slider.scrollBy({
            left: slider.clientWidth,
            behavior: 'smooth'
        });
    });
}


function closeCaseStudy(id) {
    const overlay = document.getElementById(id);

    if (!overlay) return;

    gsap.to(overlay, {
        y: "100%",
        duration: 0.6,
        ease: "power3.in",
        onComplete: () => {
            overlay.remove();

            if (typeof lenis !== 'undefined') {
                lenis.start();
            }

            document.body.style.overflow = "";
        }
    });
}



// function openCaseStudy(id) {
//     const overlay = document.getElementById(id);
//     if(overlay) {
//         // Slide it up smoothly
//         gsap.to(overlay, { y: "0%", duration: 0.8, ease: "power4.out" });
        
//         // 1. Pause Lenis smooth scrolling
//         if (typeof lenis !== 'undefined') lenis.stop(); 
        
//         // 2. Absolute lock for native browser scrolling
//         document.body.style.overflow = "hidden"; 
//     }
// }

// function closeCaseStudy(id) {
//     const overlay = document.getElementById(id);
//     if(overlay) {
//         // Slide it back down
//         gsap.to(overlay, { y: "100%", duration: 0.6, ease: "power3.in" });
        
//         // 1. Restart Lenis smooth scrolling
//         if (typeof lenis !== 'undefined') lenis.start(); 
        
//         // 2. Remove the absolute lock
//         document.body.style.overflow = ""; 
//     }
// }

// =========================================
// CASE STUDY IMAGE SLIDER LOGIC
// =========================================
const sliderWrappers = document.querySelectorAll('.cs-slider-wrapper');

sliderWrappers.forEach(wrapper => {
    const csSlider = wrapper.querySelector('.cs-slider');
    const prevCsBtn = wrapper.querySelector('.prev-cs-btn');
    const nextCsBtn = wrapper.querySelector('.next-cs-btn');

    if (csSlider && prevCsBtn && nextCsBtn) {
        prevCsBtn.addEventListener('click', () => {
            const slideWidth = csSlider.offsetWidth;
            csSlider.scrollBy({ left: -slideWidth, behavior: 'smooth' });
        });

        nextCsBtn.addEventListener('click', () => {
            const slideWidth = csSlider.offsetWidth;
            csSlider.scrollBy({ left: slideWidth, behavior: 'smooth' });
        });
    }
});

// =========================================
// FAQ ACCORDION LOGIC
// =========================================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    
    header.addEventListener('click', (e) => {
        e.preventDefault(); // Stops any default weird browser behavior
        
        // 1. Check if the one clicked is already open
        const isOpen = item.classList.contains('active');
        
        // 2. Force close ALL FAQs on the page to reset everything perfectly
        faqItems.forEach(faq => faq.classList.remove('active'));
        
        // 3. If the one clicked wasn't open, open it!
        if (!isOpen) {
            item.classList.add('active');
        }
    });
});

// =========================================
// GO TO TOP BUTTON LOGIC
// =========================================
const goTopBtn = document.getElementById("goTopBtn");

if (goTopBtn) {
    // Show button when scrolling down past 500px
    window.addEventListener("scroll", () => {
        if (window.scrollY > 500) {
            goTopBtn.classList.add("visible");
        } else {
            goTopBtn.classList.remove("visible");
        }
    });

    // When clicked, glide to the top
    goTopBtn.addEventListener("click", () => {
        if (typeof lenis !== 'undefined') {
            // If Lenis smooth scrolling is active, use it for a cinematic scroll up
            lenis.scrollTo(0, { duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        } else {
            // Fallback for native scrolling
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// =========================================
// CUSTOM DROPDOWN LOGIC (CONTACT FORM)
// =========================================
const customSelects = document.querySelectorAll('.custom-select-wrapper');

customSelects.forEach(wrapper => {
    const display = wrapper.querySelector('.custom-select-display');
    const textDisplay = wrapper.querySelector('.selected-text');
    const options = wrapper.querySelectorAll('.custom-select-options li');
    const hiddenInput = wrapper.querySelector('input[type="hidden"]');

    // 1. Toggle dropdown open/close when clicking the box
    display.addEventListener('click', (e) => {
        // Close any other open dropdowns first for a clean UI
        document.querySelectorAll('.custom-select-wrapper').forEach(w => {
            if (w !== wrapper) w.classList.remove('open');
        });
        
        wrapper.classList.toggle('open');
        e.stopPropagation(); // Prevent the click from immediately bubbling to the document
    });

    // 2. Handle option selection
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            // Update the display text and color
            textDisplay.textContent = option.textContent;
            textDisplay.style.color = 'white'; 
            
            // Update the hidden input value so the form submits correctly
            hiddenInput.value = option.getAttribute('data-value');
            
            // Highlight the selected option
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            // Close the dropdown
            wrapper.classList.remove('open');
            e.stopPropagation();
        });
    });
});

// 3. Close the dropdown if the user clicks anywhere else on the page
document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
        wrapper.classList.remove('open');
    });
});

// =========================================
// COMPACT MOBILE MENU LOGIC
// =========================================
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
const mLinks = document.querySelectorAll('.m-link');

if (mobileMenuToggle && mobileMenuOverlay) {
    const icon = mobileMenuToggle.querySelector('i');

    // 1. Toggle menu open/close when clicking the hamburger
    mobileMenuToggle.addEventListener('click', (e) => {
        mobileMenuOverlay.classList.toggle('active');
        
        if (mobileMenuOverlay.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
        e.stopPropagation(); // Prevent the click-outside logic from immediately triggering
    });

    // 2. Close menu when a link is clicked
    mLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuOverlay.classList.remove('active');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        });
    });

    // 3. Close menu if user clicks anywhere outside of it
    document.addEventListener('click', (e) => {
        if (mobileMenuOverlay.classList.contains('active') && !mobileMenuOverlay.contains(e.target)) {
            mobileMenuOverlay.classList.remove('active');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });
}

// =========================================
// MAGNETIC BUTTON PHYSICS
// =========================================
const magneticButtons = document.querySelectorAll('.magnetic-btn');

magneticButtons.forEach((btn) => {
    // We use GSAP's quickTo for high-performance tracking
    const xTo = gsap.quickTo(btn, "x", {duration: 1, ease: "elastic.out(1, 0.3)"});
    const yTo = gsap.quickTo(btn, "y", {duration: 1, ease: "elastic.out(1, 0.3)"});

    btn.addEventListener("mousemove", (e) => {
        // Get the exact dimensions and position of the button
        const rect = btn.getBoundingClientRect();
        
        // Calculate the center of the button
        const centerX = rect.left + (rect.width / 2);
        const centerY = rect.top + (rect.height / 2);
        
        // Calculate the distance from the center to the mouse
        // We multiply by 0.3 so the button doesn't move TOO far (adjust this for more/less pull)
        const distanceX = (e.clientX - centerX) * 0.3;
        const distanceY = (e.clientY - centerY) * 0.3;
        
        // Move the button
        xTo(distanceX);
        yTo(distanceY);
    });

    btn.addEventListener("mouseleave", () => {
        // Snap the button back to the center when the mouse leaves
        xTo(0);
        yTo(0);
    });
});

// =========================================
// EMAILJS CONTACT FORM ROUTING
// =========================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize EmailJS (Replace with your actual Public Key)
    if(typeof emailjs !== 'undefined') {
        emailjs.init("Je9Of6e4wXjfB2YAp"); 
    }

    const contactForm = document.getElementById('inquiry-form');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Stop the page from refreshing

            // 2. Visual feedback: change button to "Sending..."
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending Details <i class="fa-solid fa-spinner fa-spin" style="margin-left: 10px;"></i>';
            submitBtn.style.opacity = '0.7';
            submitBtn.style.pointerEvents = 'none';

            // 3. Send the form data via EmailJS (Replace with your Service ID and Template ID)
            emailjs.sendForm('service_zy3dr9g', 'template_55yfaxi', this)
                .then(function() {
                    // Success State
                    submitBtn.innerHTML = 'Inquiry Sent <i class="fa-solid fa-check" style="margin-left: 10px;"></i>';
                    submitBtn.style.background = '#10b981'; // Green success color
                    submitBtn.style.borderColor = '#10b981';
                    submitBtn.style.opacity = '1';
                    
                    contactForm.reset();
                    
                    // Reset the custom dropdown text visually
                    const dropdownText = contactForm.querySelector('.selected-text');
                    if(dropdownText) {
                        dropdownText.textContent = "Select a Service";
                        dropdownText.style.color = 'var(--text-muted)';
                    }
                    
                    // Reset button to original state after 3.5 seconds
                    setTimeout(() => {
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.style.background = '';
                        submitBtn.style.borderColor = '';
                        submitBtn.style.pointerEvents = 'all';
                    }, 3500);

                }, function(error) {
                    // Error State
                    console.log('FAILED...', error);
                    submitBtn.innerHTML = 'Error. Try Again <i class="fa-solid fa-xmark" style="margin-left: 10px;"></i>';
                    submitBtn.style.background = '#ef4444'; // Red error color
                    submitBtn.style.borderColor = '#ef4444';
                    submitBtn.style.opacity = '1';
                    
                    // Reset button to original state after 3.5 seconds
                    setTimeout(() => {
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.style.background = '';
                        submitBtn.style.borderColor = '';
                        submitBtn.style.pointerEvents = 'all';
                    }, 3500);
                });
        });
    }
});

// =========================================
// PORTFOLIO TAB FILTERING & GSAP DROPDOWN
// =========================================
document.addEventListener("DOMContentLoaded", () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const filterDropdownToggle = document.querySelector('.filter-dropdown-toggle');
    const filterContainer = document.querySelector('.portfolio-filters');
    const currentFilterText = document.querySelector('.current-filter');

    let dropdownOpen = false;
    let mm = gsap.matchMedia();

    // Handle Mobile Dropdown Toggle
    if (filterDropdownToggle && filterContainer) {
        
        // Only apply these GSAP rules on screens 992px and smaller
        mm.add("(max-width: 992px)", () => {
            // Initial State: Snap it closed
            gsap.set(filterContainer, { autoAlpha: 0, y: -15, scaleY: 0.95, transformOrigin: "top center" });

            filterDropdownToggle.addEventListener('click', toggleDropdown);

            return () => {
                // Cleanup instantly if the user resizes back to a desktop monitor
                filterDropdownToggle.removeEventListener('click', toggleDropdown);
                gsap.set(filterContainer, { clearProps: "all" }); 
                dropdownOpen = false;
                filterDropdownToggle.classList.remove('open');
            };
        });

        function toggleDropdown(e) {
            e.stopPropagation();
            
            // FIX: Check if closed, then open it. If opened, pass to closeFilterDropdown.
            if (!dropdownOpen) {
                dropdownOpen = true; 
                filterDropdownToggle.classList.add('open');
                
                // Morphing Box Reveal
                gsap.to(filterContainer, {
                    autoAlpha: 1,
                    y: 0,
                    scaleY: 1,
                    duration: 0.5,
                    ease: "back.out(1.5)"
                });
                
                // Staggered Button Text Fade-In
                gsap.fromTo(filterBtns, 
                    { opacity: 0, x: -10 }, 
                    { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: "power2.out", delay: 0.1, overwrite: true }
                );
            } else {
                closeFilterDropdown();
            }
        }

        // Close if the user clicks anywhere outside the menu
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 992 && dropdownOpen && !filterContainer.contains(e.target) && !filterDropdownToggle.contains(e.target)) {
                closeFilterDropdown();
            }
        });
    }

    function closeFilterDropdown() {
        if(!dropdownOpen || window.innerWidth > 992) return;
        
        dropdownOpen = false; // FIX: State is correctly flipped here now
        if(filterDropdownToggle) filterDropdownToggle.classList.remove('open');
        
        gsap.to(filterContainer, {
            autoAlpha: 0,
            y: -10,
            scaleY: 0.95,
            duration: 0.3,
            ease: "power2.in"
        });
    }

    // Existing Grid Filter Logic (Works perfectly for both Desktop & Mobile)
    if (filterBtns.length > 0 && portfolioItems.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                
                // 1. Manage Active State
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // 2. Update Mobile Dropdown Text securely
                if (currentFilterText) {
                    currentFilterText.textContent = btn.textContent;
                }

                // 3. Trigger close animation for mobile
                closeFilterDropdown();

                // 4. Get the filter category
                const filterValue = btn.getAttribute('data-filter');

                // 5. Loop through grid items
                portfolioItems.forEach(item => {
                    const itemCategories = item.getAttribute('data-category').split(' '); 
                    
                    if (filterValue === 'all' || itemCategories.includes(filterValue)) {
                        item.classList.remove('hide-item');
                        void item.offsetWidth; // Force a reflow
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.95)';
                        
                        setTimeout(() => {
                            if (!item.style.opacity || item.style.opacity === '0') {
                                item.classList.add('hide-item');
                            }
                        }, 400); 
                    }
                });

                // 6. Refresh GSAP ScrollTrigger so the grid stays locked in
                setTimeout(() => {
                    if (typeof ScrollTrigger !== 'undefined') {
                        ScrollTrigger.refresh();
                    }
                }, 450);
            });
        });
    }
});