/**
 * Minimalist Modular 16:9 Presentation Controller
 * Client: Mohamed Daoud - Electrical Engineer
 * Features:
 *   - Modular dynamic slide detection: add/remove slides anywhere without breaking numbering
 *   - Automatic slide numbering at the bottom of each slide
 *   - Keyboard navigation & mobile touch swipe support
 */

(function () {
  'use strict';

  const slides = Array.from(document.querySelectorAll('.slide'));
  const totalSlides = slides.length;
  if (totalSlides === 0) return;

  let currentSlide = 0;
  const bottomSlideNumber = document.getElementById('bottom-slide-number');
  const bottomDotsContainer = document.getElementById('bottom-dots');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  function init() {
    createDots();
    setupControls();
    setupKeyboard();
    setupTouchSwipe();

    // Check hash #slide-2, etc.
    const hash = window.location.hash;
    if (hash && hash.startsWith('#slide-')) {
      const parsed = parseInt(hash.replace('#slide-', ''), 10) - 1;
      if (!isNaN(parsed) && parsed >= 0 && parsed < totalSlides) {
        currentSlide = parsed;
      }
    }

    goToSlide(currentSlide);
  }

  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;
    currentSlide = index;

    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === currentSlide);
      if (idx === currentSlide) slide.scrollTop = 0;
    });

    if (bottomSlideNumber) {
      const cur = String(currentSlide + 1).padStart(2, '0');
      const tot = String(totalSlides).padStart(2, '0');
      bottomSlideNumber.textContent = `${cur} / ${tot}`;
    }

    if (btnPrev) btnPrev.disabled = currentSlide === 0;
    if (btnNext) btnNext.disabled = currentSlide === totalSlides - 1;

    if (bottomDotsContainer) {
      const dots = bottomDotsContainer.querySelectorAll('.bottom-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
      });
    }

    history.replaceState(null, null, `#slide-${currentSlide + 1}`);
  }

  function createDots() {
    if (!bottomDotsContainer) return;
    bottomDotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'bottom-dot' + (i === currentSlide ? ' active' : '');
      dot.setAttribute('title', `Slide ${i + 1}`);
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      bottomDotsContainer.appendChild(dot);
    }
  }

  function nextSlide() {
    if (currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    if (currentSlide > 0) goToSlide(currentSlide - 1);
  }

  function setupControls() {
    if (btnPrev) btnPrev.addEventListener('click', prevSlide);
    if (btnNext) btnNext.addEventListener('click', nextSlide);
  }

  function setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault();
          prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(totalSlides - 1);
          break;
      }
    });
  }

  function setupTouchSwipe() {
    let touchStartX = 0;
    let touchEndX = 0;

    window.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const threshold = 50;
      if (touchEndX < touchStartX - threshold) {
        nextSlide();
      } else if (touchEndX > touchStartX + threshold) {
        prevSlide();
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
