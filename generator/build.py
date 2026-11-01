# Joins each video's scene clips and lays synthesized sound effects on the timeline.
import json, os, subprocess, sys

D = os.path.dirname(os.path.abspath(__file__))
os.chdir(D)
run = lambda *a: subprocess.run(["ffmpeg", "-nostdin", "-y", "-loglevel", "error", *a], check=True)

SFX = {
    "alert": ("0.45*sin(2*PI*1050*t)*(lt(mod(t,0.16),0.09))*lt(t,0.32)", 0.35, []),
    "pop": ("0.6*sin(2*PI*(500+1800*exp(-35*t))*t)*exp(-22*t)", 0.18, []),
    "buzz": ("0.35*sgn(sin(2*PI*130*t))*exp(-5*t)", 0.35, ["-af", "lowpass=f=2500"]),
    "ding": ("0.45*sin(2*PI*1568*t)*exp(-6*t)+0.25*sin(2*PI*2093*t)*exp(-8*t)", 0.8, []),
    "chime": ("0.35*sin(2*PI*1319*t)*exp(-7*t)+0.35*sin(2*PI*1976*t)*exp(-7*(t-0.09))*gt(t,0.09)", 0.8, []),
    "thud": ("0.9*sin(2*PI*(55+220*exp(-28*t))*t)*exp(-10*t)", 0.35, []),
}
os.makedirs("sfx", exist_ok=True)
for k, (expr, dur, extra) in SFX.items():
    run("-f", "lavfi", "-i", f"aevalsrc='{expr}':s=44100:d={dur}", *extra, "-ac", "2", f"sfx/{k}.wav")
run("-f", "lavfi", "-i", "anoisesrc=d=0.35:color=pink:a=0.5", "-af",
    "highpass=f=400,lowpass=f=4000,afade=t=in:d=0.15,afade=t=out:st=0.15:d=0.2,volume=0.5", "-ac", "2", "-ar", "44100", "sfx/whoosh.wav")

ids = sys.argv[1:] or [v["id"] for v in json.load(open("week1.json"))]
for vid in ids:
    out = os.path.join("out", vid)
    scenes = json.load(open(os.path.join(out, "scenes.json")))
    cues, t = [], 0.0
    for sc in scenes:
        k = sc["kind"]
        if k == "hook": cues += [("alert", t), ("pop", t + 0.9)]
        elif k == "title": cues += [("whoosh", t), ("pop", t + 0.15), ("thud", t + 0.65)]
        elif k == "ng": cues += [("whoosh", t), ("pop", t + 0.2), ("buzz", t + 0.47)]
        elif k == "ok": cues += [("whoosh", t), ("pop", t + 0.2), ("chime", t + 0.47)]
        elif k == "bridge": cues += [("whoosh", t), ("pop", t + 0.05)]
        elif k == "summary": cues += [("whoosh", t), ("ding", t + 0.95)]
        t += sc["dur"]
    with open(os.path.join(out, "list.txt"), "w") as f:
        for sc in scenes: f.write(f"file 'clips/{sc['name']}.mp4'\n")
    run("-f", "concat", "-safe", "0", "-i", os.path.join(out, "list.txt"), "-c", "copy", os.path.join(out, "video_only.mp4"))
    inputs, parts = [], []
    for i, (k, at) in enumerate(cues):
        inputs += ["-i", f"sfx/{k}.wav"]
        ms = int(at * 1000)
        parts.append(f"[{i + 1}:a]adelay={ms}|{ms}[c{i}]")
    fc = ";".join(parts) + f";{''.join(f'[c{i}]' for i in range(len(cues)))}amix=inputs={len(cues)}:normalize=0,apad,atrim=0:{t},alimiter=limit=0.9[a]"
    final = os.path.join("out", f"{vid}.mp4")
    run("-i", os.path.join(out, "video_only.mp4"), *inputs, "-filter_complex", fc, "-map", "0:v", "-map", "[a]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", final + ".tmp.mp4")
    os.replace(final + ".tmp.mp4", final)
    print(final, round(t, 1))
