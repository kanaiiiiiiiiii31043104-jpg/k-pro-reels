# Trims each Flow clip, upscales to 1080x1920, lays timed overlays and sound effects, then joins
# everything with a soft BGM under the baby's voice.
import json, os, subprocess

D = os.path.dirname(os.path.abspath(__file__))
os.chdir(D)
ep = json.load(open("episode.rendered.json"))
SFX_DIR = "/home/claude/reel4/sfx"
run = lambda *a: subprocess.run(["ffmpeg", "-nostdin", "-y", "-loglevel", "error", *a], check=True)
os.makedirs("seg", exist_ok=True)
F = 0.15  # fade length

segs, t_total, cues = [], 0.0, []
for ci, c in enumerate(ep["clips"]):
    dur = round(c["end"] - c["start"], 3)
    inputs = ["-ss", str(c["start"]), "-t", str(dur), "-i", os.path.join("clips_raw", c["file"])]
    fc = ["[0:v]scale=1080:1920:flags=lanczos,fps=30,setpts=PTS-STARTPTS,format=yuv420p[v0]"]
    last = "v0"
    for oi, o in enumerate(c["overlays"]):
        s, e = o["start"], min(o["end"], dur)
        inputs += ["-loop", "1", "-t", str(dur), "-i", o["png"]]
        k = oi + 1
        fade_out = f",fade=t=out:st={max(s, e - F):.3f}:d={F}:alpha=1" if e < dur - 0.05 else ""
        fc.append(f"[{k}:v]format=rgba,fade=t=in:st={s:.3f}:d={F}:alpha=1{fade_out}[o{k}]")
        fc.append(f"[{last}][o{k}]overlay=0:0:enable='between(t,{s:.3f},{e:.3f})'[v{k}]")
        last = f"v{k}"
    out = f"seg/s{ci}.mp4"
    run(*inputs, "-filter_complex", ";".join(fc), "-map", f"[{last}]", "-map", "0:a",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-pix_fmt", "yuv420p", "-r", "30",
        "-c:a", "aac", "-b:a", "160k", "-ar", "44100", "-ac", "2", "-t", str(dur), out + ".tmp.mp4")
    os.replace(out + ".tmp.mp4", out)
    segs.append(out)
    for name, at in c.get("sfx", []):
        cues.append((name, t_total + at))
    t_total += dur

with open("seg/list.txt", "w") as f:
    for s in segs: f.write(f"file '{os.path.basename(s)}'\n")
run("-f", "concat", "-safe", "0", "-i", "seg/list.txt", "-c", "copy", "joined.mp4")

subprocess.run(["python3", "/home/claude/reel4/bgm.py", "bgm.wav", str(t_total), "0", "88"], check=True, stdout=subprocess.DEVNULL)
inputs, parts = ["-i", "joined.mp4", "-i", "bgm.wav"], ["[0:a]volume=1.0[voice]", "[1:a]volume=0.10[bg]"]
for i, (k, at) in enumerate(cues):
    inputs += ["-i", f"{SFX_DIR}/{k}.wav"]
    ms = int(at * 1000)
    parts.append(f"[{i + 2}:a]adelay={ms}|{ms},volume=0.7[c{i}]")
mix = "[voice][bg]" + "".join(f"[c{i}]" for i in range(len(cues)))
fc = ";".join(parts) + f";{mix}amix=inputs={len(cues) + 2}:normalize=0,atrim=0:{t_total},alimiter=limit=0.95[a]"
final = "akachan_sensei_01.mp4"
run(*inputs, "-filter_complex", fc, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
    "-movflags", "+faststart", final + ".tmp.mp4")
os.replace(final + ".tmp.mp4", final)
print(final, round(t_total, 2))
