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
      if (div.children.length === 1 && (hasPicture || hasOnlyImg)) div.className = 'cards-article-card-image';
      else div.className = 'cards-article-card-body';
    });

    // Make entire card clickable if there's a link in the body
    const body = li.querySelector('.cards-article-card-body');
    if (body) {
      const link = body.querySelector('a');
      if (link) {
        const href = link.getAttribute('href');
        li.style.cursor = 'pointer';
        li.addEventListener('click', (e) => {
          if (!e.target.closest('a')) {
            window.location.href = href;
          }
        });
        // Remove the "Read More" link paragraph to match original
        const linkP = link.closest('p');
        if (linkP) linkP.remove();
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
