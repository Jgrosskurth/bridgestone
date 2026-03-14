export default function decorate(block) {
  const firstRow = block.querySelector(':scope > div:first-child');
  const firstCol = firstRow?.querySelector(':scope > div:first-child');
  const pic = firstCol?.querySelector('picture');
  const img = firstCol?.querySelector('img');
  const mediaEl = pic || img;

  if (!mediaEl) {
    block.classList.add('no-image');
    return;
  }

  // Wrap standalone <img> in <picture> if needed
  if (!pic && img) {
    const picture = document.createElement('picture');
    img.parentNode.replaceChild(picture, img);
    picture.appendChild(img);
  }

  // Move the picture element to be a direct child of the block for background positioning
  const pictureEl = block.querySelector('picture');
  if (pictureEl) {
    block.prepend(pictureEl);
  }

  // Remove the now-empty image column
  if (firstCol && !firstCol.textContent.trim()) {
    firstCol.remove();
  }

  // If the first row is now empty or has only one child, flatten it
  if (firstRow && firstRow.children.length <= 1) {
    const textCol = firstRow.querySelector(':scope > div');
    if (textCol) {
      // Move text column content up
      while (textCol.firstChild) firstRow.parentNode.insertBefore(textCol.firstChild, firstRow);
      firstRow.remove();
    }
  }
}
