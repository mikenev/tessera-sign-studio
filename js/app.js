(function () {
  const $ = id => document.getElementById(id), G = window.TesseraGrid;
  function clean(s){ return [...s.toUpperCase()].filter(window.TesseraFonts.supported).join(''); }
  function update(){
    let a = clean($('line1').value), b = clean($('line2').value);
    // up to 15 letters across both lines; line 2 gets whatever line 1 leaves
    while (G.letterCount(a) > G.MAX_LETTERS) a = a.slice(0, -1);
    while (G.letterCount(a) + G.letterCount(b) > G.MAX_LETTERS) b = b.slice(0, -1);
    if ($('line1').value !== a) $('line1').value = a; if ($('line2').value !== b) $('line2').value = b;
    $('left').textContent = `${G.MAX_LETTERS - G.letterCount(a) - G.letterCount(b)} letters left`;
    const grid = G.build({ line1: a, line2: b, font: 'block', style: 'bathhouse' });
    $('preview').innerHTML = window.TesseraRender.svg(grid);
    $('size').textContent = `${grid.w} x ${grid.h} tiles`;
    window.tessera = { grid };
  }
  ['line1', 'line2'].forEach(id => $(id).addEventListener('input', update));
  update();
})();
