/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-showcase. Base: columns.
 * Source: https://tires.bridgestone.com/
 * Extracts content card from bsx-section#wrm bsx-content-card JSON.
 * Columns block: Row 1 = Col 1 (image) | Col 2 (title + subtitle + body + CTAs).
 * Note: bsx-content-card may have multiple JSON configs; find the one with title.
 * Supports both data-json attributes (bundled import) and script tags (live page).
 */

function getContentCardJson(element) {
  const el = element.querySelector('bsx-content-card[data-json]');
  if (el) {
    return el.getAttribute('data-json').split('|||').map((s) => s.trim());
  }
  const scripts = element.querySelectorAll('bsx-content-card script[type="application/json"]');
  return Array.from(scripts).map((s) => s.textContent);
}

export default function parse(element, { document }) {
  const jsonParts = getContentCardJson(element);
  if (!jsonParts.length) return;

  let data;
  for (const part of jsonParts) {
    try {
      const parsed = JSON.parse(part);
      if (parsed.title) {
        data = parsed;
        break;
      }
    } catch (e) {
      // skip
    }
  }
  if (!data) return;

  // Col 1: Image
  const imgCol = document.createElement('div');
  if (data.assets && data.assets.desktopSrc) {
    const img = document.createElement('img');
    img.src = data.assets.desktopSrc;
    img.alt = data.imageAltText || '';
    imgCol.append(img);
  }

  // Col 2: Title + subtitle + body + CTAs
  const textCol = document.createElement('div');

  if (data.title) {
    const h4 = document.createElement('h4');
    h4.textContent = data.title;
    textCol.append(h4);
  }

  if (data.subTitle) {
    const h6 = document.createElement('h6');
    h6.textContent = data.subTitle;
    textCol.append(h6);
  }

  if (data.bodyText) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = data.bodyText;
    Array.from(wrapper.children).forEach((el) => textCol.append(el));
  }

  if (data.cardActions && data.cardActions.children) {
    const actionP = document.createElement('p');
    data.cardActions.children.forEach((action) => {
      if (action.href || action.text) {
        const a = document.createElement('a');
        a.href = action.href || '#';
        a.textContent = action.text || '';
        actionP.append(a);
        actionP.append(document.createTextNode(' '));
      }
    });
    if (actionP.childNodes.length > 0) textCol.append(actionP);
  }

  const cells = [[imgCol, textCol]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-showcase', cells });
  element.replaceWith(block);
}
