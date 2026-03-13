/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-bento. Base: cards.
 * Source: https://tires.bridgestone.com/
 * Extracts bento box from bsx-section#why .bento-box.
 * Contains bsx-card-base (overlay cards with text) + standalone bsx-image elements.
 * Cards block: each row = 1 card. Col 1 = image, Col 2 = heading + desc + CTA.
 * Standalone images become image-only rows.
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

function getImageJson(imgEl) {
  if (imgEl.hasAttribute('data-json')) return imgEl.getAttribute('data-json');
  const script = imgEl.querySelector('script[type="application/json"]');
  return script ? script.textContent : null;
}

export default function parse(element, { document }) {
  const cells = [];

  const cardItems = getAllComponentJson(element, 'bsx-card-base');
  const pairedImages = new Set();

  cardItems.forEach(({ json, el: cardEl }) => {
    let data;
    try {
      data = JSON.parse(json);
    } catch (e) {
      return;
    }

    // Find associated image (sibling bsx-image in grandparent)
    const parentDiv = cardEl.parentElement;
    const grandParent = parentDiv ? parentDiv.parentElement : null;
    const siblingImageEl = grandParent ? grandParent.querySelector('bsx-image') : null;

    // Col 1: Associated image
    const imgCol = document.createElement('div');
    if (siblingImageEl) {
      pairedImages.add(siblingImageEl);
      const imgJson = getImageJson(siblingImageEl);
      if (imgJson) {
        try {
          const imgData = JSON.parse(imgJson);
          if (imgData.assets && imgData.assets.desktopSrc) {
            const img = document.createElement('img');
            img.src = imgData.assets.desktopSrc;
            imgCol.append(img);
          }
        } catch (e) {
          // skip
        }
      }
    }

    // Col 2: Heading + description + CTA
    const contentCol = document.createElement('div');

    if (data.cardContent && data.cardContent.children) {
      data.cardContent.children.forEach((item) => {
        if (item.component === 'span' && item.children) {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = item.children;
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
        }
      });
      if (actionP.childNodes.length > 0) contentCol.append(actionP);
    }

    cells.push([imgCol, contentCol]);
  });

  // Get standalone images (bsx-image not paired with a card)
  const allImageEls = element.querySelectorAll('bsx-image');
  allImageEls.forEach((imgEl) => {
    if (pairedImages.has(imgEl)) return;

    const imgJson = getImageJson(imgEl);
    if (!imgJson) return;

    try {
      const imgData = JSON.parse(imgJson);
      if (imgData.assets && imgData.assets.desktopSrc) {
        const img = document.createElement('img');
        img.src = imgData.assets.desktopSrc;
        cells.push([img]);
      }
    } catch (e) {
      // skip
    }
  });

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-bento', cells });
  element.replaceWith(block);
}
