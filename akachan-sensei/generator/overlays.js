// Renders each overlay of episode.json as a transparent 1080x1920 PNG.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const DIR = __dirname;
const ep = JSON.parse(fs.readFileSync(path.join(DIR, 'episode.json'), 'utf8'));
const out = path.join(DIR, 'ov');
fs.mkdirSync(out, { recursive: true });

const css = `
* { margin:0; padding:0; box-sizing:border-box; }
html, body { background:transparent; width:1080px; height:1920px; overflow:hidden; font-family:'Noto Sans CJK JP','Noto Color Emoji',sans-serif; }
.stroke { color:#fff; paint-order:stroke fill; -webkit-text-stroke:14px #1a1a1a; text-shadow:0 6px 18px rgba(0,0,0,.45); }
.hl { color:#FFE14D; }
.title { position:absolute; top:210px; left:0; right:60px; text-align:center; }
.badge { display:inline-block; background:#FF6FA5; color:#fff; font-weight:900; font-size:52px; padding:14px 40px; border-radius:60px; box-shadow:0 8px 24px rgba(0,0,0,.3); }
.big { margin-top:22px; font-weight:900; font-size:108px; line-height:1.1; }
.tag { position:absolute; top:180px; left:44px; background:rgba(255,111,165,.92); color:#fff; font-weight:900; font-size:36px; padding:10px 26px; border-radius:40px; box-shadow:0 6px 18px rgba(0,0,0,.25); }
.label { position:absolute; top:270px; left:44px; font-weight:900; font-size:96px; color:#fff; padding:6px 38px 12px; border-radius:30px; box-shadow:0 10px 28px rgba(0,0,0,.35); }
.label.ng { background:#E5483B; } .label.ok { background:#21A05A; }
.sub { position:absolute; top:1120px; left:30px; right:90px; height:330px; display:flex; align-items:center; justify-content:center; text-align:center; font-weight:900; line-height:1.28; }
.note { position:absolute; top:1470px; left:0; right:60px; text-align:center; }
.note span { display:inline-block; background:rgba(20,20,20,.72); color:#fff; font-weight:700; font-size:42px; padding:14px 30px; border-radius:24px; }
.pill { position:absolute; top:290px; left:0; right:60px; text-align:center; }
.pill span { display:inline-block; background:#fff; color:#222; font-weight:900; font-size:50px; padding:18px 40px; border-radius:60px; box-shadow:0 10px 26px rgba(0,0,0,.3); }
`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function subHtml(o) {
  let t = esc(o.text);
  if (o.hl) t = t.split(o.hl).join(`<span class="hl">${o.hl}</span>`);
  const longest = Math.max(...o.text.split('\n').map((l) => [...l].length));
  const fs = Math.min(84, Math.floor(940 / longest));
  return `<div class="sub stroke" style="font-size:${fs}px"><div>${t.replace(/\n/g, '<br>')}</div></div>`;
}
function html(o) {
  let b = '';
  if (o.kind === 'title') b = `<div class="title"><div class="badge">👶 ${ep.title}</div><div class="big stroke">${ep.subtitle}</div></div>`;
  if (o.kind === 'tag') b = `<div class="tag">👶 ${ep.title}</div>`;
  if (o.kind === 'label') b = `<div class="label ${o.color}">${o.text}</div>`;
  if (o.kind === 'sub') b = subHtml(o);
  if (o.kind === 'note') b = `<div class="note"><span>${esc(o.text)}</span></div>`;
  if (o.kind === 'pill') b = `<div class="pill"><span>${esc(o.text)}</span></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${b}</body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const [ci, c] of ep.clips.entries()) {
    for (const [oi, o] of c.overlays.entries()) {
      await p.setContent(html(o), { waitUntil: 'load' });
      await p.evaluate(() => document.fonts.ready);
      const f = path.join(out, `c${ci}_o${oi}.png`);
      await p.screenshot({ path: f, omitBackground: true });
      o.png = f;
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(DIR, 'episode.rendered.json'), JSON.stringify(ep, null, 1));
  console.log('overlays done');
})();
