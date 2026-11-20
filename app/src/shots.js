// Fixed scenes for screenshots: ?shot=cover paints one exported cover alone,
// ?shot=editor shows the whole editor with a photo loaded and a variant
// cover in the live preview. `variant` picks the cover, `size` picks the
// post size (square, portrait, landscape). window.__shotReady is set once
// the scene has painted, so a screenshot tool knows when to shoot.
import { PHOTO_ORDER, VARIANTS } from './cover.js';

const SIZES = {
  square: [1080, 1080],
  portrait: [1080, 1350],
  landscape: [1920, 1080],
};

export async function runShot(shot, query, api) {
  const { state, loadImage } = api;
  for (const name of PHOTO_ORDER) {
    state.photos[name] = await loadImage(`samples/${name}.jpg`);
    state.zoom[name] = 1;
  }
  if (shot === 'cover') {
    const variant = VARIANTS[query.get('variant')] || VARIANTS.palmfever;
    const [w, h] = SIZES[query.get('size')] || SIZES.square;
    api.setCanvasSize(w, h);
    api.applyVariant(variant.key);
    state.order = [...variant.photos];
    document.body.classList.add('shot-cover');
  } else {
    // Editor shot: the tray holds six different photos and the live preview
    // shows the AFTER DARK variant, never the flagship cover.
    api.applyVariant('afterdark');
  }
  api.renderTray();
  api.redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
