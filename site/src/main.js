const app = document.querySelector('#app');

const professors = [
  { id: 'noether', name: 'Emmy Noether', years: '1882 — 1935', portrait: 'assets/portraits/emmy-noether.jpg', source: 'Portrait of Emmy Noether, c. 1900' },
  { id: 'grothendieck', name: 'Alexander Grothendieck', years: '1928 — 2014', portrait: 'assets/portraits/alexander-grothendieck.jpg', source: 'Alexander Grothendieck, 1970' },
  { id: 'bezout', name: 'Étienne Bézout', years: '1730 — 1783', portrait: 'assets/portraits/etienne-bezout.jpg', source: 'Portrait of Étienne Bézout' },
  { id: 'hironaka', name: 'Heisuke Hironaka', years: '1931 — 2026', portrait: 'assets/portraits/heisuke-hironaka.jpg', source: 'Heisuke Hironaka, 2020' },
];

const returnToWallpaper = new URLSearchParams(location.search).get('level') === 'wallpaper';
let screen = returnToWallpaper ? 'puzzle' : 'title';
let selectedProfessor = returnToWallpaper ? professors.find(p => p.id === 'noether') : null;
let corridorPage = 0;

function render() {
  if (screen === 'title') renderTitle();
  if (screen === 'corridor') renderCorridor();
  if (screen === 'office') renderOffice();
  if (screen === 'puzzle') renderPuzzle();
}

function renderTitle() {
  app.innerHTML = `
    <section class="stage title-scene">
      <div class="scene-shade"></div>
      <div class="title-mark"><h1>Hartshorne</h1><button class="play-button" id="play">Play <span>→</span></button></div>
    </section>`;
  document.querySelector('#play').addEventListener('click', () => { screen = 'corridor'; render(); });
}

function renderCorridor() {
  const shown = professors.slice(corridorPage * 4, corridorPage * 4 + 4);
  app.innerHTML = `
    <section class="stage corridor-scene">
      <div class="scene-shade corridor-shade"></div>
      <header class="scene-header"><button class="back-link" id="home" aria-label="Back to library">←</button></header>
      <div class="corridor-choices">${shown.map((p, i) => `
        <button class="door-choice d${i}" data-prof="${p.id}" aria-label="Enter ${p.name}'s office">
          <span class="portrait"><img src="${p.portrait}" alt="${p.source}" /></span>
          <span class="name-plaque"><span class="name">${p.name}</span></span>
        </button>`).join('')}</div>
      <button class="corridor-arrow left" aria-label="Previous corridor" ${corridorPage === 0 ? 'disabled' : ''}>‹</button>
      <button class="corridor-arrow right" aria-label="Next corridor" disabled>›</button>
    </section>`;
  document.querySelector('#home').addEventListener('click', () => { screen = 'title'; render(); });
  document.querySelectorAll('.door-choice').forEach(btn => btn.addEventListener('click', () => {
    selectedProfessor = professors.find(p => p.id === btn.dataset.prof);
    screen = 'office'; render();
  }));
}

function renderOffice() {
  app.innerHTML = `
    <section class="stage office-scene room-${selectedProfessor.id}">
      <div class="office-wash"></div>
      <header class="scene-header office-header"><button class="back-link" id="back-corridor" aria-label="Back to corridor">←</button><div class="header-center"><h1>${selectedProfessor.name}</h1></div></header>
      ${selectedProfessor.id === 'noether' ? '<button class="crest-hotspot" data-object="crest" aria-label="Open Wallpaper Symmetry Groups"></button>' : ''}
    </section>`;
  document.querySelector('#back-corridor').addEventListener('click', () => { screen = 'corridor'; render(); });
  document.querySelectorAll('.crest-hotspot').forEach(btn => btn.addEventListener('click', () => {
    screen = 'puzzle'; render();
  }));
}

function renderPuzzle() {
  app.innerHTML = `
    <section class="stage office-scene room-${selectedProfessor.id} puzzle-scene">
      <div class="office-wash"></div>
      <button class="back-link puzzle-back" id="back-office">← ${selectedProfessor.name}'s office</button>
      <div class="puzzle-card">
        <h1>Wallpaper Symmetry Groups</h1>
        <p class="level-placeholder">Artin M.5 · Fundamental domains</p>
        <div class="level-exercises">
          <a href="wallpaper-lab/hippo-prototype/assignment.html?pattern=1"><span>01</span><strong>Hippo heads</strong><small>Parts C and D</small></a>
          <a href="wallpaper-lab/hippo-prototype/assignment.html?pattern=16"><span>16</span><strong>Fleur-de-lys</strong><small>Parts C and D</small></a>
        </div>
        <a class="matching-link" href="wallpaper-lab/hippo-prototype/assignment.html">Match point groups · the other 15 patterns →</a>
      </div>
    </section>`;
  document.querySelector('#back-office').addEventListener('click', () => { screen = 'office'; render(); });
}

render();
