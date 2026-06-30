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

    // 5. Client Testimonial Carousel (removed since we transitioned to CSS-only infinite marquee)

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

    // 10. Animated counter for metrics
    const metricSection = document.getElementById('metricas');
    if (metricSection) {
        const counters = metricSection.querySelectorAll('.metric-number');
        const countSpeed = 200; // Velociadad del contador (más bajo = más rápido)
        
        const startCounting = (counter) => {
            const target = +counter.getAttribute('data-target');
            const suffix = counter.getAttribute('data-suffix') || '';
            let count = 0;
            
            const updateCount = () => {
                const increment = target / countSpeed;
                if (count < target) {
                    count = Math.min(target, count + Math.ceil(increment));
                    counter.innerText = count + suffix;
                    setTimeout(updateCount, 10);
                } else {
                    counter.innerText = target + suffix;
                }
            };
            
            updateCount();
        };

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counters.forEach(counter => startCounting(counter));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        counterObserver.observe(metricSection);
    }

    // 11. Netlify Forms Fast Contact Form Submission
    const fastForm = document.getElementById('fast-contact-form');
    const fastStatus = document.getElementById('fast-form-status');

    if (fastForm) {
        fastForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const submitBtn = fastForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Enviando... <i class="fa-solid fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(fastForm);
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                });

                if (response.ok) {
                    fastForm.reset();
                    fastStatus.textContent = '¡Consulta enviada con éxito! Le responderemos a la brevedad.';
                    fastStatus.style.backgroundColor = '#d4edda';
                    fastStatus.style.color = '#155724';
                    fastStatus.style.display = 'block';
                } else {
                    fastStatus.textContent = 'Hubo un problema al enviar su consulta. Intente nuevamente.';
                    fastStatus.style.backgroundColor = '#f8d7da';
                    fastStatus.style.color = '#721c24';
                    fastStatus.style.display = 'block';
                }
            } catch (error) {
                fastStatus.textContent = 'Hubo un problema de conexión al enviar su consulta.';
                fastStatus.style.backgroundColor = '#f8d7da';
                fastStatus.style.color = '#721c24';
                fastStatus.style.display = 'block';
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                setTimeout(() => {
                    fastStatus.style.display = 'none';
                }, 5000);
            }
        });
    }

    // 12. Floating WhatsApp Widget Bubble
    const wspWidget = document.getElementById('wsp-widget');
    const wspBubble = document.getElementById('wsp-bubble');
    const wspCloseBubble = document.getElementById('wsp-close-bubble');

    if (wspWidget && wspBubble) {
        // Auto-show bubble after 4 seconds unless it was already closed in this session
        if (!sessionStorage.getItem('wspBubbleClosed')) {
            setTimeout(() => {
                wspBubble.classList.add('show');
            }, 4000);
        }

        if (wspCloseBubble) {
            wspCloseBubble.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                wspBubble.classList.remove('show');
                sessionStorage.setItem('wspBubbleClosed', 'true');
            });
        }
    }

    // 13. Smart Quote Calculator Logic
    const serviceSelect = document.getElementById('instalacion');
    const surfaceInput = document.getElementById('superficie');
    const calcPlaceholder = document.getElementById('calc-placeholder');
    const calcResults = document.getElementById('calc-results');
    const valEquipo = document.getElementById('calc-val-equipo');
    const valTiempo = document.getElementById('calc-val-tiempo');
    const valMaquinaria = document.getElementById('calc-val-maquinaria');

    if (serviceSelect && surfaceInput) {
        const updateCalculator = () => {
            const service = serviceSelect.value;
            const surface = parseFloat(surfaceInput.value);

            if (!service || !surface || isNaN(surface) || surface <= 0) {
                calcResults.style.display = 'none';
                calcPlaceholder.style.display = 'block';
                return;
            }

            // Hide placeholder and show results
            calcPlaceholder.style.display = 'none';
            calcResults.style.display = 'block';

            let equipo = '';
            let tiempo = '';
            let maquinaria = '';

            // Estimaciones basadas en estándares técnicos
            if (service === 'industrial') {
                const operarios = Math.max(2, Math.ceil(surface / 400));
                equipo = `${operarios} Operarios Técnicos + 1 Supervisor`;
                const horas = Math.max(4, Math.ceil(surface / 150));
                tiempo = `${horas} horas estimadas`;
                maquinaria = surface > 800 ? 'Fregadora de hombre a bordo + Hidrolavadora trifásica' : 'Fregadora operador a pie + Aspiradora industrial de polvo/líquido';
            } else if (service === 'oficinas') {
                const auxiliar = Math.max(1, Math.ceil(surface / 300));
                equipo = `${auxiliar} Auxiliar de Aseo`;
                tiempo = surface > 600 ? 'Servicio diario continuo' : 'Jornada parcial (3-4 horas/día)';
                maquinaria = 'Carro de aseo profesional + Aspiradora HEPA silenciosa';
            } else if (service === 'fin-de-obra') {
                const operarios = Math.max(3, Math.ceil(surface / 150));
                equipo = `${operarios} Operarios Especializados + 1 Supervisor Directo`;
                const horas = Math.max(6, Math.ceil(surface / 80));
                tiempo = `${horas} horas (Jornada intensiva)`;
                maquinaria = 'Aspiradora industrial HEPA + Fregadora mecánica Taski Ergodisc + Hidrolavadora de alta presión';
            } else if (service === 'alfombras') {
                const operarios = Math.max(1, Math.ceil(surface / 200));
                equipo = `${operarios} Técnico en Tratamiento de Pisos`;
                const horas = Math.max(3, Math.ceil(surface / 80));
                tiempo = `${horas} horas de faena`;
                maquinaria = 'Lava-alfombras por inyección/extracción + Secadores industriales de alta velocidad';
            } else if (service === 'fachadas') {
                const operarios = Math.max(2, Math.ceil(surface / 300));
                equipo = `${operarios} Operarios Especialistas en Altura (Certificados)`;
                const horas = Math.max(4, Math.ceil(surface / 100));
                tiempo = `${horas} horas estimadas`;
                maquinaria = 'Andamios certificados / Canastillo de elevación + Limpiacristales telescópicos y agua pura';
            } else if (service === 'recintos') {
                const operarios = Math.max(2, Math.ceil(surface / 500));
                equipo = `${operarios} Operarios Multidisciplinarios`;
                tiempo = 'Planes mensuales programados (Seguimiento continuo)';
                maquinaria = 'Equipamiento menor de mantenimiento + Pulidora de pisos Taski';
            } else {
                equipo = 'A convenir según inspección';
                tiempo = 'Evaluación técnica en terreno';
                maquinaria = 'Equipamiento técnico a definir';
            }

            valEquipo.textContent = equipo;
            valTiempo.textContent = tiempo;
            valMaquinaria.textContent = maquinaria;
        };

        // Escuchar cambios
        serviceSelect.addEventListener('change', updateCalculator);
        surfaceInput.addEventListener('input', updateCalculator);

        // Ejecutar inicialmente si ya viene pre-seleccionado
        setTimeout(updateCalculator, 200);
    }

});
