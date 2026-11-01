# Synthesizes a light, original background loop (pluck arpeggio + pad + bass + soft drums).
# usage: python3 bgm.py out.wav seconds [semitone_shift] [bpm]
import sys, wave
import numpy as np

SR = 44100
out, dur = sys.argv[1], float(sys.argv[2])
shift = int(sys.argv[3]) if len(sys.argv) > 3 else 0
bpm = float(sys.argv[4]) if len(sys.argv) > 4 else 104
beat = 60 / bpm
N = int(SR * dur)
mixL = np.zeros(N); mixR = np.zeros(N)
f = lambda m: 440 * 2 ** ((m + shift - 69) / 12)

def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    mixL[i:i + len(sig)] += sig * (1 - pan) / 2 * 2
    mixR[i:i + len(sig)] += sig * (1 + pan) / 2 * 2

def pluck(freq, length=0.6):
    t = np.arange(int(SR * length)) / SR
    env = np.exp(-t * 7) * (1 - np.exp(-t * 400))
    return env * (np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(4 * np.pi * freq * t) + 0.12 * np.sin(6 * np.pi * freq * t))

def pad(freqs, length):
    t = np.arange(int(SR * length)) / SR
    env = np.minimum(1, t / 0.6) * np.minimum(1, (length - t) / 0.5).clip(0, 1)
    s = sum(np.sin(2 * np.pi * fr * t + np.sin(2 * np.pi * 0.3 * t) * 0.4) + 0.3 * np.sin(2 * np.pi * fr * 2.005 * t) for fr in freqs)
    return env * s / len(freqs)

def kick():
    t = np.arange(int(SR * 0.3)) / SR
    return np.sin(2 * np.pi * (45 + 90 * np.exp(-t * 30)) * t) * np.exp(-t * 12)

def hat():
    t = np.arange(int(SR * 0.06)) / SR
    n = np.random.default_rng(1).standard_normal(len(t))
    n = np.diff(np.concatenate([[0], n]))  # crude high-pass
    return n * np.exp(-t * 70)

# I - V - vi - IV in C (MIDI roots), one chord per bar
prog = [(60, [60, 64, 67, 72]), (55, [55, 59, 62, 67]), (57, [57, 60, 64, 69]), (53, [53, 57, 60, 65])]
bar = beat * 4
t0, bi = 0.0, 0
while t0 < dur:
    root, notes = prog[bi % 4]
    add(pad([f(n) for n in notes[:3]], bar + 0.4), t0, 0, 0.16)
    add(pad([f(root - 12)], bar), t0, 0, 0.22)  # bass
    arp = [notes[0], notes[1], notes[2], notes[3], notes[2], notes[1], notes[2], notes[3]]
    for k, m in enumerate(arp):
        add(pluck(f(m + 12)), t0 + k * beat / 2, 0.35 if k % 2 else -0.35, 0.16)
    for k in range(4):
        if k in (0, 2): add(kick(), t0 + k * beat, 0, 0.35)
        add(hat(), t0 + k * beat + beat / 2, 0.2, 0.05)
    t0 += bar; bi += 1

st = np.stack([mixL, mixR], 1)
fade = int(SR * 0.6)
st[:fade] *= np.linspace(0, 1, fade)[:, None]
st[-fade:] *= np.linspace(1, 0, fade)[:, None]
st = st / (np.abs(st).max() + 1e-9) * 0.9
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print(out)
