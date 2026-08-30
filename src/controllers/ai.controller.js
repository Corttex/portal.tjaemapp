const aiService = require('../services/ai.service');

const chat = async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    try {
        const responseText = await aiService.getChatResponse(message);
        res.json({ success: true, reply: responseText });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    chat
};
