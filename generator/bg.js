// Illustrated Japanese scenery backgrounds (1080x1920 SVG + animated particle layers).
// Each builder returns { svg, particles } where particles is HTML for animated overlays.
const W = 1080, H = 1920;

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// A ridge line across the width, filled down to the bottom of the frame.
function ridge(base, amp, seed, opts = {}) {
  const r = rng(seed);
  const n = opts.points || 28;
  const ph = [r() * 6, r() * 6, r() * 6];
  let d = `M -20 ${H + 20} `;
  for (let i = 0; i <= n; i++) {
    const x = -20 + (i / n) * (W + 40);
    const u = i / n;
    let y = base - amp * (0.55 * Math.sin(u * 3.1 + ph[0]) + 0.3 * Math.sin(u * 7.3 + ph[1]) + 0.15 * Math.sin(u * 15 + ph[2]));
    y += (r() - 0.5) * amp * (opts.jag || 0.25);
    d += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d + `L ${W + 20} ${H + 20} Z`;
}

function particles(kind, count, seed, opts = {}) {
  const r = rng(seed);
  let html = '';
  for (let i = 0; i < count; i++) {
    const x = r() * W, dur = (opts.min || 6) + r() * ((opts.max || 12) - (opts.min || 6));
    const delay = -r() * dur, size = (opts.smin || 6) + r() * ((opts.smax || 14) - (opts.smin || 6));
    const drift = (r() - 0.5) * (opts.drift || 160);
    if (kind === 'snow') {
      html += `<i class="pt fall" style="left:${x}px;width:${size}px;height:${size}px;--dx:${drift}px;animation-duration:${dur}s;animation-delay:${delay}s"></i>`;
    } else if (kind === 'emoji') {
      html += `<i class="pe fall" style="left:${x}px;font-size:${size}px;--dx:${drift}px;--rot:${(r() - 0.5) * 720}deg;animation-duration:${dur}s;animation-delay:${delay}s">${opts.ch}</i>`;
    } else if (kind === 'twinkle') {
      const y = r() * (opts.ymax || 900);
      html += `<i class="tw" style="left:${x}px;top:${y}px;width:${size}px;height:${size}px;animation-duration:${1.5 + r() * 2.5}s;animation-delay:${-r() * 3}s"></i>`;
    } else if (kind === 'glitter') {
      const y = opts.y0 + r() * (opts.y1 - opts.y0);
      const w = 20 + r() * 90 * (1 - (opts.y1 - y) / (opts.y1 - opts.y0) * 0.6);
      html += `<i class="gl" style="left:${opts.cx - w / 2 + (r() - 0.5) * (y - opts.y0) * 0.9}px;top:${y}px;width:${w}px;animation-duration:${0.8 + r() * 1.6}s;animation-delay:${-r() * 2}s"></i>`;
    }
  }
  return html;
}

function svgWrap(defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${body}</svg>`;
}

const builders = {
  night_fuji() {
    const r = rng(7);
    let stars = '';
    for (let i = 0; i < 160; i++) stars += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * 900).toFixed(0)}" r="${(0.8 + r() * 2.2).toFixed(1)}" fill="#fff" opacity="${(0.3 + r() * 0.7).toFixed(2)}"/>`;
    const fuji = 'M -120 1300 C 180 1150, 380 820, 470 640 L 515 622 L 548 640 L 598 630 C 690 820, 900 1150, 1200 1300 L 1200 1330 L -120 1330 Z';
    const cap = 'M 470 640 L 515 622 L 548 640 L 598 630 C 625 690, 650 740, 676 790 L 640 770 L 610 800 L 580 765 L 548 805 L 520 768 L 488 800 L 462 770 L 420 795 C 440 740, 455 690, 470 640 Z';
    const defs = `
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070B26"/><stop offset=".45" stop-color="#1E2560"/><stop offset=".66" stop-color="#5A4A8E"/><stop offset=".7" stop-color="#C98AA6"/></linearGradient>
      <linearGradient id="mt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B4290"/><stop offset="1" stop-color="#191C4A"/></linearGradient>
      <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A2F6E"/><stop offset="1" stop-color="#0A0D2A"/></linearGradient>
      <radialGradient id="moonglow"><stop offset="0" stop-color="#FFF4D0" stop-opacity=".55"/><stop offset="1" stop-color="#FFF4D0" stop-opacity="0"/></radialGradient>`;
    let trees = '';
    const tr = rng(11);
    for (let x = -30; x < W + 40; x += 34 + tr() * 30) {
      const h = 160 + tr() * 170, y = 1920;
      trees += `<path d="M ${x} ${y - h} L ${x + 34} ${y} L ${x - 34} ${y} Z" fill="#070920"/>`;
    }
    const body = `<rect width="${W}" height="${H}" fill="url(#sky)"/>${stars}
      <circle cx="820" cy="300" r="190" fill="url(#moonglow)"/><circle cx="820" cy="300" r="62" fill="#FFF6DA"/>
      <path d="${fuji}" fill="url(#mt)"/><path d="${cap}" fill="#E6EAFF"/>
      <path d="${ridge(1290, 40, 3)}" fill="#141743"/>
      <rect y="1330" width="${W}" height="600" fill="url(#lake)"/>
      <g transform="translate(0 2660) scale(1 -1)" opacity=".22"><path d="${fuji}" fill="#6A72C0"/><path d="${cap}" fill="#fff"/></g>
      <rect x="805" y="1360" width="30" height="5" fill="#FFF6DA" opacity=".5"/><rect x="790" y="1400" width="60" height="4" fill="#FFF6DA" opacity=".35"/><rect x="800" y="1440" width="40" height="3" fill="#FFF6DA" opacity=".25"/>
      ${trees}`;
    return { svg: svgWrap(defs, body), particles: particles('twinkle', 40, 5, { smin: 3, smax: 6, ymax: 820 }) };
  },

  snow() {
    const defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FA8D6"/><stop offset=".55" stop-color="#CFE0F2"/><stop offset="1" stop-color="#EEF4FA"/></linearGradient>`;
    let houses = '';
    [[150, 1430, 1], [420, 1470, 1.25], [760, 1440, 1.05], [960, 1500, 0.8]].forEach(([x, y, s]) => {
      houses += `<g transform="translate(${x} ${y}) scale(${s})">
        <rect x="-70" y="0" width="140" height="70" fill="#5B3A26"/><rect x="-30" y="25" width="26" height="22" fill="#FFD27A"/><rect x="10" y="25" width="26" height="22" fill="#FFD27A"/>
        <path d="M -105 10 L 0 -150 L 105 10 Z" fill="#7A5232"/><path d="M -110 12 L 0 -158 L 110 12 L 92 12 L 0 -128 L -92 12 Z" fill="#FFFFFF"/>
        <path d="M -60 -60 L 0 -150 L 60 -60 Z" fill="#F4F8FC"/></g>`;
    });
    let pines = '';
    const pr = rng(21);
    for (let x = -20; x < W + 30; x += 40 + pr() * 50) {
      const h = 120 + pr() * 120, y = 1330 + pr() * 40;
      pines += `<path d="M ${x} ${y - h} L ${x + 38} ${y} L ${x - 38} ${y} Z" fill="#2F4F45"/><path d="M ${x} ${y - h} L ${x + 16} ${y - h * 0.55} L ${x - 16} ${y - h * 0.55} Z" fill="#fff"/>`;
    }
    const body = `<rect width="${W}" height="${H}" fill="url(#sky)"/>
      <path d="${ridge(760, 220, 31, { jag: 0.5 })}" fill="#DDE8F5"/><path d="${ridge(760, 220, 31, { jag: 0.5 })}" fill="#9DB6D3" opacity=".35" transform="translate(30 30)"/>
      <path d="${ridge(980, 170, 32, { jag: 0.45 })}" fill="#F3F7FC"/><path d="${ridge(1010, 150, 33, { jag: 0.4 })}" fill="#C7D7EA" opacity=".55"/>
      ${pines}<rect y="1360" width="${W}" height="560" fill="#F6F9FC"/>${houses}
      <path d="M 0 1640 Q 540 1580 1080 1660 L 1080 1920 L 0 1920 Z" fill="#E6EEF7"/>`;
    return { svg: svgWrap(defs, body), particles: particles('snow', 90, 9, { smin: 5, smax: 14, min: 7, max: 14, drift: 120 }) };
  },

  autumn() {
    const defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FB3E0"/><stop offset=".55" stop-color="#BFE0F0"/><stop offset=".75" stop-color="#FCE6C4"/></linearGradient>
      <linearGradient id="river" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ED3EA"/><stop offset="1" stop-color="#4C9CC4"/></linearGradient>`;
    const r = rng(41);
    let dots = '';
    const cols = ['#E2502B', '#F0A030', '#C8341F', '#F5C445', '#B5462A', '#8C9A3A'];
    for (let i = 0; i < 420; i++) {
      const x = r() * W, y = 1000 + r() * 520;
      dots += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(16 + r() * 26).toFixed(0)}" fill="${cols[Math.floor(r() * cols.length)]}" opacity=".9"/>`;
    }
    const body = `<rect width="${W}" height="${H}" fill="url(#sky)"/>
      <g fill="#fff" opacity=".85"><ellipse cx="230" cy="300" rx="120" ry="38"/><ellipse cx="300" cy="280" rx="80" ry="40"/><ellipse cx="820" cy="420" rx="140" ry="36"/></g>
      <path d="${ridge(720, 160, 42)}" fill="#C79A80"/><path d="${ridge(860, 170, 43)}" fill="#D46A3A"/>
      <path d="${ridge(1000, 150, 44)}" fill="#B23C22"/>${dots}
      <path d="M 380 1920 C 420 1760, 620 1700, 560 1560 C 520 1480, 640 1440, 700 1420 L 760 1430 C 700 1460, 620 1500, 660 1580 C 720 1700, 600 1800, 760 1920 Z" fill="url(#river)"/>
      <path d="${ridge(1700, 60, 45)}" fill="#7A2E1A" opacity=".55"/>`;
    return { svg: svgWrap(defs, body), particles: particles('emoji', 22, 13, { ch: '🍁', smin: 34, smax: 64, min: 8, max: 15, drift: 260 }) };
  },

  sea_sunset() {
    const defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26346A"/><stop offset=".3" stop-color="#7B4E8E"/><stop offset=".36" stop-color="#E8735A"/><stop offset=".43" stop-color="#FFC27A"/></linearGradient>
      <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E88A62"/><stop offset=".25" stop-color="#9C5A72"/><stop offset="1" stop-color="#1D2650"/></linearGradient>
      <radialGradient id="glow"><stop offset="0" stop-color="#FFE3A0" stop-opacity=".8"/><stop offset="1" stop-color="#FFE3A0" stop-opacity="0"/></radialGradient>`;
    const torii = `<g transform="translate(800 1660) scale(1.15)" fill="#1C1430">
      <rect x="-150" y="-300" width="300" height="26" rx="6"/><path d="M -185 -330 Q 0 -360 185 -330 L 175 -305 Q 0 -332 -175 -305 Z"/>
      <rect x="-118" y="-280" width="24" height="300"/><rect x="94" y="-280" width="24" height="300"/><rect x="-140" y="-230" width="280" height="18"/></g>`;
    const body = `<rect width="${W}" height="${H}" fill="url(#sky)"/>
      <circle cx="400" cy="790" r="300" fill="url(#glow)"/><circle cx="400" cy="790" r="110" fill="#FFE9B0"/>
      <rect y="830" width="${W}" height="1090" fill="url(#sea)"/>
      <path d="M -20 832 L 120 780 L 230 805 L 300 832 Z" fill="#3A2340"/><path d="M 640 832 L 760 795 L 860 810 L 980 785 L 1100 832 Z" fill="#3A2340"/>
      ${torii}<g transform="translate(0 3340) scale(1 -1)" opacity=".22">${torii}</g>`;
    return { svg: svgWrap(defs, body), particles: particles('glitter', 60, 17, { cx: 400, y0: 850, y1: 1650 }) };
  },

  bamboo() {
    const defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF7E4"/><stop offset=".6" stop-color="#BFDDA8"/><stop offset="1" stop-color="#7FAE6A"/></linearGradient>
      <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFBE0" stop-opacity=".7"/><stop offset="1" stop-color="#FFFBE0" stop-opacity="0"/></linearGradient>`;
    const layer = (seed, n, col, wmin, wmax, op) => {
      const r = rng(seed);
      let g = '';
      for (let i = 0; i < n; i++) {
        const x = r() * W, w = wmin + r() * (wmax - wmin), tilt = (r() - 0.5) * 4;
        g += `<g transform="rotate(${tilt.toFixed(1)} ${x} 1920)" opacity="${op}"><rect x="${x}" y="-40" width="${w}" height="2000" fill="${col}"/>`;
        for (let y = 80 + r() * 200; y < 1920; y += 220 + r() * 90) g += `<rect x="${x - 2}" y="${y}" width="${w + 4}" height="${Math.max(4, w * 0.12)}" fill="#2E5A2A" opacity=".5"/>`;
        g += `</g>`;
      }
      return g;
    };
    const lr = rng(61);
    let leaves = '';
    for (let i = 0; i < 70; i++) {
      const x = lr() * W, y = lr() * 700, a = lr() * 360;
      leaves += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(40 + lr() * 50).toFixed(0)}" ry="${(9 + lr() * 6).toFixed(0)}" transform="rotate(${a.toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" fill="${lr() > 0.5 ? '#4E8A3A' : '#6FA552'}" opacity=".85"/>`;
    }
    const body = `<rect width="${W}" height="${H}" fill="url(#sky)"/>
      ${layer(51, 26, '#A9CC8E', 14, 26, 0.7)}${layer(52, 14, '#76A85C', 26, 40, 0.9)}
      <g class="rays" opacity=".8"><path d="M 650 -50 L 820 -50 L 420 1920 L 160 1920 Z" fill="url(#ray)"/><path d="M 880 -50 L 960 -50 L 760 1920 L 620 1920 Z" fill="url(#ray)" opacity=".7"/></g>
      ${layer(53, 6, '#3F7A35', 46, 64, 1)}${leaves}
      <ellipse cx="540" cy="1880" rx="700" ry="160" fill="#5E8C4A"/>
      <g fill="#C9C2AE"><ellipse cx="520" cy="1760" rx="80" ry="22"/><ellipse cx="600" cy="1690" rx="62" ry="17"/><ellipse cx="560" cy="1630" rx="48" ry="13"/></g>`;
    return { svg: svgWrap(defs, body), particles: particles('emoji', 14, 19, { ch: '🍃', smin: 30, smax: 52, min: 9, max: 16, drift: 300 }) };
  },
};

const particleCss = `
.pt { position:absolute; top:-30px; border-radius:50%; background:#fff; opacity:.9; box-shadow:0 0 6px rgba(255,255,255,.8); }
.pe { position:absolute; top:-80px; font-style:normal; }
.fall { animation-name:fall; animation-timing-function:linear; animation-iteration-count:infinite; }
@keyframes fall { from { transform:translate(0,0) rotate(0); } to { transform:translate(var(--dx),2050px) rotate(var(--rot,0deg)); } }
.tw { position:absolute; border-radius:50%; background:#fff; box-shadow:0 0 10px 3px rgba(255,255,255,.8); animation:twk ease-in-out infinite; }
@keyframes twk { 0%,100% { opacity:.15; transform:scale(.6); } 50% { opacity:1; transform:scale(1.2); } }
.gl { position:absolute; height:4px; border-radius:2px; background:#FFE9B8; animation:glt ease-in-out infinite; }
@keyframes glt { 0%,100% { opacity:.1; } 50% { opacity:.9; } }
`;

module.exports = { builders, particleCss };
