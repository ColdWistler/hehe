// Custom easing functions
const easing = {
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    easeOutElastic: (t) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    easeOutBounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },
    easeOutBack: (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
};

// Horizontal Smooth Scroll Controller
class HorizontalSmoothScrollController {
    constructor() {
        this.panels = document.querySelectorAll('.panel');
        this.navDots = document.querySelectorAll('.nav-dot');
        this.progressBar = document.querySelector('.progress-bar');
        this.scrollContainer = document.querySelector('.horizontal-scroll-container');
        this.currentPanel = 0;
        this.totalPanels = 4;
        this.isScrolling = false;
        this.roseSystem = null;
        
        this.init();
    }
    
    init() {
        this.setupScrollAnimations();
        this.setupNavigation();
        this.setupProgressBar();
        this.setupHorizontalScrolling();
        this.setupIntersectionObserver();
        
        // Initialize rose system
        this.initRoseSystem();
        
        // Trigger initial animations for hero panel
        setTimeout(() => {
            this.triggerPanelAnimations(0);
        }, 500);
    }
    
    initRoseSystem() {
        if (window.roseSystem) {
            this.roseSystem = window.roseSystem;
            return;
        }
        
        // Simple rose particle system for horizontal scroll
        this.roseSystem = {
            createParticle: (x, y) => {
                const rose = document.createElement('div');
                rose.innerHTML = '🌹';
                rose.style.cssText = `
                    position: fixed;
                    font-size: ${Math.random() * 20 + 10}px;
                    left: ${x}px;
                    top: ${y}px;
                    pointer-events: none;
                    z-index: 999;
                    animation: roseFloat 4s ease-out forwards;
                `;
                document.body.appendChild(rose);
                
                setTimeout(() => rose.remove(), 4000);
            }
        };
        
        // Add rose float animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes roseFloat {
                0% {
                    opacity: 1;
                    transform: translateY(0) rotate(0deg);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-100px) rotate(360deg);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    setupScrollAnimations() {
        // Initial state setup
        this.panels.forEach((panel, index) => {
            panel.style.opacity = '0';
        });
        
        // Show first panel
        this.panels[0].style.opacity = '1';
    }
    
    setupNavigation() {
        this.navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.scrollToPanel(index);
            });
        });
    }
    
    setupProgressBar() {
        window.addEventListener('scroll', () => {
            this.updateProgressBar();
        });
        
        // Since we're using horizontal scrolling, update on container transform
        this.observeScrollPosition();
    }
    
    observeScrollPosition() {
        let lastTransform = 0;
        setInterval(() => {
            const transform = window.getComputedStyle(this.scrollContainer).transform;
            if (transform !== lastTransform) {
                lastTransform = transform;
                this.updateProgressBar();
            }
        }, 100);
    }
    
    setupHorizontalScrolling() {
        let isScrolling = false;
        
        // Horizontal mouse wheel scrolling
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            if (isScrolling) return;
            
            isScrolling = true;
            setTimeout(() => {
                isScrolling = false;
            }, 1500);
            
            if (e.deltaY > 0) {
                this.nextPanel();
            } else {
                this.prevPanel();
            }
            
            // Create occasional roses on scroll
            if (Math.random() > 0.9 && this.roseSystem) {
                this.roseSystem.createParticle(
                    Math.random() * window.innerWidth,
                    window.innerHeight - 100
                );
            }
        }, { passive: false });
        
        // Touch/swipe support for mobile
        this.setupTouchSupport();
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') this.nextPanel();
            if (e.key === 'ArrowLeft') this.prevPanel();
        });
    }
    
    setupTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.scrollContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        
        this.scrollContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }
    
    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextPanel();
            } else {
                this.prevPanel();
            }
        }
    }
    
    setupIntersectionObserver() {
        // For horizontal scrolling, we'll manually track panels
        this.updatePanelTracking();
    }
    
    updatePanelTracking() {
        setInterval(() => {
            const transform = window.getComputedStyle(this.scrollContainer).transform;
            if (transform !== 'none') {
                const matrix = new DOMMatrix(transform);
                const translateX = matrix.m41;
                const panelWidth = window.innerWidth;
                const currentPanelIndex = Math.round(Math.abs(translateX) / panelWidth);
                
                if (currentPanelIndex !== this.currentPanel && currentPanelIndex >= 0 && currentPanelIndex < this.totalPanels) {
                    this.currentPanel = currentPanelIndex;
                    this.triggerPanelAnimations(currentPanelIndex);
                    this.updateActiveDot(currentPanelIndex);
                }
            }
        }, 100);
    }
    
    scrollToPanel(panelIndex) {
        if (panelIndex < 0 || panelIndex >= this.totalPanels) return;
        
        this.currentPanel = panelIndex;
        this.updateScrollPosition();
        
        // Create rose burst at target
        if (this.roseSystem) {
            setTimeout(() => {
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        this.roseSystem.createParticle(
                            (panelIndex + 1) * window.innerWidth / 2 + (Math.random() - 0.5) * 200,
                            window.innerHeight / 2
                        );
                    }, i * 100);
                }
            }, 800);
        }
    }
    
    nextPanel() {
        if (this.currentPanel < this.totalPanels - 1) {
            this.currentPanel++;
            this.updateScrollPosition();
        }
    }
    
    prevPanel() {
        if (this.currentPanel > 0) {
            this.currentPanel--;
            this.updateScrollPosition();
        }
    }
    
    updateScrollPosition() {
        const translateX = -this.currentPanel * 100;
        this.scrollContainer.style.transform = `translateX(${translateX}vw)`;
        this.updateProgressBar();
        this.updateActiveDot(this.currentPanel);
    }
    
    triggerPanelAnimations(panelIndex) {
        const panel = this.panels[panelIndex];
        if (!panel) return;
        
        // Make current panel visible
        panel.style.opacity = '1';
        
        // Reset all panels' animations
        this.panels.forEach((p, index) => {
            if (index !== panelIndex) {
                p.style.opacity = '0';
                const elements = p.querySelectorAll(`
                    .title, .subtitle, .flower-emoji, .scroll-hint,
                    h2, .album-subtitle, .pixel-flower, .sparkle, .album-hint,
                    .game-subtitle, .game-hint, .heart, .final-roses
                `);
                elements.forEach(el => {
                    el.classList.remove('visible');
                });
            }
        });
        
        // Get all animatable elements in current panel
        const animatableElements = panel.querySelectorAll(`
            .title, .subtitle, .flower-emoji, .scroll-hint,
            h2, .album-subtitle, .pixel-flower, .sparkle, .album-hint,
            .game-subtitle, .game-hint, .heart, .final-roses
        `);
        
        // Trigger animations with cute delays
        animatableElements.forEach((element, index) => {
            if (!element.classList.contains('visible')) {
                setTimeout(() => {
                    element.classList.add('visible');
                    
                    // Add extra rose bursts for special elements
                    if (element.classList.contains('flower-emoji') && this.roseSystem) {
                        this.createRoseBurst(element);
                    } else if (element.classList.contains('heart') && this.roseSystem) {
                        this.createRoseBurst(element, 8);
                    }
                }, index * 150);
            }
        });
        
        // Special rose showers for certain panels
        if (this.roseSystem) {
            if (panelIndex === 0) { // Hero panel
                setTimeout(() => {
                    this.createRoseShower(3);
                }, 1500);
            } else if (panelIndex === 3) { // Final message panel
                setTimeout(() => {
                    this.createRoseShower(8);
                }, 1000);
            }
        }
    }
    
    createRoseBurst(element, count = 5) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.roseSystem.createParticle(
                    centerX + (Math.random() - 0.5) * 100,
                    centerY + (Math.random() - 0.5) * 100
                );
            }, i * 100);
        }
    }
    
    createRoseShower(count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.roseSystem.createParticle(
                    Math.random() * window.innerWidth,
                    window.innerHeight - 50
                );
            }, i * 300);
        }
    }
    
    updateActiveDot(activeIndex) {
        this.navDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }
    
    updateProgressBar() {
        const progress = (this.currentPanel / (this.totalPanels - 1)) * 100;
        this.progressBar.style.width = `${progress}%`;
    }
}

// Simple Rose Particle System
class SimpleRoseParticleSystem {
    constructor() {
        this.particles = [];
        this.init();
    }
    
    init() {
        this.addMouseTrailEffect();
    }
    
    addMouseTrailEffect() {
        let mouseTimer;
        document.addEventListener('mousemove', (e) => {
            clearTimeout(mouseTimer);
            mouseTimer = setTimeout(() => {
                if (Math.random() > 0.95) {
                    this.createParticle(e.clientX, e.clientY);
                }
            }, 100);
        });
    }
    
    createParticle(x, y) {
        const rose = document.createElement('div');
        rose.innerHTML = Math.random() > 0.5 ? '🌹' : '🌸';
        rose.style.cssText = `
            position: fixed;
            font-size: ${Math.random() * 15 + 8}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 998;
            animation: petalFloat 4s ease-out forwards;
        `;
        document.body.appendChild(rose);
        
        setTimeout(() => rose.remove(), 4000);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const horizontalScrollController = new HorizontalSmoothScrollController();
    const simpleRoseSystem = new SimpleRoseParticleSystem();
    
    // Star Wars intro handling
    const starWarsIntro = document.querySelector('.star-wars-intro');
    if (starWarsIntro) {
        const skipIntro = () => {
            starWarsIntro.classList.add('hidden');
            setTimeout(() => {
                starWarsIntro.style.display = 'none';
            }, 1000);
            
            // Trigger hero panel animations after intro
            setTimeout(() => {
                horizontalScrollController.triggerPanelAnimations(0);
            }, 500);
        };
        
        // Allow clicking to skip the intro
        starWarsIntro.addEventListener('click', skipIntro);
        
        // Auto-skip after animation completes
        setTimeout(skipIntro, 40000);
    } else {
        // Trigger initial animations for hero panel if no intro
        setTimeout(() => {
            horizontalScrollController.triggerPanelAnimations(0);
        }, 500);
    }
    
    // Initialize the heart catching game
    initHeartGame();
    
    // Add click interactions
    setupClickInteractions();
    
    // Add Konami code easter egg
    setupKonamiCode();
    
    // Make controller globally accessible for other scripts
    window.horizontalScrollController = horizontalScrollController;
    
    // Initialize 3D Particles
    init3DParticles();
});

// 3D Particle System
function init3DParticles() {
    const canvas = document.getElementById('particles3d');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    const particles = [];
    const particleCount = 150;
    const colors = ['#ff9ecd', '#b8f0e8', '#e8d5f2', '#6b4c9a', '#fff1e6'];
    
    class Particle3D {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = (Math.random() - 0.5) * width * 2;
            this.y = (Math.random() - 0.5) * height * 2;
            this.z = Math.random() * 1000;
            this.pz = this.z;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.size = Math.random() * 3 + 1;
            this.speed = Math.random() * 2 + 1;
        }
        
        update() {
            this.z -= this.speed;
            
            if (this.z < 1) {
                this.reset();
                this.z = 1000;
                this.pz = this.z;
            }
        }
        
        draw() {
            const sx = (this.x / this.z) * 500 + width / 2;
            const sy = (this.y / this.z) * 500 + height / 2;
            
            const size = (1 - this.z / 1000) * this.size * 4;
            
            if (sx > 0 && sx < width && sy > 0 && sy < height) {
                const alpha = 1 - this.z / 1000;
                ctx.beginPath();
                ctx.arc(sx, sy, size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = alpha * 0.8;
                ctx.fill();
                
                // Add glow effect
                ctx.beginPath();
                ctx.arc(sx, sy, size * 2, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = alpha * 0.3;
                ctx.fill();
            }
            
            // Draw trail
            const px = (this.x / this.pz) * 500 + width / 2;
            const py = (this.y / this.pz) * 500 + height / 2;
            
            if (px > 0 && px < width && py > 0 && py < height) {
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(sx, sy);
                ctx.strokeStyle = this.color;
                ctx.globalAlpha = (1 - this.z / 1000) * 0.3;
                ctx.lineWidth = size * 0.5;
                ctx.stroke();
            }
            
            this.pz = this.z;
        }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle3D());
    }
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Sort by z for proper depth
        particles.sort((a, b) => b.z - a.z);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });
    
    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - width / 2) * 0.5;
        mouseY = (e.clientY - height / 2) * 0.5;
        
        particles.forEach(p => {
            p.x += mouseX * 0.01;
            p.y += mouseY * 0.01;
        });
    });
}

function setupClickInteractions() {
    // Photo item interactions - show jokes
    const photoItems = document.querySelectorAll('.photo-item');
    photoItems.forEach(item => {
        item.addEventListener('click', function() {
            const joke = this.getAttribute('data-joke');
            showPhotoJoke(this, joke);
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = 'bounce 0.5s ease';
            }, 10);
        });
    });
    
    // Meme item interactions
    const memeItems = document.querySelectorAll('.meme-item');
    const nerdyMessages = [
        "This is a reference to a GitHub issue you'd never understand",
        "It's about CSS flexbox behavior in Safari", 
        "Something something React hooks",
        "A joke about semicolons in JavaScript"
    ];
    
    memeItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            showMemeTooltip(index, nerdyMessages[index]);
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = 'bounce 0.5s ease';
            }, 10);
        });
    });
    
    // Click anywhere for rose burst
    document.addEventListener('click', (e) => {
        if (e.target.closest('.photo-item') || e.target.closest('.meme-item') || 
            e.target.closest('.nav-dot')) {
            return;
        }
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const rose = document.createElement('div');
                rose.innerHTML = '🌹';
                rose.style.cssText = `
                    position: fixed;
                    font-size: ${Math.random() * 20 + 10}px;
                    left: ${e.clientX + (Math.random() - 0.5) * 50}px;
                    top: ${e.clientY + (Math.random() - 0.5) * 50}px;
                    pointer-events: none;
                    z-index: 999;
                    animation: roseFloat 2s ease-out forwards;
                `;
                document.body.appendChild(rose);
                setTimeout(() => rose.remove(), 2000);
            }, i * 50);
        }
    });
}

function createFloatingHeart(element) {
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.style.cssText = `
        position: fixed;
        font-size: 2rem;
        pointer-events: none;
        z-index: 1000;
        animation: floatUp 3s ease-out forwards;
    `;
    
    const rect = element.getBoundingClientRect();
    heart.style.left = rect.left + rect.width / 2 + 'px';
    heart.style.top = rect.top + 'px';
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
        heart.remove();
    }, 3000);
}

function showMemeTooltip(index, message) {
    // Remove existing tooltips
    const existingTooltips = document.querySelectorAll('.nerdy-tooltip');
    existingTooltips.forEach(tooltip => tooltip.remove());
    
    const tooltip = document.createElement('div');
    tooltip.className = 'nerdy-tooltip';
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: fixed;
        background: var(--mantle);
        color: var(--text);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        border: 1px solid var(--surface0);
        font-size: 0.9rem;
        z-index: 1001;
        max-width: 280px;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
        pointer-events: none;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const memeItems = document.querySelectorAll('.meme-item');
    const rect = memeItems[index].getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 - 140 + 'px';
    tooltip.style.top = rect.top - 80 + 'px';
    
    // Animate in
    setTimeout(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(10px)';
        setTimeout(() => tooltip.remove(), 300);
    }, 3000);
}

function showPhotoJoke(element, joke) {
    const existingPopups = document.querySelectorAll('.photo-joke-popup');
    existingPopups.forEach(popup => popup.remove());
    
    const popup = document.createElement('div');
    popup.className = 'photo-joke-popup';
    popup.innerHTML = `
        <div class="joke-header">🤓 You are not nerdy enough to understand</div>
        <div class="joke-text">${joke}</div>
    `;
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(145deg, #1a1a2e, #16162a);
        color: var(--text);
        padding: 2rem 2.5rem;
        border-radius: 16px;
        border: 2px solid var(--blue);
        font-size: 1rem;
        z-index: 2000;
        max-width: 350px;
        text-align: center;
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: 0 0 40px rgba(138, 180, 248, 0.4), 0 20px 60px rgba(0, 0, 0, 0.5);
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.style.opacity = '1';
        popup.style.transform = 'translate(-50%, -50%) scale(1.05)';
    }, 10);
    
    setTimeout(() => {
        popup.style.opacity = '0';
        popup.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => popup.remove(), 300);
    }, 3500);
}

function setupKonamiCode() {
    let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateNerdyMode();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
}

function activateNerdyMode() {
    // Rainbow effect
    const colors = ['#e78284', '#ef9f76', '#e5c890', '#a6d189', '#81c8be', '#8caaee', '#ca9ee6'];
    let colorIndex = 0;
    
    const rainbowInterval = setInterval(() => {
        document.body.style.filter = `hue-rotate(${colorIndex * 30}deg)`;
        colorIndex = (colorIndex + 1) % colors.length;
    }, 200);
    
    // Massive rose shower during nerd mode
    const roseInterval = setInterval(() => {
        const rose = document.createElement('div');
        rose.innerHTML = '🌹';
        rose.style.cssText = `
            position: fixed;
            font-size: ${Math.random() * 25 + 15}px;
            left: ${Math.random() * window.innerWidth}px;
            top: ${window.innerHeight}px;
            pointer-events: none;
            z-index: 2000;
            animation: rainbowRoseRise 2s linear forwards;
        `;
        document.body.appendChild(rose);
        setTimeout(() => rose.remove(), 2000);
    }, 100);
    
    setTimeout(() => {
        clearInterval(rainbowInterval);
        clearInterval(roseInterval);
        document.body.style.filter = 'none';
    }, 3000);
    
    // Show achievement
    const achievement = document.createElement('div');
    achievement.innerHTML = `
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏆</div>
        <div>NERD MODE UNLOCKED!</div>
        <div style="font-size: 0.8rem; margin-top: 0.5rem;">+100 nerd points</div>
    `;
    achievement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--green);
        color: var(--base);
        padding: 2rem;
        border-radius: 16px;
        font-weight: 600;
        z-index: 2001;
        text-align: center;
        animation: achievementPop 0.5s ease;
    `;
    
    document.body.appendChild(achievement);
    setTimeout(() => achievement.remove(), 3000);
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes achievementPop {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.2); }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes rainbowRoseRise {
            0% { opacity: 1; transform: translateY(0) rotate(0deg); }
            100% { opacity: 0; transform: translateY(-100vh) rotate(720deg); }
        }
        @keyframes petalFloat {
            0% { opacity: 0.8; transform: translateY(0) translateX(0) rotate(0deg); }
            100% { opacity: 0; transform: translateY(-100px) translateX(50px) rotate(180deg); }
        }
    `;
    document.head.appendChild(style);
}

// Heart Catching Game
function initHeartGame() {
    const gameContainer = document.querySelector('.game-container');
    const basket = document.querySelector('.basket');
    const startBtn = document.querySelector('.start-btn');
    const scoreDisplay = document.querySelector('.score');
    const heartsContainer = document.querySelector('.hearts-container');
    
    if (!gameContainer || !basket || !startBtn) return;
    
    let score = 0;
    let gameRunning = false;
    let basketX = 50;
    let vegetables = [];
    let vegetableSpawnInterval;
    const vegetablesArray = ['👆', '🥬', '🌶️', '🥕', '🌽'];
    
    function updateBasketPosition() {
        basket.style.left = basketX + '%';
        basket.style.transform = 'translateX(-50%)';
    }
    
    function spawnVegetable() {
        if (!gameRunning) return;
        
        const vegetable = document.createElement('div');
        vegetable.className = 'falling-vegetable';
        vegetable.textContent = vegetablesArray[Math.floor(Math.random() * vegetablesArray.length)];
        vegetable.style.left = Math.random() * 85 + 5 + '%';
        vegetable.style.animationDuration = (2.5 + Math.random() * 1) + 's';
        
        heartsContainer.appendChild(vegetable);
        
        const vegetableObj = {
            element: vegetable,
            x: parseFloat(vegetable.style.left),
            caught: false
        };
        vegetables.push(vegetableObj);
        
        setTimeout(() => {
            if (vegetable.parentNode && !vegetableObj.caught) {
                vegetable.remove();
                vegetables = vegetables.filter(v => v !== vegetableObj);
            }
        }, 3500);
    }
    
    function checkCollisions() {
        const basketRect = basket.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();
        
        vegetables.forEach(vegetableObj => {
            if (vegetableObj.caught) return;
            
            const vegetableRect = vegetableObj.element.getBoundingClientRect();
            
            if (vegetableRect.bottom >= basketRect.top && 
                vegetableRect.top <= basketRect.bottom &&
                vegetableRect.right >= basketRect.left && 
                vegetableRect.left <= basketRect.right) {
                
                vegetableObj.caught = true;
                vegetableObj.element.remove();
                vegetables = vegetables.filter(v => v !== vegetableObj);
                
                score += 1;
                scoreDisplay.textContent = score;
                
                // Visual feedback
                basket.style.transform = 'translateX(-50%) scale(1.2)';
                setTimeout(() => {
                    basket.style.transform = 'translateX(-50%) scale(1)';
                }, 100);
            }
        });
    }
    
    function gameLoop() {
        if (!gameRunning) return;
        checkCollisions();
        gameInterval = requestAnimationFrame(gameLoop);
    }
    
    function startGame() {
        if (gameRunning) return;
         
        score = 0;
        scoreDisplay.textContent = '0';
        vegetables.forEach(v => v.element.remove());
        vegetables = [];
        
        const existingMessage = gameContainer.querySelector('.game-message');
        if (existingMessage) existingMessage.remove();
        
        gameRunning = true;
        startBtn.textContent = 'PLAYING...';
        startBtn.disabled = true;
        
        vegetableSpawnInterval = setInterval(spawnVegetable, 800);
        gameLoop();
        
        setTimeout(() => {
            if (gameRunning) {
                clearInterval(vegetableSpawnInterval);
                gameRunning = false;
                cancelAnimationFrame(gameInterval);
                
                const message = document.createElement('div');
                message.className = 'game-message';
                message.innerHTML = `GAME OVER!<br>Score: ${score}`;
                gameContainer.appendChild(message);
                
                startBtn.textContent = 'PLAY AGAIN';
                startBtn.disabled = false;
            }
        }, 30000);
    }
    
    // Mouse control
    gameContainer.addEventListener('mousemove', (e) => {
        if (!gameRunning) return;
        
        const rect = gameContainer.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        basketX = Math.max(5, Math.min(90, x));
        updateBasketPosition();
    });
    
    // Touch control
    gameContainer.addEventListener('touchmove', (e) => {
        if (!gameRunning) return;
        
        const rect = gameContainer.getBoundingClientRect();
        const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
        basketX = Math.max(5, Math.min(90, x));
        updateBasketPosition();
    });
    
    // Keyboard control
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            basketX = Math.max(5, basketX - 5);
            updateBasketPosition();
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            basketX = Math.min(90, basketX + 5);
            updateBasketPosition();
        }
    });
    
    startBtn.addEventListener('click', startGame);
    updateBasketPosition();
}