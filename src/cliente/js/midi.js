import { triggerPad } from './audioEngine.js';

let activeLearnPad = null;
let keyMap = { '1': '1', '2': '2', '3': '3', '4': '4' };
let midiMap = { 48: '1', 50: '2', 52: '3', 53: '4' };

function finishLearn(padNumber, labelText, newKeyLabel = null) {
  const displayTarget = document.getElementById(`map-${padNumber}`);
  if (displayTarget) displayTarget.textContent = labelText;

  if (newKeyLabel) {
    const padKeyEl = document.querySelector(`.pad-card[data-key="${padNumber}"] .pad-key`);
    if (padKeyEl) padKeyEl.textContent = newKeyLabel.toUpperCase();
  }

  const btn = document.querySelector(`.btn-learn[data-pad="${padNumber}"]`);
  if (btn) {
    btn.textContent = 'Aprender';
    btn.classList.remove('learning');
  }
  activeLearnPad = null;
}

function handleMIDI(e) {
  if (!e.data || e.data.length < 2) return;
  const [status, data1, data2 = 0] = e.data;
  if (status >= 0xf0) return;

  const command = status & 0xf0;
  const isTrigger = (command === 0x90 && data2 > 0) || (command === 0xb0 && data2 > 0);

  const monitorEl = document.getElementById('midi-last-note');
  if (monitorEl && data2 > 0) {
    const tipo = command === 0xb0 ? 'CC' : 'Nota';
    monitorEl.textContent = `MIDI ${tipo}: ${data1} | Força: ${data2}`;
  }

  if (!isTrigger) return;

  if (activeLearnPad !== null) {
    for (const noteKey in midiMap) {
      if (midiMap[noteKey] === activeLearnPad) delete midiMap[noteKey];
    }
    midiMap[data1] = activeLearnPad;
    finishLearn(activeLearnPad, `MIDI ${data1}`, `M${data1}`);
    return;
  }

  const targetKey = midiMap[data1];
  if (targetKey) triggerPad(targetKey);
}

export function initMidiModule() {
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.repeat) return;

    const pressedKey = e.key.toLowerCase();

    if (activeLearnPad !== null) {
      e.preventDefault();
      for (const k in keyMap) {
        if (keyMap[k] === activeLearnPad) delete keyMap[k];
      }
      keyMap[pressedKey] = activeLearnPad;

      const monitorEl = document.getElementById('midi-last-note');
      if (monitorEl) monitorEl.textContent = `Teclado PC: Tecla "${pressedKey.toUpperCase()}"`;

      finishLearn(activeLearnPad, `Tecla ${pressedKey.toUpperCase()}`, pressedKey);
      return;
    }

    const targetPad = keyMap[pressedKey];
    if (targetPad) triggerPad(targetPad);
  });

  document.querySelectorAll('.btn-learn').forEach(btn => {
    btn.addEventListener('click', () => {
      const padNumber = btn.getAttribute('data-pad');

      if (activeLearnPad === padNumber) {
        activeLearnPad = null;
        btn.textContent = 'Aprender';
        btn.classList.remove('learning');
        return;
      }

      document.querySelectorAll('.btn-learn').forEach(b => {
        b.textContent = 'Aprender';
        b.classList.remove('learning');
      });

      activeLearnPad = padNumber;
      btn.textContent = 'Pressione tecla/pad...';
      btn.classList.add('learning');
    });
  });

  if (!navigator.requestMIDIAccess) {
    const detailed = document.getElementById('detailed-midi-status');
    if (detailed) detailed.textContent = 'Web MIDI API não suportada (use Teclado PC).';
    return;
  }

  navigator.requestMIDIAccess({ sysex: false })
    .then(midiAccess => {
      function updateInputs() {
        const inputs = Array.from(midiAccess.inputs.values());
        const quickStatus = document.getElementById('quick-status');
        const detailedStatus = document.getElementById('detailed-midi-status');
        const statusDot = document.getElementById('status-dot');

        if (inputs.length > 0) {
          const deviceName = inputs[0].name || 'Controlador USB MIDI';
          if (quickStatus) quickStatus.textContent = `MIDI: ${deviceName}`;
          if (detailedStatus) detailedStatus.textContent = `Conectado: ${deviceName}`;
          if (statusDot) statusDot.classList.add('connected');
          inputs.forEach(input => { input.onmidimessage = handleMIDI; });
        } else {
          if (quickStatus) quickStatus.textContent = 'MIDI: Desconectado';
          if (detailedStatus) detailedStatus.textContent = 'Sem USB MIDI (Mapeamento via Teclado PC ativo).';
          if (statusDot) statusDot.classList.remove('connected');
        }
      }
      updateInputs();
      midiAccess.onstatechange = updateInputs;
    })
    .catch(() => {
      const detailed = document.getElementById('detailed-midi-status');
      if (detailed) detailed.textContent = 'Permissão MIDI bloqueada no navegador.';
    });
}