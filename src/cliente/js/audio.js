const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

const sampleBuffers = { a: null, s: null, d: null, f: null };

// Mapeamento dinâmico (Carrega notas padrão do SMK-25: 48=C2, 50=D2, 52=E2, 53=F2)
let midiMap = {
  48: 'a',
  50: 's',
  52: 'd',
  53: 'f'
};

let activeLearningKey = null;

function playSample(key) {
  if (!audioCtx) audioCtx = new AudioContext();
  const buffer = sampleBuffers[key];
  if (!buffer) return;

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start(0);
}

// Upload de áudio
document.querySelectorAll('.sample-input').forEach(input => {
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const key = input.getAttribute('data-key');
    if (!file) return;

    if (!audioCtx) audioCtx = new AudioContext();

    const reader = new FileReader();
    reader.onload = (event) => {
      audioCtx.decodeAudioData(event.target.result, (decodedData) => {
        sampleBuffers[key] = decodedData;
        const pad = document.querySelector(`.pad[data-key="${key}"]`);
        if (pad) pad.querySelector('.sample-name').textContent = file.name;
      });
    };
    reader.readAsArrayBuffer(file);
  });
});

// Disparo por clique
document.querySelectorAll('.pad').forEach(button => {
  button.addEventListener('click', () => {
    playSample(button.getAttribute('data-key'));
  });
});

// Disparo por teclado QWERTY
window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const key = e.key.toLowerCase();
  const pad = document.querySelector(`.pad[data-key="${key}"]`);
  if (pad) {
    playSample(key);
    pad.classList.add('active');
    setTimeout(() => pad.classList.remove('active'), 100);
  }
});

// Lógica de Aprendizado (MIDI Learn)
document.querySelectorAll('.learn-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-key');
    
    // Desativa modo anterior se houver
    document.querySelectorAll('.learn-btn').forEach(b => b.classList.remove('learning'));
    
    activeLearningKey = key;
    btn.classList.add('learning');
    btn.textContent = 'Toque uma tecla/pad no SMK-25...';
  });
});

// Web MIDI API
function initMIDI() {
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
  } else {
    document.getElementById('midi-status').textContent = "Navegador sem suporte a Web MIDI.";
  }
}

function onMIDISuccess(midiAccess) {
  const statusEl = document.getElementById('midi-status');
  
  const updateInputs = () => {
    const inputs = Array.from(midiAccess.inputs.values());
    if (inputs.length > 0) {
      statusEl.textContent = `Conectado: ${inputs[0].name}`;
      inputs.forEach(input => input.onmidimessage = handleMIDIMessage);
    } else {
      statusEl.textContent = "Nenhum dispositivo MIDI encontrado. Conecte seu SMK-25.";
    }
  };

  updateInputs();
  midiAccess.onstatechange = updateInputs;
}

function onMIDIFailure() {
  document.getElementById('midi-status').textContent = "Falha ao acessar dispositivos MIDI.";
}

function handleMIDIMessage(event) {
  const [status, note, velocity] = event.data;
  const isNoteOn = (status & 0xf0) === 0x90 && velocity > 0;

  if (!isNoteOn) return;

  // Se estiver no modo MIDI Learn
  if (activeLearningKey) {
    // Remove mapeamento antigo dessa nota caso existisse
    delete midiMap[note];

    // Remove qualquer nota que estivesse apontada para essa tecla
    Object.keys(midiMap).forEach(n => {
      if (midiMap[n] === activeLearningKey) delete midiMap[n];
    });

    // Associa a nova nota à tecla
    midiMap[note] = activeLearningKey;

    // Atualiza a interface
    const pad = document.querySelector(`.pad[data-key="${activeLearningKey}"]`);
    if (pad) pad.querySelector('.midi-note-display').textContent = `MIDI: ${note}`;

    const btn = document.querySelector(`.learn-btn[data-key="${activeLearningKey}"]`);
    if (btn) {
      btn.classList.remove('learning');
      btn.textContent = 'Mapear MIDI';
    }

    activeLearningKey = null;
    return;
  }

  // Modo normal de execução
  const targetKey = midiMap[note];
  if (targetKey) {
    playSample(targetKey);

    const pad = document.querySelector(`.pad[data-key="${targetKey}"]`);
    if (pad) {
      pad.classList.add('active');
      setTimeout(() => pad.classList.remove('active'), 100);
    }
  }
}

initMIDI();
// Parâmetros dos efeitos por Pad
const fxParams = {
  a: { cutoff: 20000, reverb: 0 },
  s: { cutoff: 20000, reverb: 0 },
  d: { cutoff: 20000, reverb: 0 },
  f: { cutoff: 20000, reverb: 0 }
};

// Gerador simples de impulso para simular Reverb (Reverb de Convolução)
function createImpulseResponse(context, duration = 2.0, decay = 2.0) {
  const sampleRate = context.sampleRate;
  const length = sampleRate * duration;
  const impulse = context.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const n = length - i;
    left[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
    right[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
  }
  return impulse;
}

let reverbBuffer = null;

function playSample(key) {
  if (!audioCtx) audioCtx = new AudioContext();
  const buffer = sampleBuffers[key];
  if (!buffer) return;

  if (!reverbBuffer) {
    reverbBuffer = createImpulseResponse(audioCtx);
  }

  // 1. Fonte do som
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  // 2. Equalizador/Filtro Lowpass
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = fxParams[key].cutoff;

  // 3. Efeito de Reverb
  const convolver = audioCtx.createConvolver();
  convolver.buffer = reverbBuffer;

  const dryGain = audioCtx.createGain();
  const wetGain = audioCtx.createGain();

  const reverbAmount = fxParams[key].reverb;
  dryGain.gain.value = 1 - reverbAmount;
  wetGain.gain.value = reverbAmount;

  // Roteamento da Cadeia de Áudio
  source.connect(filter);
  
  // Sinal limpo (Dry)
  filter.connect(dryGain);
  dryGain.connect(audioCtx.destination);

  // Sinal com Reverb (Wet)
  filter.connect(convolver);
  convolver.connect(wetGain);
  wetGain.connect(audioCtx.destination);

  source.start(0);
}

// Escuta alterações nos sliders do EQ Cutoff
document.querySelectorAll('.fx-cutoff').forEach(input => {
  input.addEventListener('input', (e) => {
    const key = e.target.getAttribute('data-key');
    fxParams[key].cutoff = parseFloat(e.target.value);
  });
});

// Escuta alterações nos sliders de Reverb
document.querySelectorAll('.fx-reverb').forEach(input => {
  input.addEventListener('input', (e) => {
    const key = e.target.getAttribute('data-key');
    fxParams[key].reverb = parseFloat(e.target.value);
  });
});