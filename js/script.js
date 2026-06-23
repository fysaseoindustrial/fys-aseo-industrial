document.addEventListener('DOMContentLoaded', () => {
    // 1. Smart Sticky Navbar
    let lastScroll = 0;
    const navbar = document.getElementById('navbar');
    const SCROLL_THRESHOLD = 10;

    window.addEventListener('scroll', () => {
        // Prevent hiding navbar on scroll when mobile menu is open
        if (navLinks && navLinks.classList.contains('active')) return;
        
        const currentScroll = window.scrollY;
        
        if (currentScroll < 50) {
            navbar.classList.remove('hidden', 'scrolled');
            return;
        }
        
        navbar.classList.add('scrolled');
        
        if (Math.abs(currentScroll - lastScroll) < SCROLL_THRESHOLD) return;
        
        if (currentScroll > lastScroll) {
            navbar.classList.add('hidden');    // Scrolling DOWN — esconder
        } else {
            navbar.classList.remove('hidden'); // Scrolling UP — mostrar
        }
        
        lastScroll = currentScroll;
    }, { passive: true });

    // 2. Mobile Menu Toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    const navItems = navLinks.querySelectorAll('a:not(.dropdown-toggle)');

    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when clicking a link
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    });

    // 3. Scroll Animations (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // 4. Netlify Forms Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Enviando... <i class="fa-solid fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(contactForm);
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                });

                if (response.ok) {
                    contactForm.reset();
                    formStatus.textContent = '¡Mensaje enviado con éxito! Nos pondremos en contacto bajo nuestros estándares de servicio 2026.';
                    formStatus.style.backgroundColor = '#d4edda';
                    formStatus.style.color = '#155724';
                    formStatus.style.display = 'block';
                } else {
                    formStatus.textContent = 'Hubo un problema al enviar tu consulta. Inténtalo de nuevo.';
                    formStatus.style.backgroundColor = '#f8d7da';
                    formStatus.style.color = '#721c24';
                    formStatus.style.display = 'block';
                }
            } catch (error) {
                formStatus.textContent = 'Hubo un problema de conexión al enviar tu consulta.';
                formStatus.style.backgroundColor = '#f8d7da';
                formStatus.style.color = '#721c24';
                formStatus.style.display = 'block';
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Hide status message after 5 seconds
                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 5000);
            }
        });
    }

    // 5. Client Testimonial Carousel
    class ClientSlider {
        constructor(container) {
            this.container = container;
            this.track = container.querySelector('.slider-track');
            this.slides = container.querySelectorAll('.slide');
            this.dotsContainer = container.querySelector('.dots');
            this.prevBtn = container.querySelector('.prev');
            this.nextBtn = container.querySelector('.next');
            this.current = 0;
            this.total = this.slides.length;
            
            // Touch state
            this.startX = 0;
            this.currentX = 0;
            this.isDragging = false;
            this.threshold = 50; // px threshold for swipe
            
            this.init();
        }
        
        init() {
            if (this.total === 0) return;
            
            // Create navigation dots
            this.createDots();
            
            // Touch events for mobile swipe
            this.track.addEventListener('touchstart', e => this.onTouchStart(e), { passive: true });
            this.track.addEventListener('touchmove', e => this.onTouchMove(e), { passive: false });
            this.track.addEventListener('touchend', e => this.onTouchEnd(e));
            
            // Mouse drag for desktop dragging
            this.track.addEventListener('mousedown', e => this.onMouseDown(e));
            window.addEventListener('mousemove', e => this.onMouseMove(e));
            window.addEventListener('mouseup', e => this.onMouseUp(e));
            
            // Button controls
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => this.prev());
            }
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => this.next());
            }
            
            // Keyboard accessibility
            this.container.addEventListener('keydown', e => {
                if (e.key === 'ArrowLeft') this.prev();
                if (e.key === 'ArrowRight') this.next();
            });
            
            // Initial render
            this.go(0, false);
        }
        
        createDots() {
            if (!this.dotsContainer) return;
            this.dotsContainer.innerHTML = '';
            for (let i = 0; i < this.total; i++) {
                const dot = document.createElement('button');
                dot.className = 'dot';
                dot.setAttribute('aria-label', `Ir al cliente ${i + 1}`);
                dot.addEventListener('click', () => this.go(i));
                this.dotsContainer.appendChild(dot);
            }
        }
        
        onTouchStart(e) {
            this.startX = e.touches[0].clientX;
            this.isDragging = true;
            this.track.style.transition = 'none';
        }
        
        onTouchMove(e) {
            if (!this.isDragging) return;
            this.currentX = e.touches[0].clientX;
            const diff = this.currentX - this.startX;
            const base = -this.current * 100;
            
            // Resistance at borders
            const resistance = (this.current === 0 && diff > 0) || 
                               (this.current === this.total - 1 && diff < 0) 
                               ? 0.3 : 1;
                               
            this.track.style.transform = `translateX(calc(${base}% + ${diff * resistance}px))`;
            
            // Prevent vertical scroll if swipe is horizontal
            if (Math.abs(diff) > 10) {
                e.preventDefault();
            }
        }
        
        onTouchEnd(e) {
            if (!this.isDragging) return;
            this.isDragging = false;
            const diff = this.currentX - this.startX;
            
            if (diff < -this.threshold) this.next();
            else if (diff > this.threshold) this.prev();
            else this.go(this.current);
        }
        
        onMouseDown(e) {
            if (e.button !== 0) return;
            if (e.target.closest('a')) return;
            
            this.startX = e.clientX;
            this.currentX = e.clientX;
            this.isDragging = true;
            this.track.style.transition = 'none';
            this.track.style.cursor = 'grabbing';
            e.preventDefault();
        }
        
        onMouseMove(e) {
            if (!this.isDragging) return;
            this.currentX = e.clientX;
            const diff = this.currentX - this.startX;
            const base = -this.current * 100;
            
            // Resistance at borders
            const resistance = (this.current === 0 && diff > 0) || 
                               (this.current === this.total - 1 && diff < 0) 
                               ? 0.3 : 1;
                               
            this.track.style.transform = `translateX(calc(${base}% + ${diff * resistance}px))`;
        }
        
        onMouseUp(e) {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.track.style.cursor = '';
            const diff = this.currentX - this.startX;
            
            if (diff < -this.threshold) this.next();
            else if (diff > this.threshold) this.prev();
            else this.go(this.current);
        }
        
        go(index, animate = true) {
            this.current = Math.max(0, Math.min(index, this.total - 1));
            
            if (animate) {
                this.track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            } else {
                this.track.style.transition = 'none';
            }
            
            this.track.style.transform = `translateX(-${this.current * 100}%)`;
            this.updateDots();
            this.updateArrows();
        }
        
        next() { this.go(this.current + 1); }
        prev() { this.go(this.current - 1); }
        
        updateDots() {
            const dots = this.dotsContainer ? this.dotsContainer.querySelectorAll('.dot') : [];
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === this.current);
            });
        }
        
        updateArrows() {
            if (this.prevBtn) this.prevBtn.disabled = this.current === 0;
            if (this.nextBtn) this.nextBtn.disabled = this.current === this.total - 1;
        }
    }

    // Initialize client carousel
    const clientSliderElement = document.getElementById('client-slider');
    if (clientSliderElement) {
        new ClientSlider(clientSliderElement);
    }

    // 6. Parallax Suave
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                parallaxElements.forEach(el => {
                    const speed = parseFloat(el.dataset.parallax) || 0.5;
                    const scrolled = window.scrollY;
                    el.style.transform = `translateY(${scrolled * speed}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // 7. Active Menu Tracking
    const sectionsElements = document.querySelectorAll('section[id], header[id]');
    const navLinksArray = document.querySelectorAll('.nav-links a[href^="#"]');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinksArray.forEach(link => {
                    if(link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, { threshold: 0.2, rootMargin: "-10% 0px -50% 0px" });

    sectionsElements.forEach(s => sectionObserver.observe(s));

    // 8. URL Parameter Pre-fill for Cotización
    const urlParams = new URLSearchParams(window.location.search);
    const servicioParam = urlParams.get('servicio');
    
    if (servicioParam) {
        const instalacionSelect = document.getElementById('instalacion');
        if (instalacionSelect) {
            // Check if the option exists
            const optionExists = Array.from(instalacionSelect.options).some(opt => opt.value === servicioParam);
            if (optionExists) {
                instalacionSelect.value = servicioParam;
                // Visual cue
                instalacionSelect.style.border = '2px solid var(--color-accent)';
                instalacionSelect.style.backgroundColor = 'rgba(0, 180, 216, 0.05)';
                instalacionSelect.style.transition = 'all 0.3s ease';
                
                // Add a small check icon to the label if it exists
                const label = document.querySelector('label[for="instalacion"]');
                if (label) {
                    label.innerHTML += ' <i class="fa-solid fa-circle-check" style="color: var(--color-accent); margin-left: 4px;" title="Servicio pre-seleccionado"></i>';
                }
            }
        }
    }

    // 9. Cookie Consent Banner (Dynamic Injection)
    const initCookieBanner = () => {
        if (localStorage.getItem('cookieConsent') === 'accepted') {
            return;
        }

        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <p>Utilizamos cookies propias y de terceros para mejorar su experiencia de navegación y analizar nuestro tráfico. Al hacer clic en "Aceptar", consiente el uso de todas las cookies.</p>
                <div class="cookie-banner-buttons">
                    <button class="btn btn-primary btn-cookie-accept" id="cookie-accept">Aceptar</button>
                    <button class="btn btn-cookie-decline" id="cookie-decline">Rechazar</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Fade in after a small delay
        setTimeout(() => {
            banner.classList.add('show');
        }, 1000);

        document.getElementById('cookie-accept').addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 400);
        });

        document.getElementById('cookie-decline').addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'declined');
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 400);
        });
    };

    initCookieBanner();

});
