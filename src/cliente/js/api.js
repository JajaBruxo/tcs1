const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const CATEGORIES = ['Hip-Hop', 'Eletrónica', 'Rock', 'Experimental'];

// Pausa auxiliar para tornar o estado de carregamento visível na interface
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function shouldSimulateError() {
  const chk = document.getElementById('simulate-error-chk');
  return chk && chk.checked;
}

/**
 * Operação de Consulta (GET) - Obtém presets externos da API
 */
export async function fetchPresetsFromServer() {
  await delay(900); // Permite visualizar o estado de loading

  if (shouldSimulateError()) {
    throw new Error('Falha de comunicação com o servidor (Erro 503 Simulado).');
  }

  const response = await fetch(`${API_URL}?_limit=4`);
  if (!response.ok) {
    throw new Error(`Erro HTTP ao consultar dados: Status ${response.status}`);
  }

  const data = await response.json();

  // Mapeia os dados externos para a estrutura do WebSampler
  return data.map((item, index) => ({
    id: item.id + 100,
    name: `Cloud Kit #${item.id}: ${item.title.slice(0, 15)}`,
    bpm: 85 + (index * 15),
    category: CATEGORIES[index % CATEGORIES.length]
  }));
}

/**
 * Operação de Submissão (POST) - Envia um novo preset para o servidor
 */
export async function submitPresetToServer(presetData) {
  await delay(900);

  if (shouldSimulateError()) {
    throw new Error('Não foi possível submeter o preset: Servidor indisponível.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(presetData)
  });

  if (!response.ok) {
    throw new Error(`Falha ao submeter dados: Status ${response.status}`);
  }

  const created = await response.json();
  return {
    ...presetData,
    id: created.id ? created.id + Date.now() : Date.now()
  };
}