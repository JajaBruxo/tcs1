const express = require('express');
const router = express.Router();
const controller = require('../controllers/presetsController');

router.get('/', controller.getAllPresets);
router.get('/:id', controller.getPresetById);
router.post('/', controller.createPreset);
router.put('/:id', controller.updatePreset);
router.delete('/:id', controller.deletePreset);

module.exports = router;