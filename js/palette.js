// A general colour set (plain descriptive names, not tied to any bead or tile brand).
(function (g) {
  const P = [
    ['white', 'White', '#F7F7F2'], ['ivory', 'Ivory', '#F1EAD8'], ['cream', 'Cream', '#EADCB8'], ['tan', 'Tan', '#C9A77C'],
    ['ochre', 'Ochre', '#C98E2B'], ['gold', 'Gold', '#D9A62E'], ['mustard', 'Mustard', '#B8932A'], ['rust', 'Rust', '#A4482A'],
    ['terracotta', 'Terracotta', '#C2643F'], ['brown', 'Brown', '#5C3A24'], ['red', 'Red', '#C23A33'], ['coral', 'Coral', '#E8765E'],
    ['pink', 'Pink', '#E9A3B5'], ['plum', 'Plum', '#6B3A5E'], ['lavender', 'Lavender', '#A99BD0'], ['navy', 'Navy', '#1E2C5A'],
    ['cobalt', 'Cobalt Blue', '#2753A8'], ['sky', 'Sky Blue', '#7FB2DE'], ['paleaqua', 'Pale Aqua', '#C9E8E2'], ['aqua', 'Aqua', '#6FC5C0'],
    ['teal', 'Deep Teal', '#1F6E6E'], ['seafoam', 'Seafoam', '#9FD3B8'], ['forest', 'Forest Green', '#2F5D3A'], ['olive', 'Olive', '#7A7A3A'],
    ['silver', 'Silver Grey', '#B9BCC0'], ['grey', 'Grey', '#7D8084'], ['charcoal', 'Charcoal', '#34363A'], ['black', 'Black', '#121214'],
  ];
  const byKey = {}; P.forEach(([k, n, h]) => byKey[k] = { key: k, name: n, hex: h });
  g.TesseraPalette = { list: P.map(p => byKey[p[0]]), byKey };
})(typeof window !== 'undefined' ? window : globalThis);
