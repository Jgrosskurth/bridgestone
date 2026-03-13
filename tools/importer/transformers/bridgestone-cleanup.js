/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Bridgestone cleanup.
 * Removes non-authorable content from the page DOM.
 * Selectors from captured DOM of https://tires.bridgestone.com/
 */

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Remove cookie consent banner
    WebImporter.DOMUtils.remove(element, ['.cookie-consent-container']);
  }

  if (hookName === 'afterTransform') {
    // Remove header experience fragment (nav-bar, logo, top navigation)
    WebImporter.DOMUtils.remove(element, ['.cmp-experiencefragment--header']);

    // Remove footer experience fragment
    WebImporter.DOMUtils.remove(element, ['.cmp-experiencefragment--footer']);

    // Remove link and noscript elements
    WebImporter.DOMUtils.remove(element, ['link', 'noscript']);
  }
}
