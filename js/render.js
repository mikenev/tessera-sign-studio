// SVG rendering of a grid. Units are millimetres so the same SVG can be exported at real scale.
(function (g) {
  const TILE_MM = 25.4;
  function svg(grid, o = {}){
    const pal = g.TesseraPalette.byKey, pitch = o.pitch || TILE_MM + 3, gap = o.gap ?? 3, W = grid.w * pitch, H = grid.h * pitch;
    const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ${o.realScale ? `width="${W}mm" height="${H}mm"` : ''} role="img" aria-label="Mosaic sign preview">`,
      `<rect width="${W}" height="${H}" fill="${o.grout || '#D8D4CC'}"/>`];
    for (let y = 0; y < grid.h; y++) for (let x = 0; x < grid.w; x++)
      out.push(`<rect x="${(x * pitch + gap / 2).toFixed(2)}" y="${(y * pitch + gap / 2).toFixed(2)}" width="${(pitch - gap).toFixed(2)}" height="${(pitch - gap).toFixed(2)}" rx="${(pitch * 0.06).toFixed(2)}" fill="${pal[grid.cells[y][x]].hex}"/>`);
    out.push('</svg>'); return out.join('');
  }
  g.TesseraRender = { svg, TILE_MM };
})(typeof window !== 'undefined' ? window : globalThis);
