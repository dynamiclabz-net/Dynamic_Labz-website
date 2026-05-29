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
function openCaseStudy(id) {
    const overlay = document.getElementById(id);
    if(overlay) {
        // Slide it up smoothly
        gsap.to(overlay, { y: "0%", duration: 0.8, ease: "power4.out" });
        
        // 1. Pause Lenis smooth scrolling
        if (typeof lenis !== 'undefined') lenis.stop(); 
        
        // 2. Absolute lock for native browser scrolling
        document.body.style.overflow = "hidden"; 
    }
}

function closeCaseStudy(id) {
    const overlay = document.getElementById(id);
    if(overlay) {
        // Slide it back down
        gsap.to(overlay, { y: "100%", duration: 0.6, ease: "power3.in" });
        
        // 1. Restart Lenis smooth scrolling
        if (typeof lenis !== 'undefined') lenis.start(); 
        
        // 2. Remove the absolute lock
        document.body.style.overflow = ""; 
    }
}

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