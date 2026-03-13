/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-support. Base: cards.
 * Source: https://tires.bridgestone.com/
 * Extracts support cards from bsx-card-base JSON.
 * Cards block: each row = 1 card. Col 1 = empty (no images), Col 2 = eyebrow + heading + desc + CTAs.
 * Support cards have no cardMedia images.
 * Supports both data-json attributes (bundled import) and script tags (live page).
 */

function getAllComponentJson(element, selector) {
  const els = element.querySelectorAll(`${selector}[data-json]`);
  if (els.length > 0) {
    return Array.from(els).map((el) => ({ json: el.getAttribute('data-json'), el }));
  }
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

    // Col 1: No image for support cards, use empty div
    const imgCol = document.createElement('div');

    // Col 2: Eyebrow (h6) + Heading (h5) + Description + CTAs
    const contentCol = document.createElement('div');

    if (data.cardContent && data.cardContent.children) {
      data.cardContent.children.forEach((child) => {
        if (child.component === 'h6') {
          const h6 = document.createElement('h6');
          h6.textContent = child.children;
          contentCol.append(h6);
        } else if (child.component === 'h5') {
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-support', cells });
  element.replaceWith(block);
}
