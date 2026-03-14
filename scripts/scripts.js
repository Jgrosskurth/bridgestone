import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/* Scene7 image URL mapping — fixes broken image sources in DA content */
const S7 = 'https://s7d1.scene7.com/is/image/bridgestone';
const IMAGE_FIX_MAP = {
  'hero-brand': [
    { src: `${S7}/bst-personal-homepage-hero-1500-v2`, alt: 'car on the road' },
  ],
  'cards-category': [
    { src: `${S7}/bst-automotive-cc-1500`, alt: 'Automotive tires' },
    { src: `${S7}/bst-motorcycle-card-1500`, alt: 'Motorcycle tires' },
  ],
  'columns-feature': [
    { src: `${S7}/bridgestone-consumer-alenza-prestige-homepage`, alt: 'Bridgestone Alenza tire' },
  ],
  'cards-bento': [
    { src: `${S7}/bst-homepage-retailer-bento`, alt: 'Tire dealer' },
    { src: `${S7}/bento4`, alt: 'Bridgestone E8 Commitment' },
    { src: `${S7}/bst-homepage-bento-dueler-lifestyle-1500`, alt: 'Bridgestone Dueler tire' },
    { src: `${S7}/background-highway-road-between-forest-and-sea`, alt: 'Highway road' },
  ],
  'cards-promo': [
    { src: `${S7}/spring-us-motorcycle-promo`, alt: 'Spring motorcycle promotion' },
    { src: `${S7}/2026-march-promo`, alt: 'March promotion' },
    { src: `${S7}/bridgestone-consumer-homepage-card-offers-promotions?fmt=webp`, alt: 'CFNA financing' },
  ],
  'columns-showcase': [
    { src: `${S7}/sustainability-3-desk-images-na-bst-web-consumer-v1`, alt: 'Bridgestone sustainability' },
  ],
  'cards-article': [
    { src: `${S7}/bst-homepage-learn-summer-vs-as-1500`, alt: 'Summer tires vs all season' },
    { src: `${S7}/bst-learn-runflat-1500`, alt: 'Run flat tires' },
    { src: `${S7}/hero-202506-motorcycle-learn-desktop-homepage-global-consumer`, alt: 'Motorcycle tire maintenance' },
  ],
};

/**
 * Replaces broken image sources (about:error) with correct Scene7 CDN URLs.
 * DA content lost the original image URLs; this maps each block's images by position.
 * @param {Element} main The main container element
 */
function fixBrokenImages(main) {
  Object.entries(IMAGE_FIX_MAP).forEach(([blockClass, images]) => {
    const block = main.querySelector(`.${blockClass}`);
    if (!block) return;
    const brokenImgs = [...block.querySelectorAll('img')].filter(
      (img) => !img.getAttribute('src') || img.getAttribute('src') === 'about:error',
    );
    brokenImgs.forEach((img, idx) => {
      if (idx < images.length) {
        img.src = images[idx].src;
        if (!img.alt) img.alt = images[idx].alt;
      }
    });
  });
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    // Check if h1 or picture is already inside a hero block
    if (h1.closest('.hero') || picture.closest('.hero')) {
      return; // Don't create a duplicate hero block
    }
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }

    buildHeroBlock(main);

    // auto-style "Contact Us" section
    const contactHeading = [...main.querySelectorAll('.default-content-wrapper > p')].find(
      (p) => p.textContent.trim() === 'Have a Question? Contact Us!',
    );
    if (contactHeading) {
      const section = contactHeading.closest('.section') || contactHeading.closest('div');
      section.classList.add('contact-cta');

      // remove tracking-pixel images (1×1 gifs from analytics)
      section.querySelectorAll('img').forEach((img) => {
        const p = img.closest('p');
        if (p) p.remove();
      });

      // add CTA button after phone-number paragraph
      const phonePara = [...section.querySelectorAll('p')].find(
        (p) => p.querySelector('a[href^="tel:"]'),
      );
      if (phonePara) {
        const cta = document.createElement('p');
        cta.className = 'button-wrapper';
        cta.innerHTML = '<a href="/en-us/support/contact-us" title="Contact Bridgestone Service Center" class="button primary">Contact Bridgestone Service Center</a>';
        phonePara.after(cta);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  fixBrokenImages(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
