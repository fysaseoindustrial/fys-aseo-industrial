document.addEventListener('DOMContentLoaded', () => {
    // 1. Smart Sticky Navbar
    let lastScroll = 0;
    const navbar = document.getElementById('navbar');
    const SCROLL_THRESHOLD = 10;

    window.addEventListener('scroll', () => {
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

    // 5. Client Review Modal
    const modal = document.getElementById('review-modal');
    const modalCompanyName = document.getElementById('modal-company-name');
    const modalCompanyReview = document.getElementById('modal-company-review');
    const closeModal = document.querySelector('.close-modal');
    const clientLogos = document.querySelectorAll('.client-logo-wrapper');

    if (modal && clientLogos.length > 0) {
        clientLogos.forEach(logo => {
            logo.addEventListener('click', () => {
                const company = logo.getAttribute('data-company');
                const review = logo.getAttribute('data-review');
                
                modalCompanyName.textContent = company;
                modalCompanyReview.textContent = `"${review}"`;
                
                modal.classList.add('show');
            });
        });

        // Close modal when clicking X
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modal.classList.remove('show');
            });
        }

        // Close modal when clicking outside of it
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.classList.remove('show');
            }
        });
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

});
