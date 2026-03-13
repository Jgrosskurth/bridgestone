/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-article. Base: cards.
 * Source: https://tires.bridgestone.com/
 * Extracts article cards from bsx-section#resource bsx-card-base JSON.
 * Cards block: each row = 1 card. Col 1 = image, Col 2 = title + category + read time + desc.
 * Article cards are clickable (cardLinkURL) and have no cardActions.
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

    // Col 1: Card image
    const imgCol = document.createElement('div');
    if (data.cardMedia && data.cardMedia.src) {
      const img = document.createElement('img');
      img.src = data.cardMedia.src;
      imgCol.append(img);
    }

    // Col 2: Title + category + read time + description
    const contentCol = document.createElement('div');

    if (data.cardContent && data.cardContent.children) {
      data.cardContent.children.forEach((child) => {
        if (child.component === 'h6') {
          const h6 = document.createElement('h6');
          h6.textContent = child.children;
          contentCol.append(h6);
        } else if (child.cardCategories) {
          const p = document.createElement('p');
          p.textContent = child.cardCategories.join(', ');
          contentCol.append(p);
        } else if (child.component === 'span' && child.children) {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = child.children;
          Array.from(wrapper.children).forEach((el) => contentCol.append(el));
        }
      });
    }

    if (data.cardLinkURL) {
      const a = document.createElement('a');
      a.href = data.cardLinkURL;
      a.textContent = '';
      const p = document.createElement('p');
      p.append(a);
      contentCol.append(p);
    }

    cells.push([imgCol, contentCol]);
  });

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
