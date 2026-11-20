// Palm Fever Studio — the editor.
// Wizard: 1 Add photos -> 2 Caption & style -> 3 Export PNG.
// The live preview always shows a DIFFERENT variant from the flagship
// cover (AFTER DARK by default), so the editor proves the app makes many
// covers, not one. Photos come from the person's own machine; the six
// samples below are only the starter tray.

import { drawCover, PHOTO_ORDER, PHOTO_ROLES, VARIANTS } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const titleInput = document.getElementById('title');
const scriptInput = document.getElementById('script');
const statusEl = document.getElementById('status');
const trayEl = document.getElementById('tray');
const zoomEl = document.getElementById('zoom');
const roleEl = document.getElementById('role');
const panelNameEl = document.getElementById('panelName');
const previewNoteEl = document.getElementById('previewNote');
const variantButtons = [...document.querySelectorAll('[data-variant]')];
const layoutButtons = [...document.querySelectorAll('[data-layout]')];
const gradeButtons = [...document.querySelectorAll('[data-grade]')];

const state = {
  variantKey: 'afterdark',
  layout: 'diagonal',
  grade: 'night',
  photos: {}, // name -> loaded image
  order: [...PHOTO_ORDER],
  zoom: {},
  flip: {},
  roles: { ...PHOTO_ROLES },
  selected: 'boulevard',
};

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** The variant the preview shows, with the editor's layout/grade applied. */
function currentVariant() {
  const base = VARIANTS[state.variantKey];
  return { ...base, layout: state.layout, grade: state.grade, photos: state.order };
}

function redraw() {
  drawCover(canvas, state.photos, currentVariant(), {
    title: titleInput.value,
    script: scriptInput.value,
    zoom: state.zoom,
    flip: state.flip,
    roles: state.roles,
  });
  const v = VARIANTS[state.variantKey];
  previewNoteEl.textContent = `Live preview — “${v.title}” (${v.vol}), a different cover from the flagship “PALM FEVER”. Change the variant, layout or grade and the preview follows.`;
}

/** Builds the photo tray: six different photos, each with its role tag. */
function renderTray() {
  trayEl.innerHTML = '';
  state.order.forEach((name) => {
    const img = state.photos[name];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumb' + (state.selected === name ? ' selected' : '');
    button.title = `${name} — ${state.roles[name] || ''}`;
    if (img) {
      const thumb = document.createElement('img');
      thumb.src = img.src;
      thumb.alt = name;
      button.appendChild(thumb);
    }
    const tag = document.createElement('span');
    tag.textContent = state.roles[name] || name.toUpperCase();
    button.appendChild(tag);
    button.addEventListener('click', () => {
      state.selected = name;
      panelNameEl.textContent = name;
      zoomEl.value = state.zoom[name] || 1;
      roleEl.value = state.roles[name] || '';
      renderTray();
    });
    trayEl.appendChild(button);
  });
}

function markActive(buttons, value, attr) {
  buttons.forEach((b) => b.classList.toggle('active', b.dataset[attr] === value));
}

function setStep(n) {
  document.querySelectorAll('.step').forEach((el) => {
    el.classList.toggle('done', Number(el.dataset.step) < n);
    el.classList.toggle('now', Number(el.dataset.step) === n);
  });
}

variantButtons.forEach((b) => {
  b.addEventListener('click', () => {
    applyVariant(b.dataset.variant);
    setStep(2);
    redraw();
  });
});
layoutButtons.forEach((b) => {
  b.addEventListener('click', () => {
    state.layout = b.dataset.layout;
    markActive(layoutButtons, state.layout, 'layout');
    setStep(2);
    redraw();
  });
});
gradeButtons.forEach((b) => {
  b.addEventListener('click', () => {
    state.grade = b.dataset.grade;
    markActive(gradeButtons, state.grade, 'grade');
    setStep(2);
    redraw();
  });
});

titleInput.addEventListener('input', redraw);
scriptInput.addEventListener('input', redraw);
zoomEl.addEventListener('input', () => {
  state.zoom[state.selected] = Number(zoomEl.value);
  redraw();
});
roleEl.addEventListener('input', () => {
  state.roles[state.selected] = roleEl.value.toUpperCase();
  renderTray();
  redraw();
});
document.getElementById('flip').addEventListener('click', () => {
  state.flip[state.selected] = !state.flip[state.selected];
  redraw();
});
document.getElementById('swap').addEventListener('click', () => {
  // Swap this panel's photo with the next panel's photo.
  const i = state.order.indexOf(state.selected);
  const j = (i + 1) % state.order.length;
  [state.order[i], state.order[j]] = [state.order[j], state.order[i]];
  renderTray();
  redraw();
});
document.getElementById('resetPanel').addEventListener('click', () => {
  state.zoom[state.selected] = 1;
  state.flip[state.selected] = false;
  state.roles[state.selected] = PHOTO_ROLES[state.selected] || '';
  zoomEl.value = 1;
  roleEl.value = state.roles[state.selected];
  renderTray();
  redraw();
});

/** Adds the person's own photos to the tray (never uploaded anywhere). */
document.getElementById('photo').addEventListener('change', async (e) => {
  const files = [...e.target.files].slice(0, 6);
  for (const file of files) {
    const name = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-') || `photo-${state.order.length + 1}`;
    const img = await loadImage(URL.createObjectURL(file));
    state.photos[name] = img;
    if (!state.order.includes(name)) {
      state.order.push(name);
      state.roles[name] = 'THE NEWCOMER';
    }
  }
  setStep(2);
  renderTray();
  redraw();
  statusEl.textContent = `${files.length} photo(s) added to your tray.`;
});

/** Renders the current cover at a post size and downloads it as a PNG. */
function exportPng(w, h, label) {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawCover(off, state.photos, currentVariant(), {
    title: titleInput.value,
    script: scriptInput.value,
    zoom: state.zoom,
    flip: state.flip,
    roles: state.roles,
  });
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `palm-fever-${label}.png`;
    a.click();
    statusEl.textContent = `Saved palm-fever-${label}.png (${w} x ${h}).`;
  }, 'image/png');
}

document.querySelectorAll('[data-export]').forEach((b) => {
  b.addEventListener('click', () => {
    const [w, h] = b.dataset.export.split('x').map(Number);
    setStep(3);
    exportPng(w, h, b.dataset.export);
  });
});
document.getElementById('exportAll').addEventListener('click', () => {
  setStep(3);
  exportPng(1080, 1080, '1080x1080');
  exportPng(1080, 1350, '1080x1350');
  exportPng(1920, 1080, '1920x1080');
  statusEl.textContent = 'Exported all three sizes: 1080 x 1080, 1080 x 1350, 1920 x 1080.';
});

/** Loads the six starter photos, then paints the editor. */
async function boot() {
  for (const name of PHOTO_ORDER) {
    state.photos[name] = await loadImage(`samples/${name}.jpg`);
    state.zoom[name] = 1;
  }
  panelNameEl.textContent = state.selected;
  roleEl.value = state.roles[state.selected];
  applyVariant(state.variantKey);
  setStep(1);
  renderTray();
  redraw();
}

/** Applies a variant to the editor: its layout, grade, title and script. */
function applyVariant(key) {
  const v = VARIANTS[key];
  state.variantKey = key;
  state.layout = v.layout;
  state.grade = v.grade;
  titleInput.value = v.title;
  scriptInput.value = v.script;
  markActive(variantButtons, key, 'variant');
  markActive(layoutButtons, state.layout, 'layout');
  markActive(gradeButtons, state.grade, 'grade');
}

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), {
    state,
    loadImage,
    redraw,
    renderTray,
    applyVariant,
    setCanvasSize(w, h) { canvas.width = w; canvas.height = h; },
  });
} else {
  boot();
}
