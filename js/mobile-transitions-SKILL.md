---
name: mobile-transitions
description: >
  Skill especializada en animaciones de entrada/salida, transiciones entre secciones, comportamiento de slides y micro-interacciones para páginas web en móvil y desktop. Úsala SIEMPRE que el usuario mencione: slides, secciones que se mueven, animaciones al hacer scroll, transiciones entre páginas, carruseles, efectos al entrar o salir de una sección, parallax, scroll suave, swipe en móvil, o cualquier comportamiento de movimiento en una interfaz web. También aplica cuando el usuario diga que algo "no se mueve bien", "se ve brusco", "no anima", "el slide no funciona en celular" o quiere que la página "se sienta como una app".
---

# Mobile Transitions & Animations Skill

Skill para implementar transiciones, animaciones de sección y comportamiento de slides de nivel profesional — con foco en que la experiencia se sienta nativa en móvil y fluida en desktop.

---

## Filosofía de un desarrollador senior

Antes de escribir una línea de CSS/JS, pensar:

1. **¿Qué está pasando perceptualmente?** El usuario debe saber dónde está, de dónde vino y hacia dónde va.
2. **¿Es performante?** Solo animar `transform` y `opacity`. NUNCA `width`, `height`, `top`, `left`, `margin` — causan reflow y lag.
3. **¿Funciona en iOS Safari?** El browser más restrictivo del mundo. Si funciona ahí, funciona en todos.
4. **¿Respeta `prefers-reduced-motion`?** Accesibilidad es obligatoria, no opcional.

---

## Reglas de oro para animaciones performantes

```css
/* CORRECTO — solo GPU compositing */
transform: translateX(100%);
transform: translateY(-20px);
transform: scale(0.95);
opacity: 0;

/* INCORRECTO — causa reflow del navegador */
left: 100%;
top: -20px;
width: 0;
margin-left: 20px;
```

**Siempre usar:**
```css
will-change: transform, opacity; /* Solo en elementos que VAN a animar */
backface-visibility: hidden;     /* Previene flickering en iOS */
-webkit-backface-visibility: hidden;
transform: translateZ(0);        /* Fuerza capa GPU en Safari */
```

---

## Patrón 1 — Scroll Reveal (entrada al hacer scroll)

Usado para: secciones que aparecen al bajar la página (como logos de clientes, servicios, etc.)

```javascript
// Intersection Observer — el estándar de la industria
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Si no necesita re-animar al salir:
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15,      // Se activa cuando el 15% del elemento es visible
  rootMargin: '0px 0px -50px 0px'  // Margen negativo inferior — evita animación prematura
});

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  observer.observe(el);
});
```

```css
.animate-on-scroll {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger: cada hijo anima con delay progresivo */
.animate-on-scroll:nth-child(1) { transition-delay: 0ms; }
.animate-on-scroll:nth-child(2) { transition-delay: 80ms; }
.animate-on-scroll:nth-child(3) { transition-delay: 160ms; }
.animate-on-scroll:nth-child(4) { transition-delay: 240ms; }

/* Accesibilidad obligatoria */
@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

---

## Patrón 2 — Slider/Carrusel táctil (swipe en móvil)

El patrón más robusto para slides que funcionan con touch Y con botones:

```javascript
class Slider {
  constructor(container) {
    this.container = container;
    this.track = container.querySelector('.slider-track');
    this.slides = container.querySelectorAll('.slide');
    this.current = 0;
    this.total = this.slides.length;
    
    // Touch state
    this.startX = 0;
    this.currentX = 0;
    this.isDragging = false;
    this.threshold = 50; // px mínimos para considerar swipe válido
    
    this.init();
  }
  
  init() {
    // Touch events (móvil)
    this.track.addEventListener('touchstart', e => this.onTouchStart(e), { passive: true });
    this.track.addEventListener('touchmove', e => this.onTouchMove(e), { passive: false });
    this.track.addEventListener('touchend', e => this.onTouchEnd(e));
    
    // Mouse drag (desktop)
    this.track.addEventListener('mousedown', e => this.onMouseDown(e));
    window.addEventListener('mousemove', e => this.onMouseMove(e));
    window.addEventListener('mouseup', e => this.onMouseUp(e));
    
    // Teclado (accesibilidad)
    this.container.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
    
    this.go(0, false); // Inicializar sin animación
  }
  
  onTouchStart(e) {
    this.startX = e.touches[0].clientX;
    this.isDragging = true;
    this.track.style.transition = 'none'; // Sin transición durante drag
  }
  
  onTouchMove(e) {
    if (!this.isDragging) return;
    this.currentX = e.touches[0].clientX;
    const diff = this.currentX - this.startX;
    const base = -this.current * 100;
    // Feedback visual durante el drag (resistencia en extremos)
    const resistance = (this.current === 0 && diff > 0) || 
                       (this.current === this.total - 1 && diff < 0) 
                       ? 0.3 : 1;
    this.track.style.transform = `translateX(calc(${base}% + ${diff * resistance}px))`;
    // Prevenir scroll vertical si el swipe es horizontal
    if (Math.abs(diff) > 10) e.preventDefault();
  }
  
  onTouchEnd(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    const diff = this.currentX - this.startX;
    
    if (diff < -this.threshold) this.next();
    else if (diff > this.threshold) this.prev();
    else this.go(this.current); // Snap back
  }
  
  onMouseDown(e) {
    this.startX = e.clientX;
    this.isDragging = true;
    this.track.style.transition = 'none';
    this.track.style.cursor = 'grabbing';
    e.preventDefault();
  }
  
  onMouseMove(e) {
    if (!this.isDragging) return;
    const diff = e.clientX - this.startX;
    const base = -this.current * 100;
    this.track.style.transform = `translateX(calc(${base}% + ${diff}px))`;
  }
  
  onMouseUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.track.style.cursor = 'grab';
    const diff = e.clientX - this.startX;
    if (diff < -this.threshold) this.next();
    else if (diff > this.threshold) this.prev();
    else this.go(this.current);
  }
  
  go(index, animate = true) {
    this.current = Math.max(0, Math.min(index, this.total - 1));
    
    if (animate) {
      this.track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
    
    this.track.style.transform = `translateX(-${this.current * 100}%)`;
    this.updateDots();
    this.updateArrows();
  }
  
  next() { this.go(this.current + 1); }
  prev() { this.go(this.current - 1); }
  
  updateDots() {
    this.container.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === this.current);
      dot.setAttribute('aria-current', i === this.current);
    });
  }
  
  updateArrows() {
    const prevBtn = this.container.querySelector('.prev');
    const nextBtn = this.container.querySelector('.next');
    if (prevBtn) prevBtn.disabled = this.current === 0;
    if (nextBtn) nextBtn.disabled = this.current === this.total - 1;
  }
}

// Inicializar todos los sliders de la página
document.querySelectorAll('.slider').forEach(el => new Slider(el));
```

```css
.slider {
  overflow: hidden;
  position: relative;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
}

.slider:active { cursor: grabbing; }

.slider-track {
  display: flex;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.slide {
  min-width: 100%;
  flex-shrink: 0;
}

/* Dots de navegación */
.dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0,0,0,0.2);
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.dot.active {
  background: currentColor;
  transform: scale(1.25);
}
```

---

## Patrón 3 — Transición entre secciones/páginas (SPA style)

Para que al navegar entre secciones la transición se sienta como una app nativa:

```javascript
// Page transition manager
class PageTransition {
  constructor() {
    this.overlay = this.createOverlay();
    this.isAnimating = false;
  }
  
  createOverlay() {
    const el = document.createElement('div');
    el.className = 'page-transition-overlay';
    document.body.appendChild(el);
    return el;
  }
  
  async navigate(url) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    // Fase 1: Salida
    await this.fadeOut();
    
    // Cambiar contenido (o navegar)
    window.location.href = url;
  }
  
  fadeOut() {
    return new Promise(resolve => {
      this.overlay.classList.add('active');
      this.overlay.addEventListener('transitionend', resolve, { once: true });
    });
  }
  
  fadeIn() {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        this.overlay.classList.remove('active');
        this.overlay.addEventListener('transitionend', () => {
          this.isAnimating = false;
          resolve();
        }, { once: true });
      });
    });
  }
}

const transitions = new PageTransition();

// Interceptar links internos
document.querySelectorAll('a[href^="/"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    transitions.navigate(link.href);
  });
});

// Al cargar la página nueva, hacer fadeIn
window.addEventListener('load', () => transitions.fadeIn());
```

```css
.page-transition-overlay {
  position: fixed;
  inset: 0;
  background: #0F1923; /* Color de marca */
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
}

.page-transition-overlay.active {
  opacity: 1;
  pointer-events: all;
}
```

---

## Patrón 4 — Navbar sticky con comportamiento scroll

El navbar que se oculta al bajar y aparece al subir (como apps nativas):

```javascript
let lastScroll = 0;
const navbar = document.querySelector('.navbar');
const SCROLL_THRESHOLD = 10;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  
  if (currentScroll < 50) {
    // Zona top — siempre visible
    navbar.classList.remove('hidden', 'scrolled');
    return;
  }
  
  navbar.classList.add('scrolled'); // Agregar sombra/fondo
  
  if (Math.abs(currentScroll - lastScroll) < SCROLL_THRESHOLD) return;
  
  if (currentScroll > lastScroll) {
    navbar.classList.add('hidden');    // Scrolling DOWN — esconder
  } else {
    navbar.classList.remove('hidden'); // Scrolling UP — mostrar
  }
  
  lastScroll = currentScroll;
}, { passive: true });
```

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
  will-change: transform;
}

.navbar.hidden {
  transform: translateY(-100%);
}

.navbar.scrolled {
  background: rgba(15, 25, 35, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 1px 0 rgba(255,255,255,0.08);
}
```

---

## Patrón 5 — Parallax suave (sin librerías)

```javascript
// Parallax performante con requestAnimationFrame
const parallaxElements = document.querySelectorAll('[data-parallax]');
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.5;
        const rect = el.getBoundingClientRect();
        const scrolled = window.scrollY;
        const offset = (rect.top + scrolled) * speed;
        el.style.transform = `translateY(${scrolled * speed - offset}px)`;
      });
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
```

```html
<!-- Uso en HTML -->
<div class="hero-bg" data-parallax="0.3">
  <img src="hero.jpg" alt="">
</div>
```

---

## Patrón 6 — Scroll suave nativo + ancla activa

```css
/* Scroll suave en toda la página — CSS puro */
html {
  scroll-behavior: smooth;
  scroll-padding-top: 80px; /* Altura del navbar fijo */
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

```javascript
// Marcar link activo según sección visible
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.5 });

sections.forEach(s => sectionObserver.observe(s));
```

---

## Curvas de easing de referencia

```css
/* Natural — para la mayoría de movimientos */
transition: ... 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

/* Bounce suave — para elementos que "aterrizan" */
transition: ... 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

/* Salida rápida — para elementos que se van */
transition: ... 0.3s cubic-bezier(0.55, 0, 1, 0.45);

/* Spring físico — para sliders y drags */
transition: ... 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

/* Duración recomendada por tipo:
   Micro-interacciones (hover, click): 100-200ms
   Transiciones de componente: 250-400ms
   Transiciones de página: 300-500ms
   NUNCA más de 600ms — se siente lento */
```

---

## Checklist antes de entregar código de animación

- [ ] Solo se animan `transform` y `opacity`
- [ ] `will-change` aplicado solo donde corresponde
- [ ] `prefers-reduced-motion` implementado
- [ ] Probado en iOS Safari (el más restrictivo)
- [ ] Probado en Android Chrome
- [ ] Touch events con `{ passive: true }` donde no se hace `preventDefault`
- [ ] Sin `position: fixed` dentro de elementos con `transform` (bug conocido)
- [ ] Sin animaciones en `scroll` sin `requestAnimationFrame` o `{ passive: true }`
- [ ] Duración máxima 500ms para transiciones de UI

---

## Bugs conocidos de iOS Safari

1. **`position: fixed` dentro de `transform`**: Se rompe. Nunca aniimes un padre de un elemento fixed.
2. **`vh` en móvil**: El 100vh incluye la barra del navegador. Usar `100dvh` (dynamic viewport height) en navegadores modernos, con fallback a `100vh`.
3. **`backdrop-filter`**: Requiere `-webkit-backdrop-filter` como prefijo.
4. **Scroll snap con touch**: Agregar `-webkit-overflow-scrolling: touch` en contenedores con scroll.
5. **`gap` en flex en Safari < 14**: Usar `margin` como fallback.

```css
/* Viewport height correcto en móvil */
.hero {
  min-height: 100vh; /* fallback */
  min-height: 100dvh; /* moderno */
}
```

---

## Cuándo usar librerías vs CSS nativo

| Caso | Solución recomendada |
|---|---|
| Scroll reveal básico | Intersection Observer (nativo) |
| Slider/carrusel | JS vanilla con touch events |
| Parallax simple | requestAnimationFrame (nativo) |
| Animaciones complejas encadenadas | GSAP |
| React con animaciones | Framer Motion |
| Partículas / canvas | Three.js o tsParticles |
| Texto animado letra a letra | GSAP SplitText |

