const sampleBuffers = { '1': null, '2': null, '3': null, '4': null };

const padEffects = {
  '1': { cutoff: 20000, q: 1, volume: 1 },
  '2': { cutoff: 20000, q: 1, volume: 1 },
  '3': { cutoff: 20000, q: 1, volume: 1 },
  '4': { cutoff: 20000, q: 1, volume: 1 }
};

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx, masterGain;

function initAudioContext() {
  if (audioCtx) return;
  audioCtx = new AudioContext();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.85;
  masterGain.connect(audioCtx.destination);
}

export function triggerPad(key) {
  initAudioContext();

  const card = document.querySelector(`.pad-card[data-key="${key}"] .pad-trigger`);
  if (card) {
    card.classList.add('active');
    setTimeout(() => card.classList.remove('active'), 100);
  }

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
}

function showFileError(msg) {
  const banner = document.getElementById('file-error-banner');
  if (banner) {
    banner.textContent = msg;
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('hidden'), 4000);
  }
}

export function initAudioModule() {
  document.querySelectorAll('.pad-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const key = trigger.closest('.pad-card').getAttribute('data-key');
      triggerPad(key);
    });
  });

  document.querySelectorAll('.file-loader').forEach(input => {
    input.addEventListener('change', (e) => {
      initAudioContext();
      const file = e.target.files[0];
      const key = input.getAttribute('data-key');
      if (!file) return;

      if (!file.type.startsWith('audio/')) {
        showFileError(`Formato inválido (${file.name}). Carregue apenas ficheiros .wav ou .mp3.`);
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
          () => showFileError('Erro na descodificação: ficheiro de áudio corrompido.')
        );
      };
      reader.readAsArrayBuffer(file);
    });
  });

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
}