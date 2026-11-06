/* ==========================================================================
   Flow · Landing
   La captura de la app arranca inclinada y se endereza al bajar; las fichas
   flotan a distinta velocidad y las secciones entran suaves.
   ========================================================================== */
(() => {
  'use strict';
  Flow.i18n.init();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('is-solid', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.feature__copy, .feature__media, .privacy > *, .cta > *').forEach((el, i) => { el.classList.add('reveal'); el.style.transitionDelay = `${(i % 3) * 80}ms`; io.observe(el); });

  if (reduced || !window.gsap) { document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in')); return; }

  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const el = document.querySelector(a.getAttribute('href'));
      if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -70 }); }
    }));
  }

  // Entrada del hero
  gsap.from('.hero__copy > *', { y: 26, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08 });
  gsap.from('.stage', { y: 80, opacity: 0, duration: 1.4, ease: 'power3.out', delay: 0.25 });

  // La app se endereza con el scroll
  gsap.to('#tilt', { rotateX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.stage', start: 'top 85%', end: 'top 20%', scrub: 0.6 } });
  gsap.utils.toArray('.chip').forEach((chip, i) => {
    gsap.fromTo(chip, { y: 60 + i * 20 }, { y: -60 - i * 30, ease: 'none', scrollTrigger: { trigger: '.stage', start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Las capturas de cada función se acercan un poco al pasar
  gsap.utils.toArray('.feature__media img').forEach(img => {
    gsap.fromTo(img, { scale: 1.06 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'center center', scrub: true } });
  });
})();
