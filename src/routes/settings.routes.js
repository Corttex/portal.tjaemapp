const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');

router.post('/apikey', express.json(), settingsController.saveApiKey);
router.get('/status', settingsController.getStatus);

module.exports = router;
