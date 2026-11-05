import { fetchPresetsFromServer, submitPresetToServer } from './api.js';

let currentFilterCategory = 'Todos';
let presetsList = [
  { id: 1, name: 'BoomBap Essentials', bpm: 90, category: 'Hip-Hop' },
  { id: 2, name: 'Synthwave 80s Kit', bpm: 126, category: 'Eletrónica' }
];

function setBannerState(type, message) {
  const banner = document.getElementById('api-status-banner');
  if (!banner) return;

  banner.className = `api-banner ${type}`;
  banner.textContent = message;

  if (type === 'success') {
    setTimeout(() => banner.classList.add('hidden'), 4000);
  }
}

function toggleLoadingControls(isLoading) {
  const btnCloud = document.getElementById('btn-fetch-cloud');
  const btnSubmit = document.getElementById('btn-submit-preset');
  if (btnCloud) btnCloud.disabled = isLoading;
  if (btnSubmit) btnSubmit.disabled = isLoading;
}

export function renderPresets() {
  const container = document.getElementById('presets-container');
  if (!container) return;
  container.innerHTML = '';

  const filtered = currentFilterCategory === 'Todos'
    ? presetsList
    : presetsList.filter(item => item.category === currentFilterCategory);

  if (filtered.length === 0) {
    container.innerHTML = '<p style="font-size:0.85rem; color:#8b949e;">Nenhum preset encontrado nesta categoria.</p>';
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
      presetsList = presetsList.filter(p => p.id !== idToDelete);
      renderPresets();
    });
  });
}

export async function loadExternalPresets() {
  toggleLoadingControls(true);
  setBannerState('loading', '⏳ A carregar presets do servidor externo...');

  try {
    const cloudPresets = await fetchPresetsFromServer();
    presetsList = [...cloudPresets, ...presetsList.slice(0, 2)];
    renderPresets();
    setBannerState('success', '✅ Presets sincronizados com sucesso a partir da API!');
  } catch (error) {
    setBannerState('error', `❌ Erro de comunicação: ${error.message}`);
  } finally {
    toggleLoadingControls(false);
  }
}

export function initPresetsModule() {
  renderPresets();

  const btnCloud = document.getElementById('btn-fetch-cloud');
  if (btnCloud) {
    btnCloud.addEventListener('click', loadExternalPresets);
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilterCategory = btn.getAttribute('data-filter');
      renderPresets();
    });
  });

  const form = document.getElementById('preset-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
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

    if (!isValid) return;

    // Submissão assíncrona ao servidor (POST)
    toggleLoadingControls(true);
    setBannerState('loading', '⏳ A enviar novo preset para o servidor...');

    try {
      const savedPreset = await submitPresetToServer({
        name: nameInput.value.trim(),
        bpm: bpmVal,
        category: catInput.value
      });

      presetsList.unshift(savedPreset);
      renderPresets();
      form.reset();
      setBannerState('success', `✅ Preset "${savedPreset.name}" guardado no servidor com sucesso!`);
    } catch (error) {
      setBannerState('error', `❌ Erro ao submeter: ${error.message}`);
    } finally {
      toggleLoadingControls(false);
    }
  });
}