import { initAudioModule } from './audioEngine.js';
import { initPresetsModule, loadExternalPresets } from './presets.js';
import { initMidiModule } from './midi.js';

function initNavigationAndResolution() {
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
}

// Inicialização da aplicação modularizada
document.addEventListener('DOMContentLoaded', () => {
  initNavigationAndResolution();
  initAudioModule();
  initPresetsModule();
  initMidiModule();

  // Executa a consulta inicial de dados externos ao arrancar
  loadExternalPresets();
});