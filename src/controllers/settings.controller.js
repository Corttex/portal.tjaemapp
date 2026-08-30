const settingsService = require('../services/settings.service');

const saveApiKey = (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) {
        return res.status(400).json({ error: 'API Key é obrigatória' });
    }
    
    settingsService.saveSettings({ apiKey });
    res.json({ success: true, message: 'API Key salva com sucesso e aplicada ao sistema.' });
};

const getStatus = (req, res) => {
    const apiKey = settingsService.getApiKey();
    res.json({ hasApiKey: !!apiKey });
};

module.exports = {
    saveApiKey,
    getStatus
};
