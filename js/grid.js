// One grid model drives the preview and every export.
(function (g) {
  const MAX_LETTERS = 15;
  function letterCount(s){ return [...s].filter(c => c !== ' ').length; }
  function build(o){
    const F = g.TesseraFonts, font = F.fonts[o.font || 'block'], small = F.fonts.mini, st = g.TesseraStyles[o.style || 'bathhouse'];
    const l1 = F.rasterLine((o.line1 || '').trim(), font), l2t = (o.line2 || '').trim(), l2 = l2t ? F.rasterLine(l2t, small) : null;
    const gap = l2 ? Math.max(1, Math.round(font.h / 4)) : 0;
    const tw = Math.max(l1.w, l2 ? l2.w : 0), th = l1.h + (l2 ? gap + l2.h : 0);
    const margin = o.margin ?? 2, bw = o.border ?? 2;
    let W = tw + 2 * (margin + bw), H = th + 2 * (margin + bw), fit = true;
    if (o.width && o.height){ W = o.width; H = o.height; fit = tw <= W - 2 * bw && th <= H - 2 * bw; }
    const cells = []; for (let y = 0; y < H; y++) cells.push(new Array(W).fill(st.field));
    // border band, walked clockwise so patterns run continuously around the corners
    const n = 2 * (W + H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
      const d = Math.min(x, y, W - 1 - x, H - 1 - y); if (d >= bw) continue;
      let i; if (y === d) i = x; else if (x === W - 1 - d) i = W + y; else if (y === H - 1 - d) i = W + H + (W - 1 - x); else i = 2 * W + H + (H - 1 - y);
      cells[y][x] = st.border(i, d, bw, n, x, y, W, H);
    }
    const oy = Math.floor((H - th) / 2);
    const put = (bm, top, key) => { const ox = Math.floor((W - bm.w) / 2);
      for (let y = 0; y < bm.h; y++) for (let x = 0; x < bm.w; x++) if (bm.px[y][x]){ const X = ox + x, Y = top + y; if (X >= bw && Y >= bw && X < W - bw && Y < H - bw) cells[Y][X] = key; } };
    put(l1, oy, st.letter); if (l2) put(l2, oy + l1.h + gap, st.letter2 || st.letter);
    return { w: W, h: H, cells, fit, style: o.style || 'bathhouse' };
  }
  function counts(grid){ const c = {}; grid.cells.forEach(r => r.forEach(k => c[k] = (c[k] || 0) + 1)); return c; }
  g.TesseraGrid = { build, counts, letterCount, MAX_LETTERS };
})(typeof window !== 'undefined' ? window : globalThis);
