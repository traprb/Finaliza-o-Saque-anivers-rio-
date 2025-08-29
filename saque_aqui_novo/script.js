// ===== MAIN APPLICATION =====
class SaqueAquiApp {
    constructor() {
        this.startTime = Date.now();
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeComponents();
        this.setupAnalytics();
    }

    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupMobileMenu();
            this.setupSmoothScrolling();
            this.setupFAQ();
            this.setupSimulator();
            this.setupScrollEffects();
            this.setupSmartWhatsApp();
        });
    }

    initializeComponents() {
        // Initialize all components after DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.componentsReady();
            });
        } else {
            this.componentsReady();
        }
    }

    componentsReady() {
        console.log('Saque Aqui App initialized');
    }

    // ===== MOBILE MENU =====
    setupMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        const menuClose = document.querySelector('.menu-close');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-list a');

        if (!menuToggle || !mobileMenu) return;

        // Open menu
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.trackEvent('Mobile_Menu_Open');
        });

        // Close menu
        const closeMenu = () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (menuClose) {
            menuClose.addEventListener('click', closeMenu);
        }

        // Close menu when clicking on links
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu when clicking outside
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                closeMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    // ===== SMOOTH SCROLLING =====
    setupSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Track navigation
                    this.trackEvent('Navigation_Click', {
                        target: href,
                        source: link.closest('.nav-list') ? 'desktop' : 'mobile'
                    });
                }
            });
        });
    }

    // ===== FAQ ACCORDION =====
    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            if (question) {
                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    
                    // Close all other items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });

                    // Toggle current item
                    item.classList.toggle('active');

                    // Track FAQ interaction
                    this.trackEvent('FAQ_Click', {
                        question: question.textContent.trim(),
                        action: isActive ? 'close' : 'open'
                    });
                });
            }
        });
    }

    // ===== FGTS SIMULATOR =====
    setupSimulator() {
        const balanceSlider = document.getElementById('fgts-balance');
        const balanceDisplay = document.getElementById('balance-display');
        const installmentsSelect = document.getElementById('installments');
        const estimatedValue = document.getElementById('estimated-value');
        const continueButton = document.getElementById('continue-whatsapp');

        if (!balanceSlider || !balanceDisplay || !installmentsSelect || !estimatedValue) {
            return;
        }

        const updateSimulation = () => {
            const balance = parseInt(balanceSlider.value);
            const installments = parseInt(installmentsSelect.value);
            
            // Format balance display
            balanceDisplay.textContent = this.formatCurrency(balance);
            
            // Calculate estimated value (simplified calculation)
            const rate = 0.85; // 85% of the balance
            const installmentFactor = installments / 10; // Factor based on installments
            const estimated = Math.floor(balance * rate * installmentFactor);
            
            estimatedValue.textContent = this.formatCurrency(estimated);

            // Store values for WhatsApp message
            this.simulatorData = {
                balance: balance,
                installments: installments,
                estimated: estimated
            };
        };

        // Event listeners
        balanceSlider.addEventListener('input', updateSimulation);
        installmentsSelect.addEventListener('change', updateSimulation);

        // WhatsApp button
        if (continueButton) {
            continueButton.addEventListener('click', () => {
                this.openWhatsAppWithSimulation();
            });
        }

        // Initial calculation
        updateSimulation();

        // Track simulator usage
        let simulatorUsed = false;
        balanceSlider.addEventListener('input', () => {
            if (!simulatorUsed) {
                this.trackEvent('Simulator_Used');
                simulatorUsed = true;
            }
        });
    }

    // ===== WHATSAPP INTEGRATION =====
    openWhatsAppWithSimulation() {
        const baseURL = 'https://wa.me/5511978311920';
        let message = 'Olá! Gostaria de simular minha antecipação do FGTS.';

        if (this.simulatorData) {
            const { balance, installments, estimated } = this.simulatorData;
            message = `Olá! Fiz uma simulação no site:
            
📊 Saldo FGTS: ${this.formatCurrency(balance)}
📅 Parcelas: ${installments}
💰 Valor estimado: ${this.formatCurrency(estimated)}

Gostaria de prosseguir com a antecipação!`;
        }

        const url = `${baseURL}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');

        this.trackEvent('WhatsApp_Click', {
            source: 'simulator',
            hasSimulation: !!this.simulatorData
        });
    }

    // ===== SMART WHATSAPP BUTTON =====
    setupSmartWhatsApp() {
        const whatsappButtons = document.querySelectorAll('[href*="wa.me"], [onclick*="whatsapp"], .btn-whatsapp');
        
        whatsappButtons.forEach(button => {
            // Add engagement tracking
            let engagementScore = 0;
            let lastInteraction = 0;
            
            // Track user engagement
            const trackEngagement = () => {
                const now = Date.now();
                if (now - lastInteraction > 5000) { // 5 seconds between interactions
                    engagementScore++;
                }
                lastInteraction = now;
            };

            // Track scroll depth when button becomes visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        trackEngagement();
                        this.trackEvent('WhatsApp_Button_Visible', {
                            buttonLocation: this.getButtonLocation(button)
                        });
                    }
                });
            });

            observer.observe(button);

            // Add hover delay for desktop
            let hoverTimeout;
            button.addEventListener('mouseenter', () => {
                trackEngagement();
                hoverTimeout = setTimeout(() => {
                    button.classList.add('engaged');
                }, 1000); // 1 second hover delay
            });

            button.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimeout);
                button.classList.remove('engaged');
            });

            // Smart click handler
            button.addEventListener('click', (e) => {
                const timeOnPage = Date.now() - this.startTime;
                const hasScrolled = window.scrollY > 200;
                const hasEngagement = engagementScore > 0 || timeOnPage > 30000; // 30 seconds

                // Prevent accidental clicks
                if (!hasEngagement && !hasScrolled && timeOnPage < 10000) { // Less than 10 seconds
                    e.preventDefault();
                    this.showEngagementPrompt(button);
                    this.trackEvent('WhatsApp_Click_Prevented', {
                        timeOnPage: timeOnPage,
                        engagementScore: engagementScore,
                        hasScrolled: hasScrolled
                    });
                    return;
                }

                // Track qualified click
                this.trackEvent('WhatsApp_Click_Qualified', {
                    timeOnPage: timeOnPage,
                    engagementScore: engagementScore,
                    hasScrolled: hasScrolled,
                    buttonLocation: this.getButtonLocation(button)
                });
            });
        });
    }

    showEngagementPrompt(button) {
        // Create a subtle prompt instead of blocking
        const prompt = document.createElement('div');
        prompt.className = 'engagement-prompt';
        prompt.innerHTML = `
            <div class="prompt-content">
                <p>👋 Que tal conhecer melhor nossos serviços antes de entrar em contato?</p>
                <div class="prompt-actions">
                    <button class="btn-prompt-continue">Continuar mesmo assim</button>
                    <button class="btn-prompt-explore">Explorar mais</button>
                </div>
            </div>
        `;

        // Style the prompt
        prompt.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            max-width: 400px;
            text-align: center;
            border: 1px solid var(--gray-200);
        `;

        document.body.appendChild(prompt);

        // Handle prompt actions
        prompt.querySelector('.btn-prompt-continue').addEventListener('click', () => {
            document.body.removeChild(prompt);
            button.click();
        });

        prompt.querySelector('.btn-prompt-explore').addEventListener('click', () => {
            document.body.removeChild(prompt);
            document.querySelector('#vantagens').scrollIntoView({ behavior: 'smooth' });
        });

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (document.body.contains(prompt)) {
                document.body.removeChild(prompt);
            }
        }, 10000);
    }

    getButtonLocation(button) {
        if (button.closest('.hero')) return 'hero';
        if (button.closest('.simulator')) return 'simulator';
        if (button.closest('.final-cta')) return 'final-cta';
        if (button.closest('.whatsapp-float')) return 'floating';
        return 'other';
    }

    // ===== SCROLL EFFECTS =====
    setupScrollEffects() {
        // Header scroll effect
        const header = document.querySelector('.header');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            if (header) {
                if (currentScrollY > 100) {
                    header.style.background = 'rgba(255, 255, 255, 0.98)';
                    header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
                } else {
                    header.style.background = 'rgba(255, 255, 255, 0.95)';
                    header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }
            }

            lastScrollY = currentScrollY;
        });

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.advantage-card, .step, .faq-item');
        animateElements.forEach(el => observer.observe(el));
    }

    // ===== ANALYTICS & TRACKING =====
    setupAnalytics() {
        // Track page load
        this.trackEvent('Page_Load', {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
        });

        // Track CTA clicks
        document.querySelectorAll('[data-event]').forEach(element => {
            element.addEventListener('click', (e) => {
                const eventName = e.currentTarget.getAttribute('data-event');
                this.trackEvent(eventName, {
                    element: e.currentTarget.tagName,
                    text: e.currentTarget.textContent.trim().substring(0, 50)
                });
            });
        });

        // Track scroll depth
        this.setupScrollDepthTracking();

        // Track time on page
        this.startTimeTracking();
    }

    trackEvent(eventName, data = {}) {
        // Google Tag Manager
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'custom_event',
                event_name: eventName,
                event_data: data
            });
        }

        // Console log for debugging
        console.log('Event tracked:', eventName, data);
    }

    setupScrollDepthTracking() {
        const depths = [25, 50, 75, 90];
        const tracked = new Set();

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            depths.forEach(depth => {
                if (scrollPercent >= depth && !tracked.has(depth)) {
                    tracked.add(depth);
                    this.trackEvent('Scroll_Depth', { depth: `${depth}%` });
                }
            });
        });
    }

    startTimeTracking() {
        const startTime = Date.now();
        
        // Track time on page when user leaves
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            this.trackEvent('Time_On_Page', { seconds: timeSpent });
        });

        // Track engagement milestones
        const milestones = [30, 60, 120, 300]; // seconds
        milestones.forEach(milestone => {
            setTimeout(() => {
                this.trackEvent('Engagement_Milestone', { seconds: milestone });
            }, milestone * 1000);
        });
    }

    // ===== UTILITY FUNCTIONS =====
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// ===== PERFORMANCE OPTIMIZATIONS =====
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.preloadCriticalResources();
        this.optimizeScrollPerformance();
    }

    lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    preloadCriticalResources() {
        // Preload hero image
        const heroImg = document.querySelector('.hero-image img');
        if (heroImg && heroImg.src) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = heroImg.src;
            document.head.appendChild(link);
        }
    }

    optimizeScrollPerformance() {
        // Use passive event listeners for scroll
        const scrollHandler = this.throttle(() => {
            // Scroll handling logic
        }, 16); // ~60fps

        window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
class AccessibilityEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupAriaLabels();
        this.setupFocusManagement();
    }

    setupKeyboardNavigation() {
        // Handle Enter/Space for custom buttons
        document.querySelectorAll('.faq-question').forEach(button => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    }

    setupAriaLabels() {
        // Add aria-expanded to FAQ questions
        document.querySelectorAll('.faq-question').forEach(question => {
            const faqItem = question.closest('.faq-item');
            question.setAttribute('aria-expanded', faqItem.classList.contains('active'));
            
            // Update on click
            question.addEventListener('click', () => {
                setTimeout(() => {
                    question.setAttribute('aria-expanded', faqItem.classList.contains('active'));
                }, 100);
            });
        });
    }

    setupFocusManagement() {
        // Trap focus in mobile menu
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            const focusableElements = mobileMenu.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            mobileMenu.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && mobileMenu.classList.contains('active')) {
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        }
    }
}

// ===== INITIALIZE APPLICATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main application
    window.saqueAquiApp = new SaqueAquiApp();
    
    // Initialize performance optimizations
    new PerformanceOptimizer();
    
    // Initialize accessibility enhancements
    new AccessibilityEnhancer();
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    
    // Track errors for debugging
    if (window.saqueAquiApp) {
        window.saqueAquiApp.trackEvent('JavaScript_Error', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno
        });
    }
});

// ===== SERVICE WORKER REGISTRATION (Optional) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

