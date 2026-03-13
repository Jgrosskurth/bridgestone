/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBrandParser from './parsers/hero-brand.js';
import cardsCategoryParser from './parsers/cards-category.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import cardsBentoParser from './parsers/cards-bento.js';
import cardsPromoParser from './parsers/cards-promo.js';
import columnsShowcaseParser from './parsers/columns-showcase.js';
import cardsArticleParser from './parsers/cards-article.js';
import cardsSupportParser from './parsers/cards-support.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/bridgestone-cleanup.js';
import sectionsTransformer from './transformers/bridgestone-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-brand': heroBrandParser,
  'cards-category': cardsCategoryParser,
  'columns-feature': columnsFeatureParser,
  'cards-bento': cardsBentoParser,
  'cards-promo': cardsPromoParser,
  'columns-showcase': columnsShowcaseParser,
  'cards-article': cardsArticleParser,
  'cards-support': cardsSupportParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Bridgestone Tires homepage with hero, product categories, promotions, and brand content',
  urls: ['https://tires.bridgestone.com/'],
  blocks: [
    {
      name: 'hero-brand',
      instances: ['div.hero.aem-GridColumn'],
    },
    {
      name: 'cards-category',
      instances: ['bsx-section#auto .column'],
    },
    {
      name: 'columns-feature',
      instances: ['bsx-section#guide .content-card'],
    },
    {
      name: 'cards-bento',
      instances: ['bsx-section#why .bento-box'],
    },
    {
      name: 'cards-promo',
      instances: ['bsx-section#offers .column:has(.card)'],
    },
    {
      name: 'columns-showcase',
      instances: ['bsx-section#wrm .content-card'],
    },
    {
      name: 'cards-article',
      instances: ['bsx-section#resource:has(.separator) .column:has(.card)'],
    },
    {
      name: 'cards-support',
      instances: ['section:has(bsx-section#resource) ~ section bsx-grid:has(.card)'],
    },
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero',
      selector: 'div.hero.aem-GridColumn',
      style: null,
      blocks: ['hero-brand'],
      defaultContent: [],
    },
    {
      id: 'section-subnav',
      name: 'Subnav',
      selector: 'div.subnav.aem-GridColumn',
      style: null,
      blocks: [],
      defaultContent: ['bsx-subnav a'],
    },
    {
      id: 'section-categories',
      name: 'Tire Categories',
      selector: 'section:has(bsx-section#auto)',
      style: null,
      blocks: ['cards-category'],
      defaultContent: [],
    },
    {
      id: 'section-guide',
      name: 'Tire Decision Guide',
      selector: 'section:has(bsx-section#guide)',
      style: null,
      blocks: ['columns-feature'],
      defaultContent: [],
    },
    {
      id: 'section-welcome',
      name: 'Welcome to Bridgestone',
      selector: 'section:has(bsx-section#why)',
      style: null,
      blocks: ['cards-bento'],
      defaultContent: ['#title-eb9241a6ce'],
    },
    {
      id: 'section-offers',
      name: 'Tire Offers and Promotions',
      selector: 'section:has(bsx-section#offers)',
      style: null,
      blocks: ['cards-promo'],
      defaultContent: ['#title-558866290d', 'bsx-section#offers .separator'],
    },
    {
      id: 'section-wrm',
      name: 'What Really Matters',
      selector: 'section:has(bsx-section#wrm)',
      style: null,
      blocks: ['columns-showcase'],
      defaultContent: [],
    },
    {
      id: 'section-whats-new',
      name: 'Whats New',
      selector: 'section:has(bsx-section#resource)',
      style: null,
      blocks: ['cards-article'],
      defaultContent: ['#title-ecf2f7fd84', 'bsx-section#resource .separator'],
    },
    {
      id: 'section-support',
      name: 'Support Cards',
      selector: ['section:has(bsx-section#resource) ~ section:has(.card)', 'section:nth-of-type(8)'],
      style: null,
      blocks: ['cards-support'],
      defaultContent: [],
    },
    {
      id: 'section-contact',
      name: 'Contact Us',
      selector: 'section:has(bsx-section#about)',
      style: null,
      blocks: [],
      defaultContent: ['#title-7588a694d7', 'bsx-section#about .typography'],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  /**
   * Preprocess: runs BEFORE the helix importer strips scripts.
   * Preserves JSON config data as data-json attributes on parent web components.
   */
  preprocess: ({ document }) => {
    const scripts = document.querySelectorAll('script[type="application/json"]');
    console.log(`[preprocess] Found ${scripts.length} JSON scripts to preserve`);
    scripts.forEach((script) => {
      const parent = script.parentElement;
      if (parent) {
        // Store JSON as a data attribute on the parent custom element
        const existing = parent.getAttribute('data-json') || '';
        if (existing) {
          // Multiple scripts in same parent: store as array
          parent.setAttribute('data-json', existing + '|||' + script.textContent.trim());
        } else {
          parent.setAttribute('data-json', script.textContent.trim());
        }
      }
    });
  },

  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    let path = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html$/, '')
      .toLowerCase();
    if (!path || path === '') path = '/index';

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
