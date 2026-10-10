// Measure device-mockup screen cutouts by alpha-channel detection.
// Produces the hole {L,T,W,H} fractions used in CustomizerPreview.tsx device specs.
// Usage: node scripts/measure-device-mockups.mjs
// Requires: sharp (already a dependency).
import sharp from 'sharp';

const FILES = {
  iphone18pm: 'public/devices/mockup-apple-iphone-18-pro-max.webp',
  s26ultra:   'public/devices/mockup-samsung-galaxy-s26-ultra.webp',
  ipadpro11:  'public/devices/mockup-apple-ipad-pro-11.webp',
  macbook:    'public/devices/mockup-apple-macbook-neo-2026-transparent.webp',
};
const ALPHA_THRESHOLD = 32; // alpha < this = transparent (screen cutout)

for (const [key, file] of Object.entries(FILES)) {
  const img = sharp(file).ensureAlpha();
  const { width: W, height: H } = await img.metadata();
  const buf = await img.raw().toBuffer(); // RGBA
  const a = (x, y) => buf[(y * W + x) * 4 + 3];

  // 1) opaque device bounding box
  let oL = W, oT = H, oR = -1, oB = -1;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (a(x, y) >= ALPHA_THRESHOLD) {
        if (x < oL) oL = x; if (y < oT) oT = y;
        if (x > oR) oR = x; if (y > oB) oB = y;
      }

  // 2) inner transparent screen hole via center cross-scan
  const cx = Math.floor((oL + oR) / 2);
  const cy = Math.floor((oT + oB) / 2);
  let t = cy; while (t > oT && a(cx, t - 1) < ALPHA_THRESHOLD) t--;
  let b = cy; while (b < oB && a(cx, b + 1) < ALPHA_THRESHOLD) b++;
  let l = cx; while (l > oL && a(l - 1, cy) < ALPHA_THRESHOLD) l--;
  let r = cx; while (r < oR && a(r + 1, cy) < ALPHA_THRESHOLD) r++;
  const sw = r - l + 1, sh = b - t + 1;

  console.log(`\n${key} (${W}x${H})`);
  console.log(`  holeL: ${(l / W).toFixed(4)}, holeT: ${(t / H).toFixed(4)}, holeW: ${(sw / W).toFixed(4)}, holeH: ${(sh / H).toFixed(4)},`);
  console.log(`  screen aspect w/h = ${(sw / sh).toFixed(4)}`);
}
