// Original style presets: a field colour, lettering colours and a border pattern (our own designs).
// border(i, d, bw, n, x, y) -> colour key: i = cell index along the band (clockwise), d = depth from the outside edge (0..bw-1).
(function (g) {
  const KEY = ['######', '#....#', '#.##.#', '#..#.#', '####.#'];   // a key (meander) motif, period 6, five rows deep
  const S = {
    bathhouse: { name: 'Bathhouse', field: 'white', letter: 'cobalt', letter2: 'navy', grout: '#D9D6CF', borderWidth: 2,
      look: 'White field, blue lettering, navy and white checker border',
      border: (i, d, bw, n, x, y) => ((x + y) % 2 === 0 ? 'navy' : 'white') },
    terracotta: { name: 'Terracotta Station', field: 'cream', letter: 'brown', letter2: 'rust', grout: '#CDBFA6', borderWidth: 5,
      look: 'Cream field, brown lettering, rust and ochre key-pattern border',
      border: (i, d, bw) => {
        if (bw < 5) return d === 0 ? 'rust' : (i % 2 ? 'ochre' : 'rust');
        if (d >= 5) return 'rust';
        return KEY[d][((i % 6) + 6) % 6] === '#' ? 'rust' : 'ochre';
      } },
    seaglass: { name: 'Seaglass', field: 'paleaqua', letter: 'teal', letter2: 'teal', grout: '#E6EEEB', borderWidth: 3,
      look: 'Pale aqua field, deep teal lettering, wave-dot border',
      border: (i, d, bw) => {
        if (d === 0) return 'teal';
        const crest = 1 + Math.round((1 + Math.sin(i * Math.PI / 3)) / 2 * Math.max(0, bw - 2));
        if (d === crest) return 'white';
        if (i % 4 === 2 && d === Math.max(1, bw - 1) && crest !== d) return 'teal';
        return 'aqua';
      } },
    midnight: { name: 'Midnight Platform', field: 'black', letter: 'gold', letter2: 'white', grout: '#3A3A3E', borderWidth: 3,
      look: 'Black field, gold lettering, thin gold and white stepped border',
      border: (i, d, bw) => {
        if (d === 0) return 'gold';
        const step = 1 + (Math.floor(i / 2) % Math.max(1, bw - 1));
        return d === step ? 'white' : 'black';
      } },
  };
  g.TesseraStyles = S;
})(typeof window !== 'undefined' ? window : globalThis);
