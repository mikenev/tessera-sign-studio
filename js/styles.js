// Original style presets: a field colour, lettering colours and a border pattern.
// border(i, d, bw, n) -> colour key: i = cell index along the band (clockwise), d = depth from the outside edge (0..bw-1),
// bw = border width in cells, n = band length.
(function (g) {
  const S = {
    bathhouse: { name: 'Bathhouse', field: 'white', letter: 'cobalt', letter2: 'navy',
      border: (i, d, bw, n, x, y) => ((x + y) % 2 === 0 ? 'navy' : 'white') },
  };
  g.TesseraStyles = S;
})(typeof window !== 'undefined' ? window : globalThis);
