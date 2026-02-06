document.addEventListener('DOMContentLoaded', function () {
  const projects = [
    { title: 'Project One', desc: 'An experimental landing with motion UI.', img: 'assets/projects/proj1.jpg', tags: ['Landing','Motion'] },
    { title: 'Project Two', desc: 'Promo page and hero treatment.', img: 'assets/projects/proj2.jpg', tags: ['Promo','Brand'] },
    { title: 'Project Three', desc: 'Micro-site focused on conversions.', img: 'assets/projects/proj3.jpg', tags: ['Microsite'] },
    { title: 'Project Four', desc: 'App concept with device mockups.', img: 'assets/projects/proj4.jpg', tags: ['App','Mockup'] },
    { title: 'Project Five', desc: 'E-commerce landing concept.', img: 'assets/projects/proj5.jpg', tags: ['E‑comm'] },
    { title: 'Project Six', desc: 'Portfolio showcase demo.', img: 'assets/projects/proj6.jpg', tags: ['Showcase'] }
  ];

  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;

  projects.forEach(p => {
    const card = document.createElement('article');
    card.className = 'project-card';

    const link = document.createElement('a');
    link.className = 'project-link';
    link.href = '#';

    const cover = document.createElement('div');
    cover.className = 'project-cover';
    const img = document.createElement('img');
    img.src = p.img;
    img.alt = p.title;
    cover.appendChild(img);

    const body = document.createElement('div');
    body.className = 'project-body';
    const h3 = document.createElement('h3');
    h3.textContent = p.title;
    const pDesc = document.createElement('p');
    pDesc.className = 'project-short';
    pDesc.textContent = p.desc;

    const tagRow = document.createElement('div');
    p.tags.forEach(t => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = t;
      tagRow.appendChild(span);
    });

    body.appendChild(h3);
    body.appendChild(pDesc);
    body.appendChild(tagRow);

    link.appendChild(cover);
    link.appendChild(body);
    card.appendChild(link);
    grid.appendChild(card);
  });
});