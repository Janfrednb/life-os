import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';

function crc32(buf) {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = t[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const tb = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const ci = Buffer.concat([tb, data]);
  const cv = Buffer.alloc(4); cv.writeUInt32BE(crc32(ci));
  return Buffer.concat([len, tb, data, cv]);
}

function makePNG(size, drawFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // RGBA

  // Raw: each row = 1 filter byte + size*4 RGBA bytes
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 4)] = 0; // filter None
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = drawFn(x, y, size);
      const off = y * (1 + size * 4) + 1 + x * 4;
      raw[off] = r; raw[off+1] = g; raw[off+2] = b; raw[off+3] = a;
    }
  }

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflateSync(raw)),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

// Icon design: dark bg, rounded rect background, green circle, dot
function drawIcon(x, y, size) {
  const cx = size / 2, cy = size / 2;
  const dx = x - cx, dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const r = size / 2;

  // Rounded square mask (corner radius = 22.5% of size)
  const cr = size * 0.225;
  const ax = Math.abs(dx), ay = Math.abs(dy);
  const inRoundedRect =
    ax <= size / 2 - cr || ay <= size / 2 - cr ||
    Math.hypot(ax - (size / 2 - cr), ay - (size / 2 - cr)) <= cr;

  if (!inRoundedRect) return [0, 0, 0, 0]; // transparent outside

  // Background: #080e08
  const bg = [8, 14, 8, 255];

  // Outer glow ring: 38-42% radius
  const pct = dist / r;
  if (pct >= 0.36 && pct <= 0.42) return [22, 48, 22, 255];

  // Green filled circle: < 36% radius
  if (pct < 0.36) {
    // Inner bright dot: < 16%
    if (pct < 0.16) return [100, 220, 130, 255];
    return [34, 197, 94, 255]; // #22c55e
  }

  return bg;
}

mkdirSync('public', { recursive: true });
writeFileSync('public/icon-192.png', makePNG(192, drawIcon));
writeFileSync('public/icon-512.png', makePNG(512, drawIcon));
console.log('Icons generated: public/icon-192.png, public/icon-512.png');
