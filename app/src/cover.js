// Palm Fever Studio — the cover painter.
// Every cover this app draws is photo-led: six different photos fill six
// different panels, a giant two-layer title sits on top of them, and the
// poster furniture (stars, press quote, role tags, tagline, billing,
// barcode, gold seal) frames the whole thing like a cinema one-sheet.
// Photos are graded warm and clean; nothing halftone ever touches them.

/** Role tag printed on each photo panel, one per sample photo. */
export const PHOTO_ROLES = {
  boulevard: 'THE DRIVER',
  pier: 'THE ANGLER',
  speedboat: 'THE CAPTAIN',
  rider: 'THE RIDER',
  surfer: 'THE GETAWAY',
  neon: 'THE INSIDER',
};

/** The six sample photos, in tray order. */
export const PHOTO_ORDER = ['boulevard', 'speedboat', 'pier', 'rider', 'surfer', 'neon'];

/**
 * Four invented cover variants. Each one has its own title, script line,
 * fake-press quote, tagline, layout, warm grade and photo order — no two
 * variants ever show the same cover, and no variant borrows a game's name.
 */
export const VARIANTS = {
  palmfever: {
    key: 'palmfever',
    title: 'PALM FEVER',
    script: 'six friends, one last summer',
    quote: 'PURE GOLDEN-HOUR MAYHEM',
    paper: 'THE HARBOR GAZETTE',
    tagline: 'SIX FRIENDS · ONE COAST · NO WAY BACK',
    layout: 'heroMosaic',
    grade: 'sunset',
    photos: ['boulevard', 'speedboat', 'pier', 'rider', 'surfer', 'neon'],
    vol: 'VOL. 1',
  },
  hightide: {
    key: 'hightide',
    title: 'HIGH TIDE HUSTLE',
    script: 'the tide takes everything',
    quote: 'A SUNSET HEIST WITH HEART',
    paper: 'THE BAYSIDE BUGLE',
    tagline: 'SIX CREW · ONE HARBOR · HIGH TIDE',
    layout: 'heroThree',
    grade: 'golden',
    photos: ['speedboat', 'neon', 'boulevard', 'surfer', 'pier', 'rider'],
    vol: 'VOL. 2',
  },
  heatwave: {
    key: 'heatwave',
    title: 'HEATWAVE',
    script: 'city of lights, coast of fire',
    quote: 'NEON NIGHTS DONE RIGHT',
    paper: 'COASTAL WEEKLY',
    tagline: 'ONE NIGHT · EVERY LIGHT · NO BRAKES',
    layout: 'sixGrid',
    grade: 'neon',
    photos: ['neon', 'rider', 'speedboat', 'boulevard', 'surfer', 'pier'],
    vol: 'VOL. 3',
  },
  afterdark: {
    key: 'afterdark',
    title: 'AFTER DARK',
    script: 'when the palms go quiet',
    quote: 'MIDNIGHT ON THE BOULEVARD',
    paper: 'PALM GAZETTE',
    tagline: 'FOUR WHEELS · ONE MOON · NO WITNESSES',
    layout: 'diagonal',
    grade: 'night',
    photos: ['rider', 'neon', 'surfer', 'pier', 'speedboat', 'boulevard'],
    vol: 'VOL. 4',
  },
};

/** Warm colour grades, painted as a soft wash over the photos. */
const GRADES = {
  sunset: ['rgba(255, 150, 60, 0.10)', 'rgba(255, 70, 130, 0.14)'],
  golden: ['rgba(255, 190, 80, 0.12)', 'rgba(255, 120, 40, 0.10)'],
  neon: ['rgba(180, 60, 255, 0.10)', 'rgba(255, 60, 160, 0.14)'],
  night: ['rgba(40, 90, 200, 0.12)', 'rgba(20, 30, 90, 0.16)'],
};

/**
 * Panel rectangles for one layout, as fractions of the grid box.
 * Every layout returns exactly six rectangles, one per photo.
 */
function layoutRects(kind, x, y, w, h) {
  const r = (fx, fy, fw, fh) => ({ x: x + fx * w, y: y + fy * h, w: fw * w, h: fh * h });
  if (kind === 'heroMosaic') {
    return [
      r(0, 0, 0.62, 0.62), r(0.62, 0, 0.38, 0.31), r(0.62, 0.31, 0.38, 0.31),
      r(0, 0.62, 0.34, 0.38), r(0.34, 0.62, 0.33, 0.38), r(0.67, 0.62, 0.33, 0.38),
    ];
  }
  if (kind === 'heroThree') {
    return [
      r(0, 0, 0.62, 0.56), r(0.62, 0, 0.38, 0.28), r(0.62, 0.28, 0.38, 0.28),
      r(0, 0.56, 0.34, 0.44), r(0.34, 0.56, 0.33, 0.44), r(0.67, 0.56, 0.33, 0.44),
    ];
  }
  if (kind === 'diagonal') {
    // Staggered columns: the seams step down, then up, like a diagonal cut.
    return [
      r(0, 0, 0.34, 0.56), r(0.34, 0, 0.33, 0.44), r(0.67, 0, 0.33, 0.56),
      r(0, 0.56, 0.34, 0.44), r(0.34, 0.44, 0.33, 0.56), r(0.67, 0.56, 0.33, 0.44),
    ];
  }
  // sixGrid: three columns, two even rows.
  return [
    r(0, 0, 1 / 3, 0.5), r(1 / 3, 0, 1 / 3, 0.5), r(2 / 3, 0, 1 / 3, 0.5),
    r(0, 0.5, 1 / 3, 0.5), r(1 / 3, 0.5, 1 / 3, 0.5), r(2 / 3, 0.5, 1 / 3, 0.5),
  ];
}

/** Where each photo's face sits, so a cover-fit crop never cuts it off. */
const PHOTO_FOCUS = {
  boulevard: { x: 0.5, y: 0.22 },
  pier: { x: 0.5, y: 0.35 },
  speedboat: { x: 0.5, y: 0.35 },
  rider: { x: 0.5, y: 0.3 },
  surfer: { x: 0.5, y: 0.3 },
  neon: { x: 0.5, y: 0.42 },
};

/** Draws one photo cover-fit into a rectangle, with zoom and flip. */
function drawPhotoInto(ctx, img, rect, zoom, flip, focus) {
  if (!img || !img.naturalWidth) return;
  const gap = 3;
  const x = rect.x + gap / 2;
  const y = rect.y + gap / 2;
  const w = rect.w - gap;
  const h = rect.h - gap;
  const z = Math.max(0.5, Math.min(3, zoom || 1));
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * z;
  const sw = w / scale;
  const sh = h / scale;
  const f = focus || { x: 0.5, y: 0.5 };
  const sx = (img.naturalWidth - sw) * f.x;
  const sy = (img.naturalHeight - sh) * f.y;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (flip) {
    ctx.translate(x + w / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(x + w / 2), 0);
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

/** Small black pill with a white role tag, top-left of a panel (the giant
 *  title overlaps the panels' feet, so tags live at the top instead). */
function drawRoleTag(ctx, rect, text) {
  const size = Math.max(11, Math.min(26, rect.h * 0.085));
  ctx.font = `800 ${size}px Arial, sans-serif`;
  const pad = size * 0.55;
  const tw = ctx.measureText(text).width;
  const bx = rect.x + 8;
  const by = rect.y + 8;
  ctx.fillStyle = 'rgba(10, 5, 20, 0.82)';
  ctx.fillRect(bx, by, tw + pad * 2, size * 1.7);
  ctx.fillStyle = '#ffe9a8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + pad, by + size * 0.88);
  ctx.textBaseline = 'alphabetic';
}

/** The giant two-layer title: gradient block caps, script line over its foot. */
function drawTitleBlock(ctx, variant, w, h, gridBottom) {
  const title = variant.title.toUpperCase();
  let size = Math.min(w * 0.13, h * 0.155);
  ctx.textAlign = 'center';
  const setFont = (s) => { ctx.font = `900 ${s}px "Arial Black", Arial, sans-serif`; };
  setFont(size);
  while (ctx.measureText(title).width > w * 0.94 && size > 20) {
    size -= 4;
    setFont(size);
  }
  const baseline = gridBottom + size * 0.42;
  const grad = ctx.createLinearGradient(0, baseline - size, 0, baseline + size * 0.12);
  grad.addColorStop(0, '#ffe259');
  grad.addColorStop(0.45, '#ffa751');
  grad.addColorStop(0.8, '#ff5e8a');
  grad.addColorStop(1, '#e75480');
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#160a2e';
  ctx.lineWidth = Math.max(4, size * 0.075);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = size * 0.08;
  ctx.shadowOffsetY = size * 0.03;
  ctx.strokeText(title, w / 2, baseline);
  ctx.fillStyle = grad;
  ctx.fillText(title, w / 2, baseline);
  ctx.restore();
  // Script subtitle, overlapping the title's lower edge and the photos.
  const scriptSize = Math.max(20, size * 0.34);
  ctx.font = `italic 700 ${scriptSize}px "Brush Script MT", "Segoe Script", cursive`;
  ctx.fillStyle = '#fff7d6';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = scriptSize * 0.25;
  ctx.fillText(variant.script, w / 2, baseline + size * 0.42);
  ctx.shadowBlur = 0;
  return baseline + size * 0.42 + scriptSize * 0.5;
}

/** Deterministic little barcode, bottom-left of the frame. */
function drawBarcode(ctx, x, y, w, h) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 4, y - 4, w + 8, h + 22);
  ctx.fillStyle = '#111111';
  let bx = x;
  let seed = 11;
  while (bx < x + w - 3) {
    seed = (seed * 37 + 11) % 97;
    const bw = 1 + (seed % 4);
    if (seed % 3 !== 0) ctx.fillRect(bx, y, bw, h);
    bx += bw + 2;
  }
  ctx.font = `700 ${Math.max(9, h * 0.28)}px Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#111111';
  ctx.fillText('0 94120 26011 7', x, y + h + 15);
}

/** Gold foil seal, bottom-right of the frame. */
function drawGoldSeal(ctx, cx, cy, r) {
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#fff3b0');
  g.addColorStop(0.55, '#f5c542');
  g.addColorStop(1, '#b8860b');
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.strokeStyle = '#7a5c00';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(122, 92, 0, 0.7)';
  ctx.lineWidth = Math.max(1, r * 0.04);
  ctx.stroke();
  ctx.fillStyle = '#4a3600';
  ctx.textAlign = 'center';
  ctx.font = `900 ${r * 0.34}px Arial, sans-serif`;
  ctx.fillText('★', cx, cy - r * 0.12);
  ctx.font = `800 ${r * 0.2}px Arial, sans-serif`;
  ctx.fillText('ORIGINAL', cx, cy + r * 0.28);
  ctx.fillText('COVER ART', cx, cy + r * 0.55);
  ctx.restore();
}

/**
 * Paints one full cover onto `canvas`.
 * `images` maps photo name -> loaded image. `variant` is a VARIANTS entry.
 * `tweaks` (optional) carries per-panel zoom/flip, role tags and title text.
 */
export function drawCover(canvas, images, variant, tweaks) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const tw = tweaks || {};
  const title = (tw.title || variant.title).toUpperCase();
  const shown = { ...variant, title };
  ctx.fillStyle = '#160a2e';
  ctx.fillRect(0, 0, w, h);

  const m = Math.round(w * 0.022);
  const mastH = h * 0.068;
  const gridX = m;
  const gridY = m + mastH + h * 0.012;
  const gridW = w - m * 2;
  const gridBottom = h * 0.72;
  const gridH = gridBottom - gridY;

  // Masthead: five stars, fake-press quote, VOL badge.
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffd94d';
  ctx.font = `900 ${Math.max(13, mastH * 0.52)}px Arial, sans-serif`;
  ctx.fillText('★★★★★', m + 4, m + mastH * 0.62);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = `italic 700 ${Math.max(11, mastH * 0.34)}px Georgia, serif`;
  ctx.fillText(`“${variant.quote}”`, w / 2, m + mastH * 0.48);
  ctx.font = `700 ${Math.max(9, mastH * 0.26)}px Arial, sans-serif`;
  ctx.fillStyle = '#ffd94d';
  ctx.fillText(`— ${variant.paper}`, w / 2, m + mastH * 0.86);
  const volW = Math.max(52, w * 0.075);
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = Math.max(2, w * 0.002);
  ctx.strokeRect(w - m - volW - 4, m + mastH * 0.14, volW, mastH * 0.68);
  ctx.fillStyle = '#ffd94d';
  ctx.font = `800 ${Math.max(10, mastH * 0.3)}px Arial, sans-serif`;
  ctx.fillText(variant.vol, w - m - volW / 2 - 4, m + mastH * 0.62);

  // Six photo panels, every one a different photo.
  const rects = layoutRects(variant.layout, gridX, gridY, gridW, gridH);
  variant.photos.forEach((name, i) => {
    drawPhotoInto(ctx, images[name], rects[i], (tw.zoom || {})[name], (tw.flip || {})[name], PHOTO_FOCUS[name]);
    const role = ((tw.roles || {})[name]) || PHOTO_ROLES[name] || '';
    if (role) drawRoleTag(ctx, rects[i], role);
  });
  // Thin white seams + dark frame around the grid.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2;
  ctx.strokeRect(gridX, gridY, gridW, gridH);

  // Warm clean grade over the photos (no halftone, ever).
  const [gTop, gBot] = GRADES[variant.grade] || GRADES.sunset;
  const wash = ctx.createLinearGradient(0, gridY, 0, gridBottom);
  wash.addColorStop(0, gTop);
  wash.addColorStop(1, gBot);
  ctx.fillStyle = wash;
  ctx.fillRect(gridX, gridY, gridW, gridH);

  // Giant gradient title + script subtitle overlapping title and photos.
  const afterScript = drawTitleBlock(ctx, shown, w, h, gridBottom);

  // Tagline strip, then the bottom row: barcode left, billing centre,
  // COMING SOON above the gold seal on the right. Each line gets its own
  // computed y so nothing ever prints on top of another line.
  const stripY = afterScript + h * 0.018;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd94d';
  ctx.font = `800 ${Math.max(11, h * 0.017)}px Arial, sans-serif`;
  ctx.fillText(variant.tagline, w / 2, stripY + h * 0.014);

  const sealR = Math.min(w, h) * 0.042;
  const billY1 = stripY + h * 0.032;
  const billY2 = stripY + h * 0.054;
  drawBarcode(ctx, m + 8, stripY + h * 0.006, Math.max(64, w * 0.11), h * 0.028);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = `700 ${Math.max(9, h * 0.0125)}px Arial, sans-serif`;
  ctx.fillText('A SUNSET PICTURES PRODUCTION · STARRING YOU', w / 2, billY1);
  ctx.fillText('SHOT ON YOUR OWN CAMERA · GRADED BY HAND', w / 2, billY2);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${Math.max(12, h * 0.02)}px Arial, sans-serif`;
  ctx.fillText('COMING SOON', w - m - 8, h - m - sealR * 2 - h * 0.008);
  drawGoldSeal(ctx, w - m - sealR, h - m - sealR, sealR);

  // Outer frame.
  ctx.strokeStyle = '#f5c542';
  ctx.lineWidth = Math.max(3, w * 0.004);
  ctx.strokeRect(m / 2, m / 2, w - m, h - m);
}
