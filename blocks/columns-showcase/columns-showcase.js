export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-showcase-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      const hasOnlyImg = !pic
        && col.querySelector('img')
        && !col.querySelector('h1, h2, h3, h4, h5, h6, a');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-showcase-img-col');
        }
      } else if (hasOnlyImg) {
        col.classList.add('columns-showcase-img-col');
      }
    });
  });
}
