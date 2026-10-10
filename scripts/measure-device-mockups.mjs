// Measure device-mockup screen cutouts by alpha-channel flood-fill.
// The screen is the INTERIOR transparent region (not the outer transparent margin),
// found by flood-filling transparent pixels from the image borders, then taking the
// bounding box of the remaining interior-transparent pixels.
// Produces hole {L,T,W,H} fractions + corner radius used in CustomizerPreview specs.
// Usage: node scripts/measure-device-mockups.mjs   (requires sharp)
import sharp from 'sharp';

const FILES = {
  iphone18pm: 'public/devices/mockup-apple-iphone-18-pro-max.webp',
  s26ultra:   'public/devices/mockup-samsung-galaxy-s26-ultra.webp',
  ipadpro11:  'public/devices/mockup-apple-ipad-pro-11.webp',
  macbook:    'public/devices/mockup-apple-macbook-neo-2026-transparent.webp',
};
const AT = 32; // alpha < this = transparent

for (const [key, file] of Object.entries(FILES)) {
  const img = sharp(file).ensureAlpha();
  const { width: W, height: H } = await img.metadata();
  const buf = await img.raw().toBuffer();
  const alpha = (i) => buf[i * 4 + 3];
  const idx = (x, y) => y * W + x;

  // Flood-fill transparent region reachable from the borders = OUTER margin.
  const outer = new Uint8Array(W * H);
  const stack = [];
  const seed = (i) => { if (alpha(i) < AT && !outer[i]) { outer[i] = 1; stack.push(i); } };
  for (let x = 0; x < W; x++) { seed(idx(x, 0)); seed(idx(x, H - 1)); }
  for (let y = 0; y < H; y++) { seed(idx(0, y)); seed(idx(W - 1, y)); }
  while (stack.length) {
    const i = stack.pop(); const x = i % W, y = (i - x) / W;
    if (x > 0) seed(idx(x - 1, y));
    if (x < W - 1) seed(idx(x + 1, y));
    if (y > 0) seed(idx(x, y - 1));
    if (y < H - 1) seed(idx(x, y + 1));
  }

  // Interior transparent = the real screen hole.
  let sL = W, sT = H, sR = -1, sB = -1;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = idx(x, y);
      if (alpha(i) < AT && !outer[i]) {
        if (x < sL) sL = x; if (y < sT) sT = y;
        if (x > sR) sR = x; if (y > sB) sB = y;
      }
    }
  const sw = sR - sL + 1, sh = sB - sT + 1;

  // Corner radius: along the hole's top edge/left edge, distance until the curve clears.
  let rx = sL; while (rx < sR && (alpha(idx(rx, sT)) >= AT || outer[idx(rx, sT)])) rx++;
  let ry = sT; while (ry < sB && (alpha(idx(sL, ry)) >= AT || outer[idx(sL, ry)])) ry++;
  const radiusPx = Math.max(rx - sL, ry - sT);

  console.log(`\n${key} (${W}x${H})`);
  console.log(`  holeL: ${(sL / W).toFixed(4)}, holeT: ${(sT / H).toFixed(4)}, holeW: ${(sw / W).toFixed(4)}, holeH: ${(sh / H).toFixed(4)},`);
  console.log(`  cornerPct: ${(radiusPx / sw).toFixed(4)}, // of hole width`);
  console.log(`  screen aspect w/h = ${(sw / sh).toFixed(4)}`);
}
