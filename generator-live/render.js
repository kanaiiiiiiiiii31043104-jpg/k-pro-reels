// Renders the weekly NG/OK ranking reels over illustrated Japanese scenery.
// usage: node render.js [videoId] [sceneName] [stillSeconds]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const CLIPS = JSON.parse(fs.readFileSync(path.join(__dirname, 'clips.json'), 'utf8'));

const DIR = __dirname, FPS = 30;
const videos = JSON.parse(fs.readFileSync(path.join(DIR, 'week1.json'), 'utf8'));
const [onlyId, onlyScene, stillAt] = process.argv.slice(2);
const br = (t) => t.replace(/\n/g, '<br>');
const fit = (text, max, width) => Math.min(max, Math.floor(width / Math.max(...text.split('\n').map((l) => [...l].length))));
const D = { hook: 2.4, title: 1.9, item: 2.7, bridge: 1.4, summary: 4.4 };

const css = `
* { margin:0; padding:0; box-sizing:border-box; }
html, body { background:transparent !important; } body { width:1080px; height:1920px; overflow:hidden; position:relative; font-family:'Noto Sans CJK JP','Noto Color Emoji',sans-serif; color:#24170F; }
.bgwrap { position:absolute; inset:0; animation:bgmove var(--total) linear both; transform-origin:50% 45%; }
@keyframes bgmove { from { transform:scale(1); } to { transform:scale(1.1) translateY(-1.5%); } }
.ov { position:absolute; inset:0; }
.ov-dark { background:rgba(6,8,24,.5); }
.ov-mid { background:rgba(6,8,24,.32); }
.ov-top { background:linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.2) 30%, rgba(0,0,0,0) 45%, rgba(0,0,0,0) 70%, rgba(0,0,0,.35) 100%); }
.wh { color:#fff; text-shadow:0 4px 18px rgba(0,0,0,.55), 0 2px 4px rgba(0,0,0,.5); }
.center { position:absolute; left:70px; right:110px; top:260px; bottom:420px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
.label { position:absolute; top:170px; left:0; right:40px; text-align:center; font-size:42px; font-weight:900; letter-spacing:.04em; }
.rankrow { position:absolute; top:300px; left:0; right:40px; display:flex; flex-direction:column; align-items:center; }
.pill { font-size:44px; font-weight:900; color:#fff; padding:12px 38px; border-radius:50px; letter-spacing:.06em; box-shadow:0 8px 24px rgba(0,0,0,.25); }
.ngc { background:#E5483B; } .okc { background:#21A05A; }
.rank { font-size:170px; font-weight:900; line-height:1.05; margin-top:8px; }
.rank small { font-size:80px; }
.card { position:absolute; top:1110px; left:70px; right:110px; background:rgba(255,255,255,.9);
  border-radius:52px; padding:44px 40px 52px; text-align:center; box-shadow:0 24px 70px rgba(0,0,0,.28); }
.card.ng { border-top:14px solid #E5483B; } .card.ok { border-top:14px solid #21A05A; }
.icon { position:absolute; top:-92px; left:50%; margin-left:-80px; width:160px; height:160px; border-radius:50%; background:#fff; font-size:0; box-shadow:0 10px 26px rgba(0,0,0,.25); }
.mark { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:230px; font-weight:900; line-height:1; }
.mark.x { color:#E5483B; font-size:130px; } .mark.o { color:#21A05A; font-size:140px; }
.t { font-weight:900; line-height:1.2; margin-top:58px; white-space:nowrap; }
.d { margin-top:22px; font-size:46px; font-weight:700; line-height:1.5; color:#5A4232; }
.dots { position:absolute; top:1610px; left:70px; right:110px; display:flex; gap:12px; justify-content:center; }
.dots i { width:64px; height:12px; border-radius:6px; background:rgba(255,255,255,.55); }
.dots i.ng { background:#E5483B; } .dots i.ok { background:#21A05A; }
.hicon { font-size:220px; margin-bottom:30px; }
.h1 { font-weight:900; line-height:1.22; }
.h2 { margin-top:56px; font-weight:900; color:#FFD94A; white-space:nowrap; }
.kick { font-size:56px; font-weight:900; }
.ttl { font-weight:900; line-height:1.15; margin-top:24px; }
.flow { margin-top:56px; display:flex; gap:18px; align-items:center; font-size:50px; font-weight:900; }
.bridge1 { font-size:92px; font-weight:900; line-height:1.3; }
.bridge2 { font-size:180px; margin-top:20px; }
.sum { position:absolute; top:230px; left:60px; right:100px; background:rgba(255,255,255,.93); border-radius:48px; padding:40px 40px 44px; box-shadow:0 24px 70px rgba(0,0,0,.28); }
.sh { font-size:58px; font-weight:900; text-align:center; margin-bottom:20px; }
.sec { font-size:36px; font-weight:900; color:#fff; display:inline-block; padding:6px 24px; border-radius:30px; margin:14px 0 10px; }
.row { display:flex; align-items:center; gap:18px; padding:12px 6px; border-bottom:2px dashed rgba(0,0,0,.1); font-size:44px; font-weight:900; white-space:nowrap; }
.row b { width:56px; text-align:center; font-size:46px; }
.save { margin-top:30px; text-align:center; } .save span { display:inline-block; font-size:46px; font-weight:900; background:#24170F; color:#fff; padding:20px 40px; border-radius:60px; }
.loop { position:absolute; top:1430px; left:40px; right:80px; text-align:center; font-size:54px; font-weight:900; }
@keyframes pop { 0% { transform:scale(.3); opacity:0; } 70% { transform:scale(1.08); opacity:1; } 100% { transform:scale(1); opacity:1; } }
@keyframes up { from { transform:translateY(60px); opacity:0; } to { transform:none; opacity:1; } }
@keyframes stamp { 0% { transform:scale(2.3) rotate(-10deg); opacity:0; } 60% { transform:scale(.93); opacity:1; } 100% { transform:scale(1); opacity:1; } }
@keyframes rise { from { transform:translateY(300px); opacity:0; } to { transform:none; opacity:1; } }
@keyframes shake { 0%,100% { transform:rotate(-8deg); } 50% { transform:rotate(8deg); } }
@keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.06); } }
@keyframes bob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(24px); } }
.a-pop { animation:pop .45s ease-out both; } .a-up { animation:up .4s ease-out both; } .a-stamp { animation:stamp .4s ease-out both; }
.a-rise { animation:rise .4s cubic-bezier(.2,.9,.3,1) both; } .a-shake { animation:shake .3s ease-in-out infinite; }
.a-pulse { animation:pulse .9s ease-in-out infinite; } .a-bob { animation:bob .7s ease-in-out infinite; }

`;
const dl = (s) => `animation-delay:${s}s`;

function scenesFor(v) {
  const label = v.title.title.replace(/\n/g, ' ');
  const page = (overlay, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
    <div class="ov ${overlay}"></div>${body}</body></html>`;
  const list = [];
  list.push({ name: '01_hook', kind: 'hook', dur: D.hook, html: page('ov-dark', `
    <div class="center wh">
      <div class="hicon a-pop"><div class="a-shake">${v.hook.icon}</div></div>
      <div class="h1 a-up" style="font-size:${fit(v.hook.line1, 112, 880)}px;${dl(0.1)}">${br(v.hook.line1)}</div>
      <div class="h2 a-stamp" style="font-size:${fit(v.hook.line2, 84, 860)}px;${dl(0.9)}"><div class="a-pulse" style="${dl(1.3)}">${v.hook.line2}</div></div>
    </div>`) });
  list.push({ name: '02_title', kind: 'title', dur: D.title, html: page('ov-mid', `
    <div class="center wh">
      <div class="kick a-up">${v.title.kicker}</div>
      <div class="ttl a-pop" style="font-size:${fit(v.title.title, 140, 880)}px;${dl(0.15)}">${br(v.title.title)}</div>
      <div class="flow a-stamp" style="${dl(0.6)}"><span class="pill ngc">NG ワースト3</span><span>→</span><span class="pill okc">OK ベスト3</span></div>
    </div>`) });
  const item = (it, isNg, idx) => {
    const dots = [0, 1, 2, 3, 4, 5].map((j) => `<i class="${j <= idx ? (j < 3 ? 'ng' : 'ok') : ''}"></i>`).join('');
    return page('ov-top', `
    <div class="label wh">${label}</div>
    <div class="rankrow wh">
      <div class="pill ${isNg ? 'ngc' : 'okc'} a-pop">${isNg ? 'NG ワースト' : 'OK ベスト'}</div>
      <div class="rank a-stamp" style="${dl(0.18)}">${it.rank}<small>位</small></div>
    </div>
    <div class="card ${isNg ? 'ng' : 'ok'} a-rise">
      <div class="icon">${it.icon}<div class="mark ${isNg ? 'x' : 'o'} a-stamp" style="${dl(0.45)}">${isNg ? '✕' : '○'}</div></div>
      <div class="t" style="font-size:${fit(it.t, 80, 790)}px">${it.t}</div>
      <div class="d a-up" style="${dl(0.7)}">${br(it.d)}</div>
    </div>
    <div class="dots">${dots}</div>`);
  };
  v.ng.forEach((it, i) => list.push({ name: `03_ng${it.rank}`, kind: 'ng', dur: D.item, html: item(it, true, i) }));
  list.push({ name: '04_bridge', kind: 'bridge', dur: D.bridge, html: page('ov-mid', `
    <div class="center wh"><div class="bridge1 a-pop">逆に、<br>やるといいのは…</div><div class="bridge2"><div class="a-bob">👇</div></div></div>`) });
  v.ok.forEach((it, i) => list.push({ name: `05_ok${it.rank}`, kind: 'ok', dur: D.item, html: item(it, false, i + 3) }));
  const rows = (arr, mark, col) => arr.slice().reverse().map((it, i) =>
    `<div class="row a-up" style="${dl(0.2 + i * 0.08)}"><b style="color:${col}">${mark}</b><span style="font-size:${Math.min(44, Math.floor(700 / [...it.t].length))}px">${it.t}</span></div>`).join('');
  list.push({ name: '06_summary', kind: 'summary', dur: D.summary, html: page('ov-mid', `
    <div class="sum a-pop">
      <div class="sh">${label}</div>
      <div class="sec ngc">NG やめたい</div>${rows(v.ng, '✕', '#E5483B')}
      <div class="sec okc">OK やりたい</div>${rows(v.ok, '○', '#21A05A')}
      <div class="save a-pop" style="${dl(0.9)}"><span>${v.summary.save}</span></div>
    </div>
    <div class="loop wh a-up" style="${dl(2.2)}">${v.summary.loop}</div>`) });
  const pre = v.id.split('_')[0];
  const clipFor = { '01_hook': ['hook', 0], '02_title': ['title', 0], '04_bridge': ['title', 2.5], '06_summary': ['hook', 3] };
  let t0 = 0;
  for (const s of list) { s.t0 = t0; t0 += s.dur;
    const [k, off] = clipFor[s.name] || [s.name.replace(/^0\d_/, ''), 0];
    s.clip = CLIPS[pre + '_' + k]; s.off = off; }
  return { list, total: t0 };
}

function encoder(file, sc) {
  const fc = `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=${FPS},setpts=PTS-STARTPTS,trim=duration=${sc.dur}[bg];[bg][1:v]overlay=0:0:shortest=1,format=yuv420p[v]`;
  return spawn('ffmpeg', ['-nostdin', '-y', '-loglevel', 'error', '-stream_loop', '-1', '-ss', String(sc.off), '-i', sc.clip,
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', '-filter_complex', fc, '-map', '[v]', '-an',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
}

(async () => {
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const v of videos) {
    if (onlyId && v.id !== onlyId) continue;
    const { list, total } = scenesFor(v);
    const out = path.join(DIR, 'out', v.id);
    fs.mkdirSync(path.join(out, 'clips'), { recursive: true });
    for (const sc of list) {
      if (onlyScene && sc.name !== onlyScene) continue;
      await p.setContent(sc.html.replace('<body>', `<body style="--total:${total}s">`), { waitUntil: 'load' });
      await p.evaluate(() => document.fonts.ready);
      await p.evaluate(() => document.getAnimations().forEach((a) => a.pause()));
      const seek = (t) => p.evaluate(([local, global]) => document.getAnimations().forEach((a) => {
        const el = a.effect && a.effect.target;
        a.currentTime = (el && el.closest && el.closest('.bgwrap') ? global : local) * 1000;
      }), [t, sc.t0 + t]);
      if (stillAt !== undefined) {
        await seek(Number(stillAt));
        await p.screenshot({ path: path.join(DIR, `ov_${v.id}_${sc.name}.png`), omitBackground: true });
        await new Promise((res) => spawn('ffmpeg', ['-nostdin','-y','-loglevel','error','-ss', String(sc.off + Number(stillAt)), '-i', sc.clip, '-i', path.join(DIR, `ov_${v.id}_${sc.name}.png`), '-filter_complex', '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[b];[b][1:v]overlay', '-frames:v', '1', path.join(DIR, `still_${v.id}_${sc.name}.png`)]).on('close', res));
        continue;
      }
      const n = Math.round(sc.dur * FPS);
      const tmp = path.join(out, 'clips', sc.name + '.tmp.mp4');
      const ff = encoder(tmp, sc);
      const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
      for (let f = 0; f < n; f++) {
        await seek(f / FPS);
        const buf = await p.screenshot({ type: 'png', omitBackground: true });
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      }
      ff.stdin.end();
      await done;
      fs.renameSync(tmp, path.join(out, 'clips', sc.name + '.mp4'));
    }
    if (stillAt === undefined) {
      fs.writeFileSync(path.join(out, 'scenes.json'), JSON.stringify(list.map(({ name, kind, dur }) => ({ name, kind, dur })), null, 2));
      console.log('rendered', v.id, total.toFixed(1) + 's');
    }
  }
  await browser.close();
})();
