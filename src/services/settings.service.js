const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '..', '..', 'settings.json');

const getSettings = () => {
    if (!fs.existsSync(settingsPath)) {
        return {};
    }
    const data = fs.readFileSync(settingsPath, 'utf8');
    try {
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
};

const saveSettings = (newSettings) => {
    const current = getSettings();
    const updated = { ...current, ...newSettings };
    fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2));
    return updated;
};

const getApiKey = () => {
    const settings = getSettings();
    return settings.apiKey || process.env.OPENROUTER_API_KEY;
};

module.exports = {
    getSettings,
    saveSettings,
    getApiKey
};
