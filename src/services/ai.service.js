const axios = require('axios');
const settingsService = require('./settings.service');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const getChatResponse = async (userMessage) => {
    const apiKey = settingsService.getApiKey();
    if (!apiKey) {
        throw new Error('API Key não configurada. Acesse as Configurações do Sistema para inseri-la.');
    }

    const systemPrompt = `Você é o Assistente Especializado do TJAEM (Tribunal de Justiça Arbitral e Mediação) e da CAMEB (Câmara de Arbitragem e Mediação do Brasil).
Sua função é auxiliar árbitros, mediadores e secretários com dúvidas processuais, regras de conformidade da CAMEB, andamento de processos, e elaboração de atas e sentenças.
Responda de forma institucional, polida, clara e objetiva.`;

    try {
        const response = await axios.post(OPENROUTER_URL, {
            model: 'google/gemma-2-9b-it:free',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Erro ao chamar OpenRouter API:', error.response?.data || error.message);
        throw new Error('Falha ao obter resposta da Inteligência Artificial.');
    }
};

module.exports = {
    getChatResponse
};
