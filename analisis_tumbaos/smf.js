// Minimal Standard MIDI File parser (no deps). Returns {format, ppq, tracks:[{name, events}], notes, tempos, timesigs, keysigs}
const fs = require('fs');

function parseSMF(buf) {
  let p = 0;
  const u32 = () => { const v = buf.readUInt32BE(p); p += 4; return v; };
  const u16 = () => { const v = buf.readUInt16BE(p); p += 2; return v; };
  const vlq = () => { let v = 0, b; do { b = buf[p++]; v = (v << 7) | (b & 0x7f); } while (b & 0x80); return v; };
  // find MThd (some files have RIFF wrappers)
  const hdr = buf.indexOf('MThd');
  if (hdr < 0) throw new Error('no MThd');
  p = hdr + 4;
  const hlen = u32(); const format = u16(), ntr = u16(), div = u16(); p = hdr + 8 + hlen;
  const ppq = div & 0x8000 ? 480 : div;
  const tracks = [];
  const tempos = [], timesigs = [], keysigs = [], markers = [];
  for (let t = 0; t < ntr; t++) {
    const at = buf.indexOf('MTrk', p);
    if (at < 0) break;
    p = at + 4; const len = u32(); const end = p + len;
    let tick = 0, status = 0;
    const tr = { idx: t, name: '', inst: '', events: [], programs: {}, notes: [] };
    const open = {}; // key ch*128+pitch -> stack of {tick, vel}
    while (p < end && p < buf.length) {
      tick += vlq();
      let b = buf[p];
      if (b & 0x80) { status = b; p++; } else if (status === 0) { p++; continue; }
      const type = status & 0xf0, ch = status & 0x0f;
      if (status === 0xff) {
        const mt = buf[p++]; const ml = vlq(); const data = buf.slice(p, p + ml); p += ml;
        if (mt === 0x03 && !tr.name) tr.name = data.toString('latin1').trim();
        else if (mt === 0x04) tr.inst = data.toString('latin1').trim();
        else if (mt === 0x51) tempos.push({ tick, uspq: (data[0] << 16) | (data[1] << 8) | data[2] });
        else if (mt === 0x58) timesigs.push({ tick, num: data[0], den: 1 << data[1] });
        else if (mt === 0x59) keysigs.push({ tick, sf: (data[0] << 24) >> 24, mi: data[1] });
        else if (mt === 0x06 || mt === 0x01) markers.push({ tick, text: data.toString('latin1'), track: t });
        else if (mt === 0x2f) break;
        status = 0; // running status cancelled by meta
      } else if (status === 0xf0 || status === 0xf7) {
        const l = vlq(); p += l; status = 0;
      } else if (type === 0x90 || type === 0x80) {
        const pitch = buf[p++], vel = buf[p++];
        const key = ch * 128 + pitch;
        if (type === 0x90 && vel > 0) {
          (open[key] = open[key] || []).push({ tick, vel });
        } else {
          const st = open[key]; if (st && st.length) { const o = st.shift(); tr.notes.push({ ch, pitch, vel: o.vel, on: o.tick, off: tick }); }
        }
      } else if (type === 0xa0 || type === 0xb0 || type === 0xe0) { p += 2; }
      else if (type === 0xc0) { const prog = buf[p++]; tr.programs[ch] = tr.programs[ch] ?? prog; tr.events.push({ tick, type: 'prog', ch, prog }); }
      else if (type === 0xd0) { p += 1; }
      else { p++; }
    }
    for (const k in open) for (const o of open[k]) tr.notes.push({ ch: Math.floor(k / 128), pitch: k % 128, vel: o.vel, on: o.tick, off: tick });
    tr.notes.sort((a, b) => a.on - b.on || a.pitch - b.pitch);
    tracks.push(tr);
    p = end;
  }
  return { format, ppq, tracks, tempos, timesigs, keysigs, markers };
}

function load(file) { return parseSMF(fs.readFileSync(file)); }

const GM = ['Acoustic Grand', 'Bright Acoustic', 'Electric Grand', 'Honky-tonk', 'E.Piano 1', 'E.Piano 2', 'Harpsichord', 'Clavinet', 'Celesta', 'Glockenspiel', 'Music Box', 'Vibraphone', 'Marimba', 'Xylophone', 'Tubular Bells', 'Dulcimer', 'Drawbar Organ', 'Perc Organ', 'Rock Organ', 'Church Organ', 'Reed Organ', 'Accordion', 'Harmonica', 'Tango Acc', 'Nylon Gtr', 'Steel Gtr', 'Jazz Gtr', 'Clean Gtr', 'Muted Gtr', 'Overdrive Gtr', 'Distortion Gtr', 'Gtr Harmonics', 'Acoustic Bass', 'Fingered Bass', 'Picked Bass', 'Fretless Bass', 'Slap Bass 1', 'Slap Bass 2', 'Synth Bass 1', 'Synth Bass 2', 'Violin', 'Viola', 'Cello', 'Contrabass', 'Tremolo Str', 'Pizzicato Str', 'Harp', 'Timpani', 'Strings', 'Slow Strings', 'Synth Str 1', 'Synth Str 2', 'Choir Aahs', 'Voice Oohs', 'Synth Voice', 'Orch Hit', 'Trumpet', 'Trombone', 'Tuba', 'Muted Tpt', 'French Horn', 'Brass Section', 'Synth Brass 1', 'Synth Brass 2', 'Soprano Sax', 'Alto Sax', 'Tenor Sax', 'Bari Sax', 'Oboe', 'English Horn', 'Bassoon', 'Clarinet', 'Piccolo', 'Flute', 'Recorder', 'Pan Flute', 'Blown Bottle', 'Shakuhachi', 'Whistle', 'Ocarina', 'Sq Lead', 'Saw Lead', 'Calliope', 'Chiff', 'Charang', 'Voice Lead', 'Fifths Lead', 'Bass+Lead', 'New Age Pad', 'Warm Pad', 'Polysynth', 'Choir Pad', 'Bowed Pad', 'Metallic Pad', 'Halo Pad', 'Sweep Pad'];
const gmName = p => p == null ? '-' : (GM[p] || ('prog' + p));

module.exports = { parseSMF, load, gmName };
