// --- NAVEGAÇÃO ENTRE AS 3 TELAS ---
const tabs = document.querySelectorAll('.tab-btn');
const views = document.querySelectorAll('.view-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));

    tab.classList.add('active');
    const targetId = tab.getAttribute('data-target');
    document.getElementById(targetId).classList.add('active');
  });
});

// --- ÁUDIO ENGINE (Web Audio API) ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

const sampleBuffers = { a: null, s: null, d: null, f: null };

// Master Nodes
let masterGain, filterNode;

function initAudioEngine() {
  if (audioCtx) return;
  audioCtx = new AudioContext();

  filterNode = audioCtx.createBiquadFilter();
  filterNode.type = 'lowpass';
  filterNode.frequency.value = 20000;

  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.8;

  filterNode.connect(masterGain);
  masterGain.connect(audioCtx.destination);
}

function triggerPad(key) {
  initAudioEngine();
  const buffer = sampleBuffers[key];
  if (!buffer) return;

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(filterNode);
  source.start(0);

  // Feedback Visual
  const padTrigger = document.querySelector(`.pad-card[data-key="${key}"] .pad-trigger`);
  if (padTrigger) {
    padTrigger.classList.add('active');
    setTimeout(() => padTrigger.classList.remove('active'), 100);
  }
}

// Upload de Amostras
document.querySelectorAll('.file-loader').forEach(input => {
  input.addEventListener('change', (e) => {
    initAudioEngine();
    const file = e.target.files[0];
    const key = input.getAttribute('data-key');
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      audioCtx.decodeAudioData(event.target.result, (decodedData) => {
        sampleBuffers[key] = decodedData;
        const nameEl = document.querySelector(`.pad-card[data-key="${key}"] .pad-name`);
        if (nameEl) nameEl.textContent = file.name;
      });
    };
    reader.readAsArrayBuffer(file);
  });
});

// Cliques nos Pads
document.querySelectorAll('.pad-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const key = trigger.parentElement.getAttribute('data-key');
    triggerPad(key);
  });
});

// Teclado QWERTY
window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const key = e.key.toLowerCase();
  if (['a', 's', 'd', 'f'].includes(key)) {
    triggerPad(key);
  }
});

// --- CONTROLES DE EFEITOS (TELA 2) ---
document.getElementById('master-cutoff').addEventListener('input', (e) => {
  initAudioEngine();
  const val = e.target.value;
  filterNode.frequency.setValueAtTime(val, audioCtx.currentTime);
  document.getElementById('cutoff-val').textContent = `${val} Hz`;
});

document.getElementById('master-volume').addEventListener('input', (e) => {
  initAudioEngine();
  const val = e.target.value;
  masterGain.gain.setValueAtTime(val, audioCtx.currentTime);
  document.getElementById('volume-val').textContent = `${Math.round(val * 100)}%`;
});

// --- COMUNICAÇÃO MIDI (TELA 3) ---
const midiMap = { 48: 'a', 50: 's', 52: 'd', 53: 'f' };

function setupMIDI() {
  if (!navigator.requestMIDIAccess) return;

  navigator.requestMIDIAccess().then(midiAccess => {
    function updateStatus() {
      const inputs = Array.from(midiAccess.inputs.values());
      const quickStatus = document.getElementById('quick-status');
      const detailedStatus = document.getElementById('detailed-midi-status');
      const statusDot = document.getElementById('status-dot');

      if (inputs.length > 0) {
        quickStatus.textContent = `MIDI: ${inputs[0].name}`;
        detailedStatus.textContent = `Dispositivo Ativo: ${inputs[0].name}`;
        statusDot.classList.add('connected');
        inputs.forEach(input => input.onmidimessage = handleMIDI);
      } else {
        quickStatus.textContent = 'MIDI: Desconectado';
        detailedStatus.textContent = 'Nenhum controlador USB detectado.';
        statusDot.classList.remove('connected');
      }
    }

    updateStatus();
    midiAccess.onstatechange = updateStatus;
  });
}

function handleMIDI(e) {
  const [status, note, velocity] = e.data;
  if ((status & 0xf0) === 0x90 && velocity > 0) {
    const key = midiMap[note];
    if (key) triggerPad(key);
  }
}

setupMIDI();
// Controle de Alternância de Resoluções
const resSelector = document.getElementById('resolution-selector');

if (resSelector) {
  resSelector.addEventListener('change', (e) => {
    const mode = e.target.value;
    document.body.classList.remove('res-mobile', 'res-tablet', 'res-desktop');
    
    if (mode !== 'auto') {
      document.body.classList.add(mode);
    }
  });
}