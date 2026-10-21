// Bunyi notifikasi pesanan baru (Web Audio, dua nada pendek).
// AudioContext hanya bisa jalan setelah ada interaksi pengguna di halaman —
// panggil unlockBeep() dari handler klik pertama (mis. tombol "Aktifkan Bunyi").
let ctx: AudioContext | null = null;
let unlocked = false;

export function unlockBeep() {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    unlocked = true;
  } catch {
    /* abaikan — bunyi hanya pelengkap */
  }
}

export function beepUnlocked(): boolean {
  return unlocked;
}

export function playNewOrderBeep() {
  if (!ctx || !unlocked) return;
  try {
    const t0 = ctx.currentTime;
    const notes: [number, number][] = [
      [880, 0],
      [1318, 0.16],
    ];
    for (const [freq, offset] of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0 + offset);
      gain.gain.exponentialRampToValueAtTime(0.22, t0 + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + offset + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + offset);
      osc.stop(t0 + offset + 0.18);
    }
  } catch {
    /* abaikan */
  }
}
