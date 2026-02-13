// SPA navigation + mobile nav toggle
// Fix for ReferenceError: _sidebarDocHandler is not defined
let _sidebarDocHandler = null;
const navToggle = document.querySelector('.nav-toggle');
let navLinks = document.querySelector('.nav-links');

function closeMobileMenu() {
  if (navLinks && navToggle) {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }
}

function openMobileMenu() {
  if (navLinks && navToggle) {
    navLinks.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  }
}

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navLinks.classList.toggle('open');
    document.body.classList.toggle('nav-open');
  });
}

// Helper to update active nav item
function updateActiveNav(url) {
  document.querySelectorAll('.nav-links a').forEach(a => {
    const li = a.closest('li');
    if (!li) return;
    if (new URL(a.href, location.origin).pathname === new URL(url, location.origin).pathname) {
      li.classList.add('active');
    } else {
      li.classList.remove('active');
    }
  });
}

// Highlight active item in floating mobile nav based on current URL/pathname.
// Supports both structures:
// 1) <ul id="mobile-nav"><li><a ...></a></li></ul>
// 2) <nav id="mobile-nav"><a ...></a></nav>
function updateActiveMobileNav(url = window.location.href) {
  const mobileNav = document.getElementById('mobile-nav');
  if (!mobileNav) return;

  let currentPath;
  try {
    currentPath = new URL(url, window.location.origin).pathname;
  } catch (e) {
    currentPath = window.location.pathname;
  }

  mobileNav.querySelectorAll('a[href]').forEach((a) => {
    let linkPath;
    try {
      linkPath = new URL(a.getAttribute('href'), window.location.origin).pathname;
    } catch (e) {
      return;
    }

    const li = a.closest('li');
    const isActive = linkPath === currentPath;

    if (li) {
      li.classList.toggle('active', isActive);
      a.classList.toggle('active', isActive);
    } else {
      a.classList.toggle('active', isActive);
    }
  });
}

// Fetch and replace main content
async function fetchAndReplace(url, addToHistory = true) {
  try {
    const res = await fetch(url, { method: 'GET', credentials: 'same-origin' });
    if (!res.ok) throw new Error('Network error');
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    const newMain = doc.querySelector('#content');
    if (!newMain) {
      // Fallback to full navigation if content region missing
      location.href = url;
      return;
    }

    // Replace content
    const curMain = document.querySelector('#content');
    if (curMain) {
      curMain.innerHTML = newMain.innerHTML;
    }

    // Update document title
    const newTitle = doc.querySelector('title');
    if (newTitle) document.title = newTitle.textContent;

    // Update active nav
    updateActiveNav(url);
    updateActiveMobileNav(url);

    // Close mobile menu if open
    closeMobileMenu();

    // Scroll to top
    window.scrollTo({ top: 0 });

    // Trigger full entrance animation on SPA swaps (same as initial load)
    document.body.classList.remove('play-entrance');
    // Force reflow then add the class so entrance animations run
    void document.body.offsetHeight;
    document.body.classList.add('play-entrance');
    // Remove the class after animations finish so it can run next time
    setTimeout(() => document.body.classList.remove('play-entrance'), 900);

    // Re-bind any interactive behaviors inside new content if needed
    rebindContentBehaviors();

    // Move focus to new content for accessibility
    const mainContent = document.querySelector('#content');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      // remove tabindex later to keep DOM clean
      setTimeout(() => mainContent.removeAttribute('tabindex'), 2000);
    }

    if (addToHistory) history.pushState({ url }, '', url);
  } catch (err) {
    console.error('Navigation failed, performing full load', err);
    location.href = url;
  }
}

// Intercept internal link clicks
function linkHandler(e) {
  const a = e.currentTarget;
  if (a.target === '_blank' || a.hasAttribute('download') || a.hostname !== location.hostname) return; // let browser handle
  e.preventDefault();
  const url = a.href;
  fetchAndReplace(url, true);
}

// Attach SPA behavior to all internal links (nav and content)
function bindLinkInterception() {
  function isSamePageFragment(a) {
    const href = a.getAttribute('href') || '';
    // pure hash => same-page fragment
    if (href.startsWith('#')) return true;
    // relative links that resolve to the current pathname + hash should be treated as same-page fragments
    try {
      const resolved = new URL(href, location.href);
      if (resolved.pathname === location.pathname && resolved.hash) return true;
    } catch (e) { /* ignore invalid URLs */ }
    return false;
  }

  document.querySelectorAll('a').forEach(a => {
    // ignore anchors that are fragment links to the current page
    if (isSamePageFragment(a)) return;
    a.removeEventListener('click', linkHandler);
    a.addEventListener('click', linkHandler);
  });
}

// Helper to trigger the text reveal animation (restarts the reveal)
function triggerTextReveal() {
  document.querySelectorAll('.animated-text').forEach(el => {
    el.classList.remove('play-text-reveal');
    // Force reflow so re-adding the class retriggers the animation
    void el.offsetWidth;
    el.classList.add('play-text-reveal');
    // remove the class after animation so it can be triggered again later
    setTimeout(() => el.classList.remove('play-text-reveal'), 900);
  });
}

function initQualityServicesAccordion() {
  const accordion = document.querySelector('.quality-accordion');
  if (!accordion) return;

  const items = Array.from(accordion.querySelectorAll('.quality-item'));
  const closeItem = (item) => {
    const trigger = item.querySelector('.quality-trigger');
    item.classList.remove('is-active');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  };

  const openItem = (item) => {
    const trigger = item.querySelector('.quality-trigger');
    item.classList.add('is-active');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
  };

  items.forEach((item) => {
    const trigger = item.querySelector('.quality-trigger');
    if (!trigger) return;

    trigger.onclick = () => {
      const isActive = item.classList.contains('is-active');
      items.forEach(closeItem);
      if (!isActive) openItem(item);
    };
  });
}

// Rebind any content-specific JS (placeholder for future additions)
function rebindContentBehaviors() {
  // Update navLinks reference in case DOM changed
  navLinks = document.querySelector('.nav-links');

  // Re-bind link interception
  bindLinkInterception();

  // Re-run any other scripts in newly inserted content if required
  // Contact form handling (for SPA-loaded contact page)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    // ensure we don't add duplicate listeners
    const handler = (e) => {
      e.preventDefault();
      const data = new FormData(contactForm);
      fetch(contactForm.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(res => res.json())
        .then(() => {
          document.getElementById('form-msg').textContent = 'Thanks! Your message was sent.';
          contactForm.reset();
        })
        .catch(() => {
          document.getElementById('form-msg').textContent = 'Oops — there was a problem. Please try again.';
        });
    };
    contactForm.removeEventListener('submit', handler);
    contactForm.addEventListener('submit', handler);
  }

  // If a projects grid exists in newly inserted content, render projects
  if (document.getElementById('portfolio-grid')) {
    if (typeof loadProjects === 'function') loadProjects();
  }

  // Retrigger animated headings when new content is inserted
  if (typeof triggerTextReveal === 'function') triggerTextReveal();
  initQualityServicesAccordion();

    // Bind sidebar toggle (if present in content)
    bindSidebarToggle();
    // Ensure sidebar doesn't overlap footer after content change
    if (typeof adjustSidebarForFooter === 'function') adjustSidebarForFooter();
  }

  function handleDocClickForSidebar(e) {
    const sidebar = document.querySelector('.about-left.sidebar');
    const btn = document.querySelector('.sidebar-toggle');
    if (!sidebar || !sidebar.classList.contains('open')) return;
    if (btn && btn.contains(e.target)) return;
    if (sidebar.contains(e.target)) return;
    sidebar.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function bindSidebarToggle() {
    const btn = document.querySelector('.sidebar-toggle');
    if (!btn) return;
    btn.onclick = (e) => { e.stopPropagation(); toggleSidebar(); };
    // Ensure only one document handler exists
    if (_sidebarDocHandler) document.removeEventListener('click', _sidebarDocHandler);
    _sidebarDocHandler = handleDocClickForSidebar;
    document.addEventListener('click', _sidebarDocHandler);
  }

  // Adjust sidebar to avoid overlapping footer
  function adjustSidebarForFooter() {
    const sidebar = document.querySelector('.about-left.sidebar');
    const footer = document.querySelector('.site-footer') || document.querySelector('footer');
    if (!sidebar || !footer) return;
    // Skip adjustments on narrow screens where sidebar becomes overlay/modal
    if (window.innerWidth <= 900) {
      sidebar.style.bottom = '';
      sidebar.style.maxHeight = '';
      return;
    }
    const footerRect = footer.getBoundingClientRect();
    const overlap = Math.max(0, window.innerHeight - footerRect.top);
    // Set bottom and adjust max-height accordingly (keeps the same 140px base offset)
    sidebar.style.bottom = overlap + 'px';
    sidebar.style.maxHeight = `calc(100vh - 140px - ${overlap}px)`;
  }

  // Keep sidebar adjusted on scroll/resize
  window.addEventListener('scroll', adjustSidebarForFooter, { passive: true });
  window.addEventListener('resize', adjustSidebarForFooter);

  // Handle back/forward
  window.addEventListener('popstate', (e) => {
  const url = location.href;
  fetchAndReplace(url, false);
});

// Initial setup on DOM ready
// Scroll to top function for all pages
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Attach scroll-to-top to all .back-to-top links
function bindScrollToTop() {
  document.querySelectorAll('.back-to-top').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      scrollToTop();
    };
  });
}

// Initial setup on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // ...existing code for theme, nav, entrance, etc...
  // Bind nav-close button (curtain close) if present
  const navCloseBtn = document.querySelector('.nav-close');
  if (navCloseBtn) navCloseBtn.addEventListener('click', (e) => { e.preventDefault(); closeMobileMenu(); });

  // Start entrance animation on initial load
  document.body.classList.add('play-entrance');

  // Ensure all major headings have animated text applied
  document.querySelectorAll('h1,h2').forEach(h => { if (!h.classList.contains('animated-text')) h.classList.add('animated-text'); });

  // Trigger heading text reveal
  triggerTextReveal();
  // Remove the class after animations finish (safe timeout)
  setTimeout(() => document.body.classList.remove('play-entrance'), 900);

  // Bind links
  bindLinkInterception();
  // Sync active state for floating mobile nav on initial load
  updateActiveMobileNav(window.location.href);
  // Bind sidebar toggle (if sidebar exists)
  bindSidebarToggle();
  // Ensure sidebar adjusts to avoid overlapping the footer
  if (typeof adjustSidebarForFooter === 'function') adjustSidebarForFooter();

  // Close curtain menu when clicking outside it on mobile
  document.addEventListener('click', (e) => {
    if (!document.body.classList.contains('nav-open')) return;
    const target = e.target;
    const insideNav = target.closest && target.closest('.nav-links');
    const isToggle = target.closest && target.closest('.nav-toggle');
    if (!insideNav && !isToggle) closeMobileMenu();
  });

  // Bind scroll-to-top for all .back-to-top links
  bindScrollToTop();
  // Bind quality services accordion if section exists
  initQualityServicesAccordion();
});
