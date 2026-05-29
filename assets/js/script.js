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
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
    }
    
    // THE HYPERSPACE DRAW FUNCTION
    draw() {
        ctx.beginPath();
        
        // Calculate the stretch based on scroll speed
        let stretchY = scrollVelocity * 0.8; 
        
        if (Math.abs(stretchY) > 1) {
            // WARP SPEED: Draw a stretched line (Motion Blur)
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y - stretchY);
            ctx.lineWidth = this.size * 2;
            ctx.strokeStyle = 'rgba(118, 31, 227, 0.8)';
            ctx.lineCap = "round";
            ctx.stroke();
        } else {
            // NORMAL: Draw a standard circular node
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
    let numParticles = (width * height) / 9000;
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
            
            if (distance < 100) {
                ctx.beginPath();
                
                // Fade out connecting lines during warp speed to emphasize vertical stretching
                let speedFactor = Math.abs(scrollVelocity) / 30;
                let lineOpacity = Math.max(0, (1 - distance/100) - speedFactor);
                
                ctx.strokeStyle = `rgba(118, 31, 227, ${lineOpacity})`;
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
    el.addEventListener('mouseenter', () => gsap.to(cursorRing, { width: 50, height: 50, backgroundColor: 'rgba(118, 31, 227, 0.4)' }));
    el.addEventListener('mouseleave', () => gsap.to(cursorRing, { width: 20, height: 20, backgroundColor: '#761fe3' }));
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
// 5. 3D MAGNETIC BENTO BOXES (Add this exactly at the end)
// --------------------------------------------------------
VanillaTilt.init(document.querySelectorAll(".portfolio-card"), {
    max: 8,              // Maximum tilt rotation (degrees)
    speed: 400,          // Speed of the enter/exit transition
    glare: true,         // Enables the glass glare effect
    "max-glare": 0.15,   // Maximum opacity of the glare (0 to 1)
    scale: 1.02          // Slight pop-out effect on hover
});