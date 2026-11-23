let presets = [
  { id: 1, name: 'BoomBap Essentials', bpm: 90, category: 'Hip-Hop' },
  { id: 2, name: 'Synthwave 80s Kit', bpm: 126, category: 'Eletrónica' },
  { id: 3, name: 'Garage Rock Drums', bpm: 140, category: 'Rock' },
  { id: 4, name: 'Glitch Modular', bpm: 110, category: 'Experimental' }
];

let nextId = 5;
const VALID_CATEGORIES = ['Eletrónica', 'Hip-Hop', 'Rock', 'Experimental'];

// Função auxiliar para validar entradas do utilizador
function validatePresetInput(data, isPartial = false) {
  const errors = [];

  if (!isPartial || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 3) {
      errors.push('O campo "name" é obrigatório e deve ter pelo menos 3 caracteres.');
    }
  }

  if (!isPartial || data.bpm !== undefined) {
    const bpmNum = Number(data.bpm);
    if (data.bpm === undefined || isNaN(bpmNum) || bpmNum < 40 || bpmNum > 240) {
      errors.push('O campo "bpm" deve ser um número válido entre 40 e 240.');
    }
  }

  if (!isPartial || data.category !== undefined) {
    if (!data.category || !VALID_CATEGORIES.includes(data.category)) {
      errors.push(`O campo "category" deve ser um dos seguintes: ${VALID_CATEGORIES.join(', ')}.`);
    }
  }

  return errors;
}

// 1. GET /api/presets - Consulta geral (com filtro opcional por categoria)
exports.getAllPresets = (req, res) => {
  const { category } = req.query;

  if (category && category !== 'Todos') {
    const filtered = presets.filter(p => p.category.toLowerCase() === category.toLowerCase());
    return res.status(200).json({
      status: 'success',
      count: filtered.length,
      data: filtered
    });
  }

  return res.status(200).json({
    status: 'success',
    count: presets.length,
    data: presets
  });
};

// 2. GET /api/presets/:id - Consulta individual
exports.getPresetById = (req, res) => {
  const id = Number(req.params.id);
  const preset = presets.find(p => p.id === id);

  if (!preset) {
    return res.status(404).json({
      status: 'error',
      code: 404,
      message: 'Preset não encontrado para o ID informado.'
    });
  }

  return res.status(200).json({
    status: 'success',
    data: preset
  });
};

// 3. POST /api/presets - Criação de novo recurso
exports.createPreset = (req, res) => {
  const validationErrors = validatePresetInput(req.body, false);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Dados de entrada inválidos.',
      errors: validationErrors
    });
  }

  const newPreset = {
    id: nextId++,
    name: req.body.name.trim(),
    bpm: Number(req.body.bpm),
    category: req.body.category
  };

  presets.unshift(newPreset);

  return res.status(201).json({
    status: 'success',
    message: 'Preset criado com sucesso.',
    data: newPreset
  });
};

// 4. PUT /api/presets/:id - Alteração de recurso existente
exports.updatePreset = (req, res) => {
  const id = Number(req.params.id);
  const index = presets.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({
      status: 'error',
      code: 404,
      message: 'Não foi possível atualizar: Preset não encontrado.'
    });
  }

  const validationErrors = validatePresetInput(req.body, false);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Dados de atualização inválidos.',
      errors: validationErrors
    });
  }

  presets[index] = {
    id,
    name: req.body.name.trim(),
    bpm: Number(req.body.bpm),
    category: req.body.category
  };

  return res.status(200).json({
    status: 'success',
    message: 'Preset atualizado com sucesso.',
    data: presets[index]
  });
};

// 5. DELETE /api/presets/:id - Exclusão de recurso
exports.deletePreset = (req, res) => {
  const id = Number(req.params.id);
  const index = presets.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({
      status: 'error',
      code: 404,
      message: 'Não foi possível excluir: Preset não encontrado.'
    });
  }

  const removed = presets.splice(index, 1)[0];

  return res.status(200).json({
    status: 'success',
    message: 'Preset excluído com sucesso.',
    data: removed
  });
};