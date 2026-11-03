// Real-scale exports. One display list in millimetres (the "sheet") is drawn three ways: SVG, PNG (canvas) and PDF.
(function (g) {
  const R = () => g.TesseraRender, pal = () => g.TesseraPalette.byKey;
  const MM_PT = 72 / 25.4;
  // ---------- the sheet: the sign plus optional grid overlay, row/column numbers, a 1:1 ruler and the bill of materials ----------
  function sheet(grid, o = {}){
    const geo = R().geom(grid, o), it = [], st = g.TesseraStyles[grid.style], P = pal();
    const pad = o.overlay === false ? 6 : 12, ox = pad, oy = pad, p = geo.pitch, off = geo.bead ? 0 : geo.gap / 2;
    // pieces
    if (geo.bead){
      it.push({ t: 'rect', x: ox, y: oy, w: geo.W, h: geo.H, fill: '#EEECE6' });
      for (let y = 0; y < grid.h; y++) for (let x = 0; x < grid.w; x++){
        const cx = ox + (x + 0.5) * p, cy = oy + (y + 0.5) * p;
        it.push({ t: 'circ', cx, cy, r: p * 0.46, fill: P[grid.cells[y][x]].hex }, { t: 'circ', cx, cy, r: p * 0.16, fill: '#00000033' });
      }
    } else {
      it.push({ t: 'rect', x: ox, y: oy, w: geo.W, h: geo.H, fill: (st && st.grout) || '#D8D4CC' });
      for (let y = 0; y < grid.h; y++) for (let x = 0; x < grid.w; x++)
        it.push({ t: 'rect', x: ox + geo.gap + x * p, y: oy + geo.gap + y * p, w: R().TILE_MM, h: R().TILE_MM, fill: P[grid.cells[y][x]].hex });
    }
    // grid overlay with row and column numbers (every cell for tiles, every 5th for beads)
    if (o.overlay !== false){
      const every = geo.bead ? 5 : 1, fs = geo.bead ? 2.6 : 4;
      for (let x = 0; x <= grid.w; x++){ const X = ox + off + x * p; it.push({ t: 'line', x1: X, y1: oy, x2: X, y2: oy + geo.H, stroke: (x % (geo.bead ? 29 : 1e9) === 0 && geo.bead) ? '#E0457B' : '#00000055', w: geo.bead && x % 29 === 0 ? 0.5 : 0.15 }); }
      for (let y = 0; y <= grid.h; y++){ const Y = oy + off + y * p; it.push({ t: 'line', x1: ox, y1: Y, x2: ox + geo.W, y2: Y, stroke: (geo.bead && y % 29 === 0) ? '#E0457B' : '#00000055', w: geo.bead && y % 29 === 0 ? 0.5 : 0.15 }); }
      for (let x = 0; x < grid.w; x++) if ((x + 1) % every === 0 || x === 0){ const X = ox + off + (x + 0.5) * p; it.push({ t: 'text', x: X, y: oy - 2.5, s: String(x + 1), size: fs, anchor: 'middle' }, { t: 'text', x: X, y: oy + geo.H + 2.5 + fs * 0.7, s: String(x + 1), size: fs, anchor: 'middle' }); }
      for (let y = 0; y < grid.h; y++) if ((y + 1) % every === 0 || y === 0){ const Y = oy + off + (y + 0.5) * p + fs * 0.35; it.push({ t: 'text', x: ox - 2, y: Y, s: String(y + 1), size: fs, anchor: 'end' }, { t: 'text', x: ox + geo.W + 2, y: Y, s: String(y + 1), size: fs, anchor: 'start' }); }
    }
    let y = oy + geo.H + (o.overlay === false ? 8 : 14);
    // 1:1 rulers: 100 mm with millimetre ticks, and 4 inches with eighth-inch ticks
    const rul = (x0, y0) => {
      it.push({ t: 'text', x: x0, y: y0 - 2, s: 'Check the print: this bar should measure exactly 100 mm', size: 3 });
      it.push({ t: 'rect', x: x0, y: y0, w: 100, h: 1.2, fill: '#000000', id: 'ruler100' });
      for (let i = 0; i <= 100; i++) it.push({ t: 'line', x1: x0 + i, y1: y0 + 1.2, x2: x0 + i, y2: y0 + 1.2 + (i % 10 === 0 ? 4 : i % 5 === 0 ? 2.8 : 1.6), stroke: '#000', w: 0.15 });
      for (let i = 0; i <= 10; i++) it.push({ t: 'text', x: x0 + i * 10, y: y0 + 9, s: String(i), size: 2.6, anchor: 'middle' });
      it.push({ t: 'text', x: x0 + 103, y: y0 + 3, s: 'cm', size: 3 });
      const yi = y0 + 16; it.push({ t: 'text', x: x0, y: yi - 2, s: '4 inches', size: 3 }); it.push({ t: 'rect', x: x0, y: yi, w: 101.6, h: 1.2, fill: '#000000' });
      for (let i = 0; i <= 32; i++) it.push({ t: 'line', x1: x0 + i * 3.175, y1: yi + 1.2, x2: x0 + i * 3.175, y2: yi + 1.2 + (i % 8 === 0 ? 4 : i % 4 === 0 ? 2.8 : 1.6), stroke: '#000', w: 0.15 });
      for (let i = 0; i <= 4; i++) it.push({ t: 'text', x: x0 + i * 25.4, y: yi + 9, s: String(i), size: 2.6, anchor: 'middle' });
      it.push({ t: 'text', x: x0 + 105, y: yi + 3, s: 'in', size: 3 });
      return yi + 14;
    };
    y = rul(ox, y + 4);
    // bill of materials
    const c = g.TesseraGrid.counts(grid), keys = Object.keys(c).sort((a, b) => c[b] - c[a]), unit = geo.bead ? 'beads' : 'tiles';
    const fmt = mm => `${(mm / 25.4).toFixed(1)} in (${Math.round(mm)} mm)`, bd = R().boards(grid);
    it.push({ t: 'text', x: ox, y: y + 2, s: 'Bill of materials', size: 4.2, bold: true }); y += 8;
    it.push({ t: 'text', x: ox, y, s: `${grid.w} x ${grid.h} ${unit}, finished size ${fmt(geo.W)} x ${fmt(geo.H)}` + (geo.bead ? `, ${bd.n} pegboards of 29 x 29 (${bd.cols} x ${bd.rows})` : `, 1 in tiles with ${geo.gap} mm grout`), size: 3.2 }); y += 6;
    keys.forEach(k => { it.push({ t: 'rect', x: ox, y: y - 3, w: 4, h: 4, fill: P[k].hex, stroke: '#00000066' }, { t: 'text', x: ox + 6, y, s: P[k].name, size: 3.2 }, { t: 'text', x: ox + 70, y, s: String(c[k]), size: 3.2, anchor: 'end' }); y += 5.2; });
    it.push({ t: 'line', x1: ox, y1: y - 3, x2: ox + 70, y2: y - 3, stroke: '#000', w: 0.2 });
    it.push({ t: 'text', x: ox, y: y + 1.5, s: `Total ${unit}`, size: 3.4, bold: true }, { t: 'text', x: ox + 70, y: y + 1.5, s: String(grid.w * grid.h), size: 3.4, anchor: 'end', bold: true }); y += 8;
    it.push({ t: 'text', x: ox, y, s: 'Made with Tessera Sign Studio', size: 2.6, fill: '#666666' }); y += 4;
    const W = Math.max(ox + geo.W + pad, ox + 120), H = y + 4;
    return { items: it, W, H, geo, art: { x: ox, y: oy, w: geo.W, h: geo.H } };
  }
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  // ---------- SVG at real scale (width and height in mm) ----------
  function toSVG(sh){
    const o = [`<svg xmlns="http://www.w3.org/2000/svg" width="${sh.W.toFixed(2)}mm" height="${sh.H.toFixed(2)}mm" viewBox="0 0 ${sh.W.toFixed(2)} ${sh.H.toFixed(2)}">`, `<rect width="100%" height="100%" fill="#FFFFFF"/>`];
    for (const i of sh.items){
      if (i.t === 'rect') o.push(`<rect${i.id ? ` id="${i.id}"` : ''} x="${i.x.toFixed(2)}" y="${i.y.toFixed(2)}" width="${i.w.toFixed(2)}" height="${i.h.toFixed(2)}" fill="${i.fill}"${i.stroke ? ` stroke="${i.stroke}" stroke-width="0.15"` : ''}/>`);
      else if (i.t === 'circ') o.push(`<circle cx="${i.cx.toFixed(2)}" cy="${i.cy.toFixed(2)}" r="${i.r.toFixed(2)}" fill="${i.fill}"/>`);
      else if (i.t === 'line') o.push(`<line x1="${i.x1.toFixed(2)}" y1="${i.y1.toFixed(2)}" x2="${i.x2.toFixed(2)}" y2="${i.y2.toFixed(2)}" stroke="${i.stroke}" stroke-width="${i.w}"/>`);
      else o.push(`<text x="${i.x.toFixed(2)}" y="${i.y.toFixed(2)}" font-family="Helvetica, Arial, sans-serif" font-size="${i.size}"${i.bold ? ' font-weight="bold"' : ''} text-anchor="${i.anchor || 'start'}" fill="${i.fill || '#111111'}">${esc(i.s)}</text>`);
    }
    o.push('</svg>'); return o.join('\n');
  }
  // ---------- PNG at real scale: canvas at a chosen dpi, plus a pHYs chunk so apps know the print size ----------
  const MAX_SIDE = 16000, MAX_AREA = 120e6;
  function pngDpi(sh, want){ let d = want; const w = mm => mm / 25.4 * d; while ((w(sh.W) > MAX_SIDE || w(sh.H) > MAX_SIDE || w(sh.W) * w(sh.H) > MAX_AREA) && d > 10) d = Math.floor(d * 0.8); return d; }
  function draw(ctx, sh, k){
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sh.W * k, sh.H * k);
    for (const i of sh.items){
      if (i.t === 'rect'){ ctx.fillStyle = i.fill; ctx.fillRect(i.x * k, i.y * k, i.w * k, i.h * k); if (i.stroke){ ctx.strokeStyle = i.stroke; ctx.lineWidth = 0.15 * k; ctx.strokeRect(i.x * k, i.y * k, i.w * k, i.h * k); } }
      else if (i.t === 'circ'){ ctx.fillStyle = i.fill; ctx.beginPath(); ctx.arc(i.cx * k, i.cy * k, i.r * k, 0, Math.PI * 2); ctx.fill(); }
      else if (i.t === 'line'){ ctx.strokeStyle = i.stroke; ctx.lineWidth = Math.max(1, i.w * k); ctx.beginPath(); ctx.moveTo(i.x1 * k, i.y1 * k); ctx.lineTo(i.x2 * k, i.y2 * k); ctx.stroke(); }
      else { ctx.fillStyle = i.fill || '#111'; ctx.font = `${i.bold ? 'bold ' : ''}${i.size * k}px Helvetica, Arial, sans-serif`; ctx.textAlign = i.anchor === 'middle' ? 'center' : i.anchor === 'end' ? 'right' : 'left'; ctx.fillText(i.s, i.x * k, i.y * k); }
    }
  }
  const crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++){ let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc(b){ let c = 0xFFFFFFFF; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function withPhys(bytes, dpi){   // insert a pHYs chunk (pixels per metre) right after IHDR
    const ppm = Math.round(dpi / 0.0254), chunk = new Uint8Array(21), dv = new DataView(chunk.buffer);
    dv.setUint32(0, 9); chunk.set([0x70, 0x48, 0x59, 0x73], 4); dv.setUint32(8, ppm); dv.setUint32(12, ppm); chunk[16] = 1; dv.setUint32(17, crc(chunk.subarray(4, 17)));
    const at = 8 + 25, out = new Uint8Array(bytes.length + 21); out.set(bytes.subarray(0, at)); out.set(chunk, at); out.set(bytes.subarray(at), at + 21); return out;
  }
  async function toPNG(sh, dpi = 150){
    const d = pngDpi(sh, dpi), k = d / 25.4, cv = document.createElement('canvas'); cv.width = Math.round(sh.W * k); cv.height = Math.round(sh.H * k);
    draw(cv.getContext('2d'), sh, k);
    const blob = await new Promise(r => cv.toBlob(r, 'image/png')); const bytes = new Uint8Array(await blob.arrayBuffer());
    return { bytes: withPhys(bytes, d), dpi: d, w: cv.width, h: cv.height };
  }
  // ---------- printable PDF: the sheet at 100% scale, tiled across Letter or A4 pages, a ruler on every page ----------
  const PAPER = { letter: [215.9, 279.4], a4: [210, 297] };
  function hexRGB(h){ let v = h.replace('#', ''); if (v.length < 6) v = v.slice(0, 3).split('').map(c => c + c).join(''); return [0, 2, 4].map(i => (parseInt(v.substr(i, 2), 16) / 255).toFixed(3)).join(' '); }
  const pstr = s => '(' + String(s).replace(/[\\()]/g, m => '\\' + m).replace(/[^\x20-\x7E]/g, '?') + ')';
  function ops(sh, it){
    const o = [];
    for (const i of it){
      if (i.t === 'rect'){ o.push(`${hexRGB(i.fill)} rg ${i.x.toFixed(2)} ${i.y.toFixed(2)} ${i.w.toFixed(2)} ${i.h.toFixed(2)} re f`); if (i.stroke) o.push(`0.4 0.4 0.4 RG 0.15 w ${i.x.toFixed(2)} ${i.y.toFixed(2)} ${i.w.toFixed(2)} ${i.h.toFixed(2)} re S`); }
      else if (i.t === 'circ'){ if (i.fill.length > 7) continue; const c = 0.5523 * i.r, x = i.cx, y = i.cy, r = i.r;
        o.push(`${hexRGB(i.fill)} rg ${(x + r).toFixed(2)} ${y.toFixed(2)} m ${(x + r).toFixed(2)} ${(y + c).toFixed(2)} ${(x + c).toFixed(2)} ${(y + r).toFixed(2)} ${x.toFixed(2)} ${(y + r).toFixed(2)} c ${(x - c).toFixed(2)} ${(y + r).toFixed(2)} ${(x - r).toFixed(2)} ${(y + c).toFixed(2)} ${(x - r).toFixed(2)} ${y.toFixed(2)} c ${(x - r).toFixed(2)} ${(y - c).toFixed(2)} ${(x - c).toFixed(2)} ${(y - r).toFixed(2)} ${x.toFixed(2)} ${(y - r).toFixed(2)} c ${(x + c).toFixed(2)} ${(y - r).toFixed(2)} ${(x + r).toFixed(2)} ${(y - c).toFixed(2)} ${(x + r).toFixed(2)} ${y.toFixed(2)} c f`);
        o.push(`0.45 0.45 0.45 rg ${(x - r * 0.33).toFixed(2)} ${(y - r * 0.33).toFixed(2)} ${(r * 0.66).toFixed(2)} ${(r * 0.66).toFixed(2)} re f`); }
      else if (i.t === 'line') o.push(`${hexRGB(i.stroke.slice(0, 7))} RG ${i.w} w ${i.x1.toFixed(2)} ${i.y1.toFixed(2)} m ${i.x2.toFixed(2)} ${i.y2.toFixed(2)} l S`);
      else { const wEst = i.size * 0.52 * String(i.s).length, x = i.anchor === 'middle' ? i.x - wEst / 2 : i.anchor === 'end' ? i.x - wEst : i.x;
        o.push(`BT /${i.bold ? 'F2' : 'F1'} ${i.size} Tf ${hexRGB(i.fill || '#111111')} rg 1 0 0 -1 ${x.toFixed(2)} ${i.y.toFixed(2)} Tm ${pstr(i.s)} Tj ET`); }
    }
    return o.join('\n');
  }
  function toPDF(sh, paper = 'letter', title = 'Tessera sign'){
    const [PW, PH] = PAPER[paper] || PAPER.letter, M = 10, FOOT = 26, aw = PW - 2 * M, ah = PH - 2 * M - FOOT;
    const cols = Math.ceil(sh.W / aw), rows = Math.ceil(sh.H / ah), pages = [];
    const flip = `${MM_PT.toFixed(5)} 0 0 ${(-MM_PT).toFixed(5)} 0 ${(PH * MM_PT).toFixed(3)} cm`;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++){
      const n = pages.length + 1, of = cols * rows, x0 = c * aw, y0 = r * ah;
      // only the items that land on this page
      const vis = sh.items.filter(i => { const b = i.t === 'rect' ? [i.x, i.y, i.x + i.w, i.y + i.h] : i.t === 'circ' ? [i.cx - i.r, i.cy - i.r, i.cx + i.r, i.cy + i.r] : i.t === 'line' ? [Math.min(i.x1, i.x2), Math.min(i.y1, i.y2), Math.max(i.x1, i.x2), Math.max(i.y1, i.y2)] : [i.x - 60, i.y - i.size, i.x + 60, i.y + 2];
        return b[2] >= x0 && b[0] <= x0 + aw && b[3] >= y0 && b[1] <= y0 + ah; });
      const foot = [];
      const fy = PH - M - FOOT + 6;
      foot.push({ t: 'text', x: M, y: fy, s: `${title} - page ${n} of ${of} (row ${r + 1}, column ${c + 1}). Print at 100% / Actual size, no "fit to page".`, size: 3 });
      foot.push({ t: 'text', x: M, y: fy + 5, s: 'This bar should measure exactly 50 mm:', size: 3 });
      foot.push({ t: 'rect', x: M + 62, y: fy + 2.6, w: 50, h: 1.2, fill: '#000000' });
      for (let i = 0; i <= 50; i += 5) foot.push({ t: 'line', x1: M + 62 + i, y1: fy + 3.8, x2: M + 62 + i, y2: fy + (i % 10 ? 5.6 : 6.8), stroke: '#000000', w: 0.15 });
      foot.push({ t: 'text', x: M, y: fy + 12, s: `Sheet ${sh.W.toFixed(0)} x ${sh.H.toFixed(0)} mm on ${cols} x ${rows} pages. Trim and butt-join pages along the dashed edges.`, size: 2.6 });
      const content = [`q ${flip}`, `q ${M} ${M} ${aw} ${ah} re W n`, `1 0 0 1 ${(M - x0).toFixed(2)} ${(M - y0).toFixed(2)} cm`, ops(sh, vis), 'Q',
        `0.6 0.6 0.6 RG 0.2 w [2 1.5] 0 d ${M} ${M} ${aw} ${ah} re S [] 0 d`, ops(sh, foot), 'Q'].join('\n');
      pages.push(content);
    }
    // assemble the file
    const objs = [], add = s => { objs.push(s); return objs.length; };
    const cat = add(''), pgs = add(''), f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'), f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    const kids = [];
    for (const c of pages){ const cs = add(`<< /Length ${c.length} >>\nstream\n${c}\nendstream`); kids.push(add(`<< /Type /Page /Parent ${pgs} 0 R /MediaBox [0 0 ${(PW * MM_PT).toFixed(2)} ${(PH * MM_PT).toFixed(2)}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${cs} 0 R >>`)); }
    objs[cat - 1] = `<< /Type /Catalog /Pages ${pgs} 0 R /ViewerPreferences << /PrintScaling /None >> >>`;
    objs[pgs - 1] = `<< /Type /Pages /Kids [${kids.map(k => k + ' 0 R').join(' ')}] /Count ${kids.length} >>`;
    let out = '%PDF-1.4\n', offs = [];
    objs.forEach((s, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${s}\nendobj\n`; });
    const xref = out.length; out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('');
    out += `trailer\n<< /Size ${objs.length + 1} /Root ${cat} 0 R /Info << /Title ${pstr(title)} /Creator (Tessera Sign Studio) >> >>\nstartxref\n${xref}\n%%EOF`;
    return { bytes: new TextEncoder().encode(out), pages: pages.length, cols, rows, paper: [PW, PH] };
  }
  function download(name, bytes, type){
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes], { type })); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  g.TesseraExport = { sheet, toSVG, toPNG, toPDF, download, pngDpi, PAPER };
})(typeof window !== 'undefined' ? window : globalThis);
