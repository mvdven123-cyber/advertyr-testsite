// Consent first: Google Analytics is loaded only after "Accepteren", and only with a real measurement ID (config.js).
// The choice is kept in this browser only. The site itself collects nothing: no forms, no accounts, no own cookies.
(() => {
  const KEY = 'advertyr-test-site-consent';
  const id = window.ADVERTYR_TEST_SITE?.measurementId ?? '';
  const configured = /^G-[A-Z0-9]{4,}$/.test(id) && id !== 'G-XXXXXXXXXX';

  function loadAnalytics() {
    if (!configured || window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // biome-ignore lint/complexity/noArguments: the GA4 snippet pushes the arguments object as is.
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', id);
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
  }

  function choose(choice) {
    try {
      localStorage.setItem(KEY, choice);
    } catch {
      // storage blocked: the choice holds for this page only
    }
    document.getElementById('consent')?.remove();
    if (choice === 'accepted') loadAnalytics();
  }

  // Withdrawing consent: forget the choice and reload, so Google Analytics is no longer loaded.
  document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('[data-consent-reset]')) {
      try {
        localStorage.removeItem(KEY);
      } catch {
        // storage blocked: nothing was kept
      }
      window.location.reload();
    }
  });

  // The one "key event" of the site: a click on the contact button (mark it as key event in GA4).
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-key-event]') : null;
    if (target && window.gtag) window.gtag('event', target.getAttribute('data-key-event'));
  });

  let stored = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch {
    stored = null;
  }
  if (stored === 'accepted') loadAnalytics();
  if (stored) return;

  const banner = document.createElement('div');
  banner.id = 'consent';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookies');
  banner.innerHTML =
    '<p>Deze testwebsite meet bezoeken met Google Analytics, alleen als je dat goedvindt.</p>' +
    '<button type="button" data-choice="accepted">Accepteren</button> ' +
    '<button type="button" data-choice="declined">Weigeren</button>';
  banner.addEventListener('click', (event) => {
    const choice = event.target instanceof Element ? event.target.getAttribute('data-choice') : null;
    if (choice) choose(choice);
  });
  document.body.appendChild(banner);
})();
