/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-category. Base: cards.
 * Source: https://tires.bridgestone.com/
 * Extracts category cards from bsx-section#auto bsx-card-base JSON.
 * Cards block: each row = 1 card. Col 1 = image, Col 2 = heading + desc + CTAs.
 * Supports both data-json attributes (bundled import) and script tags (live page).
 */

function getAllComponentJson(element, selector) {
  // Try data-json attributes first (set by preprocess in bundled import)
  const els = element.querySelectorAll(`${selector}[data-json]`);
  if (els.length > 0) {
    return Array.from(els).map((el) => ({ json: el.getAttribute('data-json'), el }));
  }
  // Fallback to script tags (live page / validation)
  const scripts = element.querySelectorAll(`${selector} script[type="application/json"]`);
  return Array.from(scripts).map((s) => ({ json: s.textContent, el: s.closest(selector) || s.parentElement }));
}

export default function parse(element, { document }) {
  const items = getAllComponentJson(element, 'bsx-card-base');
  if (!items.length) return;

  const cells = [];

  items.forEach(({ json }) => {
    let data;
    try {
      data = JSON.parse(json);
    } catch (e) {
      return;
    }

    // Col 1: Card image
    const imgCol = document.createElement('div');
    if (data.cardMedia && data.cardMedia.src) {
      const img = document.createElement('img');
      img.src = data.cardMedia.src;
      imgCol.append(img);
    }

    // Col 2: Heading + description + CTA links
    const contentCol = document.createElement('div');

    if (data.cardContent && data.cardContent.children) {
      data.cardContent.children.forEach((child) => {
        if (child.component === 'h5') {
          const h5 = document.createElement('h5');
          h5.textContent = child.children;
          contentCol.append(h5);
        } else if (child.component === 'span' && child.children) {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = child.children;
          Array.from(wrapper.children).forEach((el) => contentCol.append(el));
        }
      });
    }

    if (data.cardActions && data.cardActions.children) {
      const actionP = document.createElement('p');
      data.cardActions.children.forEach((action) => {
        if (action.link || action.text) {
          const a = document.createElement('a');
          a.href = action.link || '#';
          a.textContent = action.text || '';
          actionP.append(a);
          actionP.append(document.createTextNode(' '));
        }
      });
      if (actionP.childNodes.length > 0) contentCol.append(actionP);
    }

    cells.push([imgCol, contentCol]);
  });

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-category', cells });
  element.replaceWith(block);
}
