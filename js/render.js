// SVG rendering of a grid, in millimetres so the same SVG works at real scale.
// Tile mode: 1-inch (25.4 mm) tiles with a grout gap. Bead mode: ~5 mm beads, split into 29 x 29 pegboards.
(function (g) {
  const TILE_MM = 25.4, BEAD_MM = 5, BOARD = 29;
  function geom(grid, o = {}){
    const bead = o.mode === 'bead', gap = bead ? 0 : (o.gap ?? 3), pitch = bead ? BEAD_MM : TILE_MM + gap;
    return { bead, gap, pitch, W: grid.w * pitch + (bead ? 0 : gap), H: grid.h * pitch + (bead ? 0 : gap) };
  }
  // the body of the drawing (no <svg> wrapper), so exports can add rulers and labels around it
  function body(grid, o = {}){
    const pal = g.TesseraPalette.byKey, st = g.TesseraStyles[grid.style], G = geom(grid, o), p = G.pitch, out = [];
    if (G.bead){
      out.push(`<rect width="${G.W}" height="${G.H}" fill="#EEECE6"/>`);
      for (let y = 0; y < grid.h; y++) for (let x = 0; x < grid.w; x++){
        const cx = (x + 0.5) * p, cy = (y + 0.5) * p;
        out.push(`<circle cx="${cx}" cy="${cy}" r="${(p * 0.46).toFixed(2)}" fill="${pal[grid.cells[y][x]].hex}"/><circle cx="${cx}" cy="${cy}" r="${(p * 0.16).toFixed(2)}" fill="#0003"/>`);
      }
      if (o.boards !== false){   // pegboard splits
        for (let x = BOARD; x < grid.w; x += BOARD) out.push(`<line x1="${x * p}" y1="0" x2="${x * p}" y2="${G.H}" stroke="#E0457B" stroke-width="0.6" stroke-dasharray="2 1.2"/>`);
        for (let y = BOARD; y < grid.h; y += BOARD) out.push(`<line x1="0" y1="${y * p}" x2="${G.W}" y2="${y * p}" stroke="#E0457B" stroke-width="0.6" stroke-dasharray="2 1.2"/>`);
      }
    } else {
      out.push(`<rect width="${G.W}" height="${G.H}" fill="${o.grout || (st && st.grout) || '#D8D4CC'}"/>`);
      const t = TILE_MM, r = (t * 0.05).toFixed(2);
      for (let y = 0; y < grid.h; y++) for (let x = 0; x < grid.w; x++)
        out.push(`<rect x="${(G.gap + x * p).toFixed(2)}" y="${(G.gap + y * p).toFixed(2)}" width="${t}" height="${t}" rx="${r}" fill="${pal[grid.cells[y][x]].hex}"/>`);
    }
    return { svg: out.join(''), ...G };
  }
  function svg(grid, o = {}){
    const b = body(grid, o);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${b.W} ${b.H}" role="img" aria-label="Mosaic sign preview">${b.svg}</svg>`;
  }
  function boards(grid){ return { cols: Math.ceil(grid.w / BOARD), rows: Math.ceil(grid.h / BOARD), n: Math.ceil(grid.w / BOARD) * Math.ceil(grid.h / BOARD) }; }
  g.TesseraRender = { svg, body, geom, boards, TILE_MM, BEAD_MM, BOARD };
})(typeof window !== 'undefined' ? window : globalThis);
