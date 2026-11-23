const API_URL = 'http://localhost:3000/api/presets';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function shouldSimulateError() {
  const chk = document.getElementById('simulate-error-chk');
  return chk && chk.checked;
}

export async function fetchPresetsFromServer() {
  await delay(500);
  if (shouldSimulateError()) {
    throw new Error('Falha de comunicação com o servidor (Erro 503 Simulado).');
  }

  const response = await fetch(API_URL);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Erro ao consultar presets.');
  }

  return result.data;
}

export async function fetchPresetByIdFromServer(id) {
  const response = await fetch(`${API_URL}/${id}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Preset não encontrado.');
  }

  return result.data;
}

export async function submitPresetToServer(presetData) {
  await delay(500);
  if (shouldSimulateError()) {
    throw new Error('Não foi possível submeter o preset: Servidor indisponível.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(presetData)
  });

  const result = await response.json();

  if (!response.ok) {
    const detail = result.errors ? result.errors.join(' ') : result.message;
    throw new Error(detail || 'Falha ao criar preset.');
  }

  return result.data;
}

export async function updatePresetOnServer(id, presetData) {
  await delay(400);
  if (shouldSimulateError()) {
    throw new Error('Falha de comunicação ao tentar atualizar o preset.');
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(presetData)
  });

  const result = await response.json();

  if (!response.ok) {
    const detail = result.errors ? result.errors.join(' ') : result.message;
    throw new Error(detail || 'Falha ao atualizar preset.');
  }

  return result.data;
}

export async function deletePresetFromServer(id) {
  await delay(300);
  if (shouldSimulateError()) {
    throw new Error('Falha de comunicação ao tentar excluir o preset.');
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Falha ao remover preset.');
  }

  return result.data;
}