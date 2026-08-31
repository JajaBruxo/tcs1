// Inicialização do Contexto de Áudio (Web Audio API)
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

// Mapeamento de frequências das notas em Hz
const NOTE_FREQUENCIES = {
  'C4': 261.63,
  'D4': 293.66,
  'E4': 329.63,
  'F4': 349.23
};

function playSynthTone(note) {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  const frequency = NOTE_FREQUENCIES[note];
  if (!frequency) return;

  // Criação dos nós de áudio: Oscilador -> Ganho -> Saída
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine'; // Onda senoidal pura
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  // Envelope simples de volume (Fade out rápido para simular percussão)
  gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.5);
}

// Disparo por clique na tela
document.querySelectorAll('.pad').forEach(button => {
  button.addEventListener('click', () => {
    const note = button.getAttribute('data-note');
    playSynthTone(note);
  });
});

// Disparo pelo teclado QWERTY
window.addEventListener('keydown', (event) => {
  if (event.repeat) return; // Evita repetição ao segurar a tecla
  
  const key = event.key.toLowerCase();
  const pad = document.querySelector(`.pad[data-key="${key}"]`);
  
  if (pad) {
    const note = pad.getAttribute('data-note');
    playSynthTone(note);
    
    // Feedback visual do pad
    pad.classList.add('active');
    setTimeout(() => pad.classList.remove('active'), 100);
  }
});