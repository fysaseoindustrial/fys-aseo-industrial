document.addEventListener('DOMContentLoaded', () => {
    // 1. Smart Sticky Navbar
    let lastScroll = 0;
    const navbar = document.getElementById('navbar');
    const navLinks = document.getElementById('nav-links');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const SCROLL_THRESHOLD = 10;

    const updateMobileMenuTop = () => {
        if (!navbar || !navLinks) return;
        if (window.innerWidth <= 768) {
            const rect = navbar.getBoundingClientRect();
            const topOffset = Math.max(0, rect.bottom);
            navLinks.style.top = `${topOffset}px`;
            navLinks.style.height = `calc(100dvh - ${topOffset}px)`;
        } else {
            navLinks.style.top = '';
            navLinks.style.height = '';
        }
    };

    window.addEventListener('scroll', () => {
        // Prevent hiding navbar on scroll when mobile menu is open
        if (navLinks && navLinks.classList.contains('active')) {
            updateMobileMenuTop();
            return;
        }
        
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

    window.addEventListener('resize', updateMobileMenuTop, { passive: true });

    // 2. Mobile Menu Toggle
    if (menuBtn && navLinks) {
        const navItems = navLinks.querySelectorAll('a:not(.dropdown-toggle)');

        menuBtn.addEventListener('click', () => {
            updateMobileMenuTop();
            navLinks.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
                document.body.style.overflow = 'hidden';
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
                document.body.style.overflow = '';
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
                    document.body.style.overflow = '';
                }
            });
        });
    }

    // 3. Scroll Animations (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.12
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
                    formStatus.textContent = '¡Solicitud enviada con éxito! Un supervisor técnico se pondrá en contacto en menos de 2 horas hábiles.';
                    formStatus.style.backgroundColor = '#d4edda';
                    formStatus.style.color = '#155724';
                    formStatus.style.display = 'block';
                } else {
                    formStatus.textContent = 'Hubo un problema al enviar tu consulta. Inténtalo de nuevo o escríbenos por WhatsApp.';
                    formStatus.style.backgroundColor = '#f8d7da';
                    formStatus.style.color = '#721c24';
                    formStatus.style.display = 'block';
                }
            } catch (error) {
                formStatus.textContent = 'Hubo un problema de conexión. Puedes enviarnos tu requerimiento directo por WhatsApp.';
                formStatus.style.backgroundColor = '#f8d7da';
                formStatus.style.color = '#721c24';
                formStatus.style.display = 'block';
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 6000);
            }
        });
    }

    // 5. Parallax Suave (Desktop only to keep mobile 60fps fluid)
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (window.innerWidth <= 768) return; // Evita saltos en Safari iOS y Android
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

    // 6. Active Menu Tracking
    const sectionsElements = document.querySelectorAll('section[id], header[id]');
    const navLinksArray = document.querySelectorAll('.nav-links a[href^="#"]');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinksArray.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, { threshold: 0.2, rootMargin: "-10% 0px -50% 0px" });

    sectionsElements.forEach(s => sectionObserver.observe(s));

    // 7. Animated counter for metrics
    const metricSection = document.getElementById('metricas');
    if (metricSection) {
        const counters = metricSection.querySelectorAll('.metric-number');
        const countSpeed = 200;
        
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

    // 8. Netlify Forms Fast Contact Form Submission
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
                    fastStatus.textContent = '¡Consulta enviada con éxito! Le responderemos en menos de 2 horas hábiles.';
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

    // 9. Floating WhatsApp Widget Bubble
    const wspWidget = document.getElementById('wsp-widget');
    const wspBubble = document.getElementById('wsp-bubble');
    const wspCloseBubble = document.getElementById('wsp-close-bubble');

    if (wspWidget && wspBubble) {
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

    // 10. Smart Quote Calculator Logic + URL Pre-fill + Direct WhatsApp Quote
    const serviceSelect = document.getElementById('instalacion');
    const surfaceInput = document.getElementById('superficie');
    const surfaceRangeSelect = document.getElementById('rango-superficie');
    const manualContainer = document.getElementById('contenedor-superficie-manual');
    const empresaInput = document.getElementById('empresa');
    const calcPlaceholder = document.getElementById('calc-placeholder');
    const calcResults = document.getElementById('calc-results');
    const valEquipo = document.getElementById('calc-val-equipo');
    const valTiempo = document.getElementById('calc-val-tiempo');
    const valMaquinaria = document.getElementById('calc-val-maquinaria');
    const calcWspBtn = document.getElementById('calc-wsp-btn');
    const hiddenEquipo = document.getElementById('hidden-calc-equipo');
    const hiddenTiempo = document.getElementById('hidden-calc-tiempo');
    const hiddenMaquinaria = document.getElementById('hidden-calc-maquinaria');

    const serviceNamesMap = {
        'industrial': 'Aseo Industrial de Plantas y Bodegas',
        'alfombras': 'Lavado Industrial de Pisos y Alfombras',
        'fachadas': 'Limpieza de Vidrios y Fachadas en Altura',
        'fin-de-obra': 'Aseo Técnico de Fin de Obra',
        'oficinas': 'Limpieza Corporativa de Oficinas',
        'recintos': 'Mantención Integral de Recintos',
        'otro': 'Servicio Especializado de Aseo'
    };

    const updateCalculator = () => {
        if (!serviceSelect) return;
        const service = serviceSelect.value;
        let surface = 0;

        if (surfaceRangeSelect) {
            const rangeVal = surfaceRangeSelect.value;
            if (rangeVal === 'manual') {
                surface = parseFloat(surfaceInput ? surfaceInput.value : 0);
            } else if (rangeVal) {
                surface = parseFloat(rangeVal);
                if (surfaceInput) surfaceInput.value = rangeVal;
            }
        } else if (surfaceInput) {
            surface = parseFloat(surfaceInput.value);
        }

        if (!service || !surface || isNaN(surface) || surface <= 0) {
            if (calcResults) calcResults.style.display = 'none';
            if (calcPlaceholder) calcPlaceholder.style.display = 'block';
            return;
        }

        if (calcPlaceholder) calcPlaceholder.style.display = 'none';
        if (calcResults) calcResults.style.display = 'block';

        let equipo = '';
        let tiempo = '';
        let maquinaria = '';

        if (service === 'industrial') {
            const operarios = Math.max(2, Math.ceil(surface / 400));
            equipo = `${operarios} Operarios Técnicos + 1 Supervisor en Terreno`;
            const horas = Math.max(4, Math.ceil(surface / 150));
            tiempo = `${horas} horas estimadas`;
            maquinaria = surface > 800 ? 'Fregadora de hombre a bordo + Hidrolavadora industrial' : 'Fregadora industrial + Aspiradora de polvo/líquido';
        } else if (service === 'oficinas') {
            const auxiliar = Math.max(1, Math.ceil(surface / 300));
            equipo = `${auxiliar} Especialista(s) de Higiene Corporativa`;
            tiempo = surface > 600 ? 'Plan continuo programado' : 'Jornada técnica (3-4 horas/día)';
            maquinaria = 'Estación de aseo profesional + Aspiración con filtro HEPA';
        } else if (service === 'fin-de-obra') {
            const operarios = Math.max(3, Math.ceil(surface / 150));
            equipo = `${operarios} Operarios Especializados + 1 Supervisor Directo`;
            const horas = Math.max(6, Math.ceil(surface / 80));
            tiempo = `${horas} horas (Entrega garantizada)`;
            maquinaria = 'Aspiración industrial HEPA + Rotativa Taski Ergodisc 165 + Hidrolavadora';
        } else if (service === 'alfombras') {
            const operarios = Math.max(1, Math.ceil(surface / 200));
            equipo = `${operarios} Técnico(s) en Tratamiento de Superficies`;
            const horas = Math.max(3, Math.ceil(surface / 80));
            tiempo = `${horas} horas de faena`;
            maquinaria = 'Inyección-extracción industrial + Rotativa Taski Ergodisc 165';
        } else if (service === 'fachadas') {
            equipo = '2 Técnicos Especialistas en Altura + 1 Supervisor de Seguridad';
            const horas = Math.max(4, Math.ceil(surface / 60));
            tiempo = `${horas} horas estimadas`;
            maquinaria = 'Sistema telescópico / Hidrolavado de presión regulada + EPP de altura certificado';
        } else if (service === 'recintos') {
            const operarios = Math.max(2, Math.ceil(surface / 350));
            equipo = `${operarios} Operarios de Mantención Preventiva`;
            tiempo = 'Plan mensual / semanal a medida';
            maquinaria = 'Fregadora automática de pisos + Equipo de sanitización integral';
        } else {
            equipo = 'Evaluación en Visita Técnica sin costo';
            tiempo = 'A definir según inspección en terreno';
            maquinaria = 'Equipamiento industrial Taski adaptado al recinto';
        }

        if (valEquipo) valEquipo.textContent = equipo;
        if (valTiempo) valTiempo.textContent = tiempo;
        if (valMaquinaria) valMaquinaria.textContent = maquinaria;

        if (hiddenEquipo) hiddenEquipo.value = equipo;
        if (hiddenTiempo) hiddenTiempo.value = tiempo;
        if (hiddenMaquinaria) hiddenMaquinaria.value = maquinaria;

        if (calcWspBtn) {
            const nombreEmpresa = (empresaInput && empresaInput.value.trim()) ? ` de la empresa *${empresaInput.value.trim()}*` : '';
            const nombreServicio = serviceNamesMap[service] || service;
            const msg = `Hola F&S Aseo Industrial, soy${nombreEmpresa}. Realicé una estimación en su web para *${nombreServicio}* en una superficie de *${surface} m²* (Dotación estimada: ${equipo}). Me gustaría agendar una Visita Técnica o recibir cotización formal.`;
            calcWspBtn.href = `https://wa.me/56984203721?text=${encodeURIComponent(msg)}`;
        }
    };

    // Manejador del selector desplegable de rangos de m²
    if (surfaceRangeSelect) {
        surfaceRangeSelect.addEventListener('change', () => {
            if (surfaceRangeSelect.value === 'manual') {
                if (manualContainer) manualContainer.style.display = 'block';
                if (surfaceInput) {
                    surfaceInput.required = true;
                    surfaceInput.value = '';
                    surfaceInput.focus();
                }
            } else {
                if (manualContainer) manualContainer.style.display = 'none';
                if (surfaceInput) {
                    surfaceInput.required = false;
                    surfaceInput.value = surfaceRangeSelect.value;
                }
            }
            updateCalculator();
        });
    }

    // URL Parameter Pre-fill for Cotización
    const urlParams = new URLSearchParams(window.location.search);
    const servicioParam = urlParams.get('servicio');
    
    if (servicioParam && serviceSelect) {
        const optionExists = Array.from(serviceSelect.options).some(opt => opt.value === servicioParam);
        if (optionExists) {
            serviceSelect.value = servicioParam;
            serviceSelect.style.border = '2px solid var(--color-accent)';
            serviceSelect.style.backgroundColor = 'rgba(0, 180, 216, 0.05)';
            serviceSelect.style.transition = 'all 0.3s ease';
            
            const label = document.querySelector('label[for="instalacion"]');
            if (label && !label.querySelector('.fa-circle-check')) {
                label.innerHTML += ' <i class="fa-solid fa-circle-check" style="color: var(--color-accent); margin-left: 4px;" title="Servicio pre-seleccionado"></i>';
            }
            updateCalculator();
        }
    }

    if (serviceSelect) {
        serviceSelect.addEventListener('change', updateCalculator);
    }
    if (surfaceInput) {
        surfaceInput.addEventListener('input', updateCalculator);
    }
    if (empresaInput) {
        empresaInput.addEventListener('input', updateCalculator);
    }

    // 11. FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        if (questionBtn) {
            questionBtn.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');
                faqItems.forEach(other => other.classList.remove('active'));
                if (!isOpen) {
                    item.classList.add('active');
                }
            });
        }
    });
});
