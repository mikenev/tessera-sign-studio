(function () {
  const $ = id => document.getElementById(id), G = window.TesseraGrid, Rn = window.TesseraRender, ST = window.TesseraStyles, pal = window.TesseraPalette.byKey;
  Object.entries(ST).forEach(([k, s]) => $('style').insertAdjacentHTML('beforeend', `<option value="${k}">${s.name}</option>`));
  function clean(s){ return [...s.toUpperCase()].filter(window.TesseraFonts.supported).join(''); }
  const num = (id, lo, hi) => { const v = parseFloat($(id).value); return isNaN(v) ? lo : Math.min(hi, Math.max(lo, v)); };
  function state(){
    let a = clean($('line1').value), b = clean($('line2').value);
    while (G.letterCount(a) > G.MAX_LETTERS) a = a.slice(0, -1);
    while (G.letterCount(a) + G.letterCount(b) > G.MAX_LETTERS) b = b.slice(0, -1);
    if ($('line1').value !== a) $('line1').value = a; if ($('line2').value !== b) $('line2').value = b;
    const mode = document.querySelector('input[name=mode]:checked').value, auto = $('auto').checked;
    return { line1: a, line2: b, style: $('style').value, font: $('font').value, mode, gap: num('gap', 1, 10),
      margin: num('margin', 0, 20) | 0, border: num('border', 0, 12) | 0, width: auto ? 0 : num('gw', 5, 200) | 0, height: auto ? 0 : num('gh', 5, 200) | 0 };
  }
  const fmt = mm => `${(mm / 25.4).toFixed(1)} in (${Math.round(mm)} mm)`;
  function update(){
    const s = state(); $('left').textContent = `${G.MAX_LETTERS - G.letterCount(s.line1) - G.letterCount(s.line2)} letters left`;
    $('look').textContent = ST[s.style].look; $('gapRow').hidden = s.mode === 'bead';
    $('gw').disabled = $('gh').disabled = !s.width;
    const grid = G.build(s); const geo = Rn.geom(grid, s);
    $('preview').innerHTML = Rn.svg(grid, s); $('fitwarn').hidden = grid.fit;
    if (!s.width){ $('gw').value = grid.w; $('gh').value = grid.h; }
    const c = G.counts(grid), keys = Object.keys(c).sort((x, y) => c[y] - c[x]), total = grid.w * grid.h;
    $('counts').tBodies[0].innerHTML = keys.map(k => `<tr data-key="${k}"><td><span class="sw" style="background:${pal[k].hex}"></span></td><td>${pal[k].name}</td><td>${c[k]}</td></tr>`).join('');
    const bd = Rn.boards(grid);
    $('counts').tFoot.innerHTML = `<tr><td></td><td>Total ${s.mode === 'bead' ? 'beads' : 'tiles'}</td><td id="total">${total}</td></tr>`;
    $('size').innerHTML = `${grid.w} x ${grid.h} ${s.mode === 'bead' ? 'beads' : 'tiles'} · finished size ${fmt(geo.W)} x ${fmt(geo.H)}` +
      (s.mode === 'bead' ? ` · <span id="boards">${bd.n} pegboard${bd.n > 1 ? 's' : ''} (29 x 29), ${bd.cols} across x ${bd.rows} down</span>` : ` · ${s.gap} mm grout`);
    window.tessera = { grid, state: s, counts: c, geom: geo, boards: bd };
  }
  // ---------- exports ----------
  const X = window.TesseraExport;
  function base(){ const s = tessera.state; return ('tessera-' + (s.line1 + ' ' + s.line2).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + s.mode) || 'tessera-sign'; }
  function sheetNow(){ return X.sheet(tessera.grid, { ...tessera.state, overlay: $('overlay').checked }); }
  function info(){ const sh = sheetNow(), pdfp = X.PAPER[$('paper').value], aw = pdfp[0] - 20, ah = pdfp[1] - 46;
    $('exinfo').textContent = `Sheet ${(sh.W / 25.4).toFixed(1)} x ${(sh.H / 25.4).toFixed(1)} in (${Math.round(sh.W)} x ${Math.round(sh.H)} mm). PDF: ${Math.ceil(sh.W / aw) * Math.ceil(sh.H / ah)} page(s). PNG at ${X.pngDpi(sh, +$('dpi').value)} dpi.`; }
  $('exSvg').onclick = () => { const svg = X.toSVG(sheetNow()); window.tesseraLast = { kind: 'svg', svg }; X.download(base() + '.svg', svg, 'image/svg+xml'); };
  $('exPng').onclick = async () => { const r = await X.toPNG(sheetNow(), +$('dpi').value); window.tesseraLast = { kind: 'png', dpi: r.dpi, w: r.w, h: r.h }; X.download(base() + '.png', r.bytes, 'image/png'); };
  $('exPdf').onclick = () => { const r = X.toPDF(sheetNow(), $('paper').value, 'Tessera sign: ' + (tessera.state.line1 + ' ' + tessera.state.line2).trim()); window.tesseraLast = { kind: 'pdf', pages: r.pages }; X.download(base() + '.pdf', r.bytes, 'application/pdf'); };
  $('style').addEventListener('change', () => { $('border').value = ST[$('style').value].borderWidth; update(); });
  document.querySelectorAll('input, select').forEach(el => el.addEventListener('input', update));
  document.querySelectorAll('input, select').forEach(el => el.addEventListener('input', info));
  update(); info();
})();
