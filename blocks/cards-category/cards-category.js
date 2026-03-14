import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const hasPicture = div.querySelector('picture');
      const hasOnlyImg = div.children.length === 1
        && div.querySelector('img')
        && !div.querySelector('h1, h2, h3, h4, h5, h6, a');
      if (div.children.length === 1 && (hasPicture || hasOnlyImg)) div.className = 'cards-category-card-image';
      else div.className = 'cards-category-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
