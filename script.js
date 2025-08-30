document.addEventListener('DOMContentLoaded', () => {
    // --- Splash Screen
    const splashScreen = document.querySelector('.splash-screen');
    if (splashScreen) {
        document.body.classList.add('no-scroll');
        setTimeout(() => {
            splashScreen.classList.add('fade-out');
            document.body.classList.remove('no-scroll');
        }, 3500);
    }

    // --- Menu Mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuClose = document.querySelector('.menu-close');

    if (menuToggle && mobileMenu && menuClose) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('open');
            document.body.classList.add('no-scroll');
        });

        menuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            document.body.classList.remove('no-scroll');
        });

        // Fechar menu ao clicar em um link
        document.querySelectorAll('.mobile-nav a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                document.body.classList.remove('no-scroll');
            });
        });

        // Fechar menu ao clicar fora dele
        document.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                mobileMenu.classList.remove('open');
                document.body.classList.remove('no-scroll');
            }
        });

        // Impedir que o clique dentro do menu o feche
        mobileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // --- Funcionalidade FAQ
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });

    // --- Suavização do Scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const headerOffset = document.querySelector('header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Proteção contra cópia (opcional, pode ser removido se não for um requisito estrito)
    // document.body.oncontextmenu = () => false;
    // document.body.onselectstart = () => false;
    // document.body.ondragstart = () => false;

    // --- Google Tag Manager Event Tracking
    document.querySelectorAll('[data-event]').forEach(element => {
        element.addEventListener('click', (e) => {
            const eventName = e.currentTarget.getAttribute('data-event');
            if (window.dataLayer) {
                window.dataLayer.push({
                    'event': 'user_action',
                    'action_category': 'CTA_Click',
                    'action_label': eventName
                });
                console.log('Evento enviado para GTM:', eventName);
            }
        });
    });

    // --- FGTS Simulator Modal
    const simulatorModal = document.getElementById('fgts-simulator');
    const simulatorClose = document.querySelector('.simulator-close');
    const simulatorTriggers = document.querySelectorAll('[data-event*="Simulator"], [data-event*="CTA_Simulator"]');
    const fgtsBalanceInput = document.getElementById('fgts-balance');
    const balanceValueSpan = document.getElementById('balance-value');
    const installmentsSelect = document.getElementById('installments');
    const estimatedAmountDiv = document.getElementById('estimated-amount');
    const continueWhatsappBtn = document.getElementById('continue-whatsapp');

    const updateSimulator = () => {
        const balance = parseInt(fgtsBalanceInput.value);
        const installments = parseInt(installmentsSelect.value);
        // Simple estimation logic, can be refined
        const estimated = Math.floor(balance * (0.8 + (installments * 0.01))); // Example calculation

        balanceValueSpan.textContent = `R$ ${balance.toLocaleString('pt-BR')}`;
        estimatedAmountDiv.textContent = `R$ ${estimated.toLocaleString('pt-BR')}`;
    };

    if (simulatorModal) {
        simulatorTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                simulatorModal.classList.add('open');
                document.body.classList.add('no-scroll');
                updateSimulator(); // Initial update
            });
        });

        simulatorClose.addEventListener('click', () => {
            simulatorModal.classList.remove('open');
            document.body.classList.remove('no-scroll');
        });

        fgtsBalanceInput.addEventListener('input', updateSimulator);
        installmentsSelect.addEventListener('change', updateSimulator);

        continueWhatsappBtn.addEventListener('click', () => {
            const balance = parseInt(fgtsBalanceInput.value);
            const installments = parseInt(installmentsSelect.value);
            const estimated = estimatedAmountDiv.textContent;
            const whatsappMessage = `Olá! Gostaria de simular minha antecipação do FGTS. Saldo aproximado: R$ ${balance.toLocaleString('pt-BR')}, ${installments} parcelas. Valor estimado: ${estimated}.`;
            window.open(`https://wa.me/5511978311920?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
            simulatorModal.classList.remove('open');
            document.body.classList.remove('no-scroll');
        });
    }

    // --- Dynamic WhatsApp Messages (based on data-whatsapp-message attribute)
    document.querySelectorAll('[data-whatsapp-message]').forEach(element => {
        element.addEventListener('click', (e) => {
            const customMessage = e.currentTarget.getAttribute('data-whatsapp-message');
            if (customMessage) {
                const whatsappUrl = `https://wa.me/5511978311920?text=${encodeURIComponent(customMessage)}`;
                window.open(whatsappUrl, '_blank');
                e.preventDefault(); // Prevent default link behavior if it's an <a> tag
            }
        });
    });

    // --- Video Tutorial Playback
    const videoPlaceholder = document.getElementById('video-placeholder');
    const youtubeVideo = document.getElementById('youtube-video');
    const youtubeVideoId = 'imKR9uWGZn0'; // Extracted from https://youtu.be/imKR9uWGZn0?si=-6ERtuIh4nJ9UIoE

    if (videoPlaceholder && youtubeVideo) {
        videoPlaceholder.addEventListener('click', () => {
            youtubeVideo.src = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1`;
            youtubeVideo.style.display = 'block';
            videoPlaceholder.classList.add('hidden');
        });
    }

    // --- Hero Section Amount Animation
    const heroAmount = document.getElementById('hero-amount');
    if (heroAmount) {
        let currentAmount = 1000;
        const targetAmount = 8500;
        const duration = 2000; // 2 seconds
        const start = performance.now();

        const animateAmount = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const animatedValue = currentAmount + (targetAmount - currentAmount) * progress;
            heroAmount.textContent = Math.floor(animatedValue).toLocaleString('pt-BR');

            if (progress < 1) {
                requestAnimationFrame(animateAmount);
            }
        };
        requestAnimationFrame(animateAmount);
    }
});


