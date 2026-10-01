// ========================================================
// 1. ESTADO GLOBAL E ESTRUTURAS DE DADOS
// ========================================================
const sampleBuffers = { '1': null, '2': null, '3': null, '4': null };

// Efeitos e EQ individuais por canal
const padEffects = {
  '1': { cutoff: 20000, q: 1, volume: 1 },
  '2': { cutoff: 20000, q: 1, volume: 1 },
  '3': { cutoff: 20000, q: 1, volume: 1 },
  '4': { cutoff: 20000, q: 1, volume: 1 }
};

// Base de dados em memória para Presets
let currentFilterCategory = 'Todos';
let presetsList = [
  { id: 1, name: 'BoomBap Essentials', bpm: 90, category: 'Hip-Hop' },
  { id: 2, name: 'Synthwave 80s Kit', bpm: 126, category: 'Eletrónica' }
];

// Mapeamento MIDI e modo MIDI Learn
let activeLearnPad = null;
let midiMap = {
  48: '1',
  50: '2',
  52: '3',
  53: '4'
};

// ========================================================
// 2. NAVEGAÇÃO SPA E SELETOR DE RESOLUÇÃO
// ========================================================
const tabs = document.querySelectorAll('.tab-btn');
const views = document.querySelectorAll('.view-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));

    tab.classList.add('active');
    const targetId = tab.getAttribute('data-target');
    const targetView = document.getElementById(targetId);
    if (targetView) targetView.classList.add('active');
  });
});

const resSelector = document.getElementById('resolution-selector');
if (resSelector) {
  resSelector.addEventListener('change', (e) => {
    const mode = e.target.value;

    document.body.className = document.body.className
      .split(' ')
      .filter(className => !className.startsWith('res-'))
      .join(' ')
      .trim();

    if (mode !== 'auto') {
      document.body.classList.add(mode);
    }
  });
}

// ========================================================
// 3. MOTOR DE ÁUDIO COM CANAIS DEDICADOS (WEB AUDIO API)
// ========================================================
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx, masterGain;

function initAudioEngine() {
  if (audioCtx) return;
  audioCtx = new AudioContext();

  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.85;
  masterGain.connect(audioCtx.destination);
}

function triggerPad(key) {
  initAudioEngine();
  const buffer = sampleBuffers[key];
  if (!buffer) return;

  const currentParams = padEffects[key];

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const padFilter = audioCtx.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.setValueAtTime(currentParams.cutoff, audioCtx.currentTime);
  padFilter.Q.setValueAtTime(currentParams.q, audioCtx.currentTime);

  const padGain = audioCtx.createGain();
  padGain.gain.setValueAtTime(currentParams.volume, audioCtx.currentTime);

  source.connect(padFilter);
  padFilter.connect(padGain);
  padGain.connect(masterGain);

  source.start(0);

  const card = document.querySelector(`.pad-card[data-key="${key}"] .pad-trigger`);
  if (card) {
    card.classList.add('active');
    setTimeout(() => card.classList.remove('active'), 100);
  }
}

// ========================================================
// 4. MESA DE MISTURA (CONTROLES INDIVIDUAIS POR PAD)
// ========================================================
document.querySelectorAll('.fx-cutoff').forEach(slider => {
  slider.addEventListener('input', (e) => {
    const pad = e.target.getAttribute('data-pad');
    const val = Number(e.target.value);
    padEffects[pad].cutoff = val;
    document.getElementById(`val-cutoff-${pad}`).textContent = `${val} Hz`;
  });
});

document.querySelectorAll('.fx-q').forEach(slider => {
  slider.addEventListener('input', (e) => {
    const pad = e.target.getAttribute('data-pad');
    const val = Number(e.target.value);
    padEffects[pad].q = val;
    document.getElementById(`val-q-${pad}`).textContent = val.toFixed(1);
  });
});

document.querySelectorAll('.fx-vol').forEach(slider => {
  slider.addEventListener('input', (e) => {
    const pad = e.target.getAttribute('data-pad');
    const val = Number(e.target.value);
    padEffects[pad].volume = val;
    document.getElementById(`val-vol-${pad}`).textContent = `${Math.round(val * 100)}%`;
  });
});

// ========================================================
// 5. TRATAMENTO DE ERROS E UPLOAD DE FICHEIROS
// ========================================================
function showFileError(msg) {
  const banner = document.getElementById('file-error-banner');
  if (banner) {
    banner.textContent = msg;
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('hidden'), 4000);
  }
}

document.querySelectorAll('.file-loader').forEach(input => {
  input.addEventListener('change', (e) => {
    initAudioEngine();
    const file = e.target.files[0];
    const key = input.getAttribute('data-key');

    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      showFileError(`Formato inválido (${file.name}). Por favor, carregue ficheiros .wav ou .mp3.`);
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      audioCtx.decodeAudioData(
        event.target.result,
        (decodedData) => {
          sampleBuffers[key] = decodedData;
          const nameEl = document.querySelector(`.pad-card[data-key="${key}"] .pad-name`);
          if (nameEl) nameEl.textContent = file.name;
        },
        () => {
          showFileError("Erro na descodificação: ficheiro de áudio corrompido.");
        }
      );
    };
    reader.readAsArrayBuffer(file);
  });
});

document.querySelectorAll('.pad-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const key = trigger.closest('.pad-card').getAttribute('data-key');
    triggerPad(key);
  });
});

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.repeat) return;
  const key = e.key;
  if (['1', '2', '3', '4'].includes(key)) {
    triggerPad(key);
  }
});

// ========================================================
// 6. VALIDAÇÃO DE FORMULÁRIO E PRESETS (ETAPA 04)
// ========================================================
const form = document.getElementById('preset-form');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('preset-name');
    const bpmInput = document.getElementById('preset-bpm');
    const catInput = document.getElementById('preset-category');

    const errName = document.getElementById('err-name');
    const errBpm = document.getElementById('err-bpm');
    const errCat = document.getElementById('err-category');

    [errName, errBpm, errCat].forEach(el => el.textContent = '');
    [nameInput, bpmInput, catInput].forEach(el => el.classList.remove('input-invalid'));

    let isValid = true;

    if (nameInput.value.trim().length < 3) {
      errName.textContent = 'O nome deve ter no mínimo 3 caracteres.';
      nameInput.classList.add('input-invalid');
      isValid = false;
    }

    const bpmVal = Number(bpmInput.value);
    if (!bpmInput.value || isNaN(bpmVal) || bpmVal < 40 || bpmVal > 240) {
      errBpm.textContent = 'O valor de BPM deve estar entre 40 e 240.';
      bpmInput.classList.add('input-invalid');
      isValid = false;
    }

    if (!catInput.value) {
      errCat.textContent = 'Por favor, selecione uma categoria.';
      catInput.classList.add('input-invalid');
      isValid = false;
    }

    if (isValid) {
      const newPreset = {
        id: Date.now(),
        name: nameInput.value.trim(),
        bpm: bpmVal,
        category: catInput.value
      };

      presetsList.push(newPreset);
      renderPresets();
      form.reset();
    }
  });
}

function renderPresets() {
  const container = document.getElementById('presets-container');
  if (!container) return;
  container.innerHTML = '';

  const filtered = currentFilterCategory === 'Todos'
    ? presetsList
    : presetsList.filter(item => item.category === currentFilterCategory);

  if (filtered.length === 0) {
    container.innerHTML = '<p style="font-size:0.85rem; color:#8b949e;">Nenhum preset encontrado.</p>';
    return;
  }

  filtered.forEach(preset => {
    const itemEl = document.createElement('div');
    itemEl.className = 'preset-item';
    itemEl.innerHTML = `
      <div class="preset-meta">
        <h4>${preset.name}</h4>
        <span>${preset.category} | ${preset.bpm} BPM</span>
      </div>
      <button class="btn-delete-preset" data-id="${preset.id}">Remover</button>
    `;
    container.appendChild(itemEl);
  });

  container.querySelectorAll('.btn-delete-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idToDelete = Number(e.target.getAttribute('data-id'));
      deletePreset(idToDelete);
    });
  });
}

function deletePreset(id) {
  presetsList = presetsList.filter(p => p.id !== id);
  renderPresets();
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilterCategory = btn.getAttribute('data-filter');
    renderPresets();
  });
});

renderPresets();

// ========================================================
// 7. INTEGRAÇÃO WEB MIDI API COM MIDI LEARN
// ========================================================
function setupMIDI() {
  if (!navigator.requestMIDIAccess) {
    const detailed = document.getElementById('detailed-midi-status');
    if (detailed) detailed.textContent = 'Web MIDI API não suportada neste navegador.';
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
          const deviceName = inputs[0].name || 'Dispositivo USB MIDI';
          if (quickStatus) quickStatus.textContent = `MIDI: ${deviceName}`;
          if (detailedStatus) detailedStatus.textContent = `Conectado: ${deviceName}`;
          if (statusDot) statusDot.classList.add('connected');

          inputs.forEach(input => {
            input.onmidimessage = handleMIDI;
          });
        } else {
          if (quickStatus) quickStatus.textContent = 'MIDI: Desconectado';
          if (detailedStatus) detailedStatus.textContent = 'Nenhum controlador USB detetado.';
          if (statusDot) statusDot.classList.remove('connected');
        }
      }

      updateInputs();
      midiAccess.onstatechange = updateInputs;
    })
    .catch(() => {
      const detailed = document.getElementById('detailed-midi-status');
      if (detailed) detailed.textContent = 'Acesso MIDI negado pelo navegador.';
    });
}

function handleMIDI(e) {
  const [status, note, velocity] = e.data;
  const command = status & 0xf0;
  const isNoteOn = (command === 0x90 && velocity > 0);

  const monitorEl = document.getElementById('midi-last-note');
  if (monitorEl) {
    monitorEl.textContent = `Nota: ${note} | Velocity: ${velocity} | Hex: 0x${status.toString(16)}`;
  }

  if (!isNoteOn) return;

  // Modo MIDI Learn ativo
  if (activeLearnPad !== null) {
    for (const key in midiMap) {
      if (midiMap[key] === activeLearnPad) {
        delete midiMap[key];
      }
    }

    midiMap[note] = activeLearnPad;

    const displayTarget = document.getElementById(`map-${activeLearnPad}`);
    if (displayTarget) {
      displayTarget.textContent = note;
    }

    const btn = document.querySelector(`.btn-learn[data-pad="${activeLearnPad}"]`);
    if (btn) {
      btn.textContent = 'Aprender';
      btn.classList.remove('learning');
    }
    activeLearnPad = null;
    return;
  }

  // Disparo normal do Pad
  const targetKey = midiMap[note];
  if (targetKey) {
    triggerPad(targetKey);
  }
}

document.querySelectorAll('.btn-learn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const padNumber = e.target.getAttribute('data-pad');

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
    btn.textContent = 'Toque o Pad...';
    btn.classList.add('learning');
  });
});

setupMIDI();