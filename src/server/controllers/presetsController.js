const presetsRepository = require('../repositories/presetsRepository');

function validatePresetPayload(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 3) {
    errors.push('O campo "name" é obrigatório e deve ter pelo menos 3 caracteres.');
  }

  const bpmNum = Number(data.bpm);
  if (data.bpm === undefined || isNaN(bpmNum) || bpmNum < 40 || bpmNum > 240) {
    errors.push('O campo "bpm" deve ser um número inteiro válido entre 40 e 240.');
  }

  const catIdentifier = data.category_id !== undefined ? data.category_id : data.category;
  if (!catIdentifier) {
    errors.push('É obrigatório informar "category" ou "category_id".');
  }

  return errors;
}

// GET /api/presets/categories - Lista as categorias da Entidade 1
exports.getCategories = (req, res) => {
  try {
    const categories = presetsRepository.findAllCategories();
    return res.status(200).json({
      status: 'success',
      count: categories.length,
      data: categories
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Erro de persistência ao consultar categorias na base de dados.',
      detail: error.message
    });
  }
};

// 1. GET /api/presets - Consulta geral no banco de dados
exports.getAllPresets = (req, res) => {
  try {
    const { category } = req.query;
    const list = presetsRepository.findAll(category);

    return res.status(200).json({
      status: 'success',
      count: list.length,
      data: list
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Erro de persistência ao consultar os presets na base de dados.',
      detail: error.message
    });
  }
};

// 2. GET /api/presets/:id - Consulta individual no banco de dados
exports.getPresetById = (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'O ID fornecido deve ser um número válido.'
      });
    }

    const preset = presetsRepository.findById(id);
    if (!preset) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Preset não encontrado na base de dados.'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: preset
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Erro de persistência ao consultar o preset.',
      detail: error.message
    });
  }
};

// 3. POST /api/presets - Criação com persistência e verificação de relacionamento
exports.createPreset = (req, res) => {
  try {
    const validationErrors = validatePresetPayload(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Dados de entrada inválidos.',
        errors: validationErrors
      });
    }

    const catIdentifier = req.body.category_id !== undefined ? req.body.category_id : req.body.category;
    const categoryRecord = presetsRepository.findCategory(catIdentifier);

    if (!categoryRecord) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'A categoria informada não existe na base de dados.',
        errors: ['Categorias válidas: Hip-Hop, Eletrónica, Rock, Experimental.']
      });
    }

    const createdPreset = presetsRepository.create({
      name: req.body.name.trim(),
      bpm: Math.round(Number(req.body.bpm)),
      categoryId: categoryRecord.id
    });

    return res.status(201).json({
      status: 'success',
      message: 'Preset persistido na base de dados com sucesso.',
      data: createdPreset
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Erro de persistência ao guardar o preset na base de dados.',
      detail: error.message
    });
  }
};

// 4. PUT /api/presets/:id - Atualização com persistência
exports.updatePreset = (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'O ID fornecido deve ser um número válido.'
      });
    }

    const existing = presetsRepository.findById(id);
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Não foi possível atualizar: Preset não encontrado na base de dados.'
      });
    }

    const validationErrors = validatePresetPayload(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Dados de atualização inválidos.',
        errors: validationErrors
      });
    }

    const catIdentifier = req.body.category_id !== undefined ? req.body.category_id : req.body.category;
    const categoryRecord = presetsRepository.findCategory(catIdentifier);

    if (!categoryRecord) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'A categoria informada não existe na base de dados.'
      });
    }

    const updated = presetsRepository.update(id, {
      name: req.body.name.trim(),
      bpm: Math.round(Number(req.body.bpm)),
      categoryId: categoryRecord.id
    });

    return res.status(200).json({
      status: 'success',
      message: 'Preset atualizado na base de dados com sucesso.',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Erro de persistência ao atualizar o preset.',
      detail: error.message
    });
  }
};

// 5. DELETE /api/presets/:id - Exclusão na base de dados
exports.deletePreset = (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'O ID fornecido deve ser um número válido.'
      });
    }

    const removed = presetsRepository.delete(id);
    if (!removed) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Não foi possível excluir: Preset não encontrado na base de dados.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Preset excluído permanentemente da base de dados.',
      data: removed
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Erro de persistência ao excluir o preset.',
      detail: error.message
    });
  }
};