import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const hasPicture = div.querySelector('picture');
      const hasOnlyImg = div.children.length === 1
        && div.querySelector('img')
        && !div.querySelector('h1, h2, h3, h4, h5, h6, a');
      if (div.children.length === 1 && (hasPicture || hasOnlyImg)) div.className = 'cards-promo-card-image';
      else div.className = 'cards-promo-card-body';
    });

    // Create promo overlay from first h4 + following p in card body
    const body = li.querySelector('.cards-promo-card-body');
    const imageDiv = li.querySelector('.cards-promo-card-image');
    if (body && imageDiv) {
      const firstH4 = body.querySelector('h4:first-child');
      if (firstH4) {
        const overlay = document.createElement('div');
        overlay.className = 'cards-promo-overlay';
        const amount = document.createElement('div');
        amount.className = 'cards-promo-overlay-amount';
        amount.textContent = firstH4.textContent;
        overlay.append(amount);
        // Check if next sibling is a p (subtitle text)
        const nextP = firstH4.nextElementSibling;
        if (nextP && nextP.tagName === 'P') {
          const subtitle = document.createElement('div');
          subtitle.className = 'cards-promo-overlay-subtitle';
          subtitle.textContent = nextP.textContent;
          overlay.append(subtitle);
          nextP.remove();
        }
        firstH4.remove();
        imageDiv.append(overlay);
      }
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
