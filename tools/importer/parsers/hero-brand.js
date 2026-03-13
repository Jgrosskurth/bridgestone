/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-brand. Base: hero.
 * Source: https://tires.bridgestone.com/
 * Extracts hero data from bsx-hero JSON config.
 * Hero block: Row 1 = background image, Row 2 = heading + text + CTAs.
 * Supports both data-json attributes (bundled import) and script tags (live page).
 */

function getComponentJson(element, selector) {
  // Try data-json attribute first (set by preprocess in bundled import)
  const el = element.querySelector(`${selector}[data-json]`);
  if (el) return el.getAttribute('data-json');
  // Fallback to script tag (live page / validation)
  const script = element.querySelector(`${selector} script[type="application/json"]`);
  if (script) return script.textContent;
  return null;
}

export default function parse(element, { document }) {
  const raw = getComponentJson(element, 'bsx-hero');
  if (!raw) return;

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return;
  }

  const cells = [];

  // Row 1: Background image (optional)
  if (data.heroImage && data.heroImage.desktopSrc) {
    const img = document.createElement('img');
    img.src = data.heroImage.desktopSrc;
    img.alt = data.heroImageAltText || '';
    cells.push([img]);
  }

  // Row 2: Heading + subtitle + CTA links (all in a single cell)
  const contentDiv = document.createElement('div');

  if (data.heroTitle) {
    const h1 = document.createElement('h1');
    h1.textContent = data.heroTitle;
    contentDiv.append(h1);
  }

  if (data.heroSubtitle) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = data.heroSubtitle;
    const paras = wrapper.querySelectorAll('p');
    paras.forEach((p) => contentDiv.append(p));
    if (paras.length === 0 && wrapper.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = wrapper.textContent.trim();
      contentDiv.append(p);
    }
  }

  if (data.heroActions && data.heroActions.children) {
    const actionP = document.createElement('p');
    data.heroActions.children.forEach((action) => {
      if (action.href || action.children) {
        const a = document.createElement('a');
        a.href = action.href || '#';
        a.textContent = action.children || action.text || '';
        actionP.append(a);
        actionP.append(document.createTextNode(' '));
      }
    });
    if (actionP.childNodes.length > 0) contentDiv.append(actionP);
  }

  if (contentDiv.childNodes.length > 0) {
    cells.push([contentDiv]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-brand', cells });
  element.replaceWith(block);
}
