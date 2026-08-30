const axios = require('axios');
const config = require('../config/env');
const dotenv = require('dotenv');
dotenv.config();

const ASAAS_API_KEY = process.env.ASAAS_API_KEY || 'your_asaas_api_key';
const ASAAS_URL = process.env.ASAAS_URL || 'https://sandbox.asaas.com/api/v3';

const asaasClient = axios.create({
    baseURL: ASAAS_URL,
    headers: {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json'
    }
});

/**
 * Cria ou busca um cliente no Asaas
 */
const createOrGetCustomer = async (member) => {
    try {
        // Primeiro tenta buscar se já existe pelo email ou CPF (assumindo que CPF está no externalReference)
        const searchResponse = await asaasClient.get(`/customers`, {
            params: {
                email: member.email
            }
        });

        if (searchResponse.data && searchResponse.data.data && searchResponse.data.data.length > 0) {
            return searchResponse.data.data[0].id;
        }

        // Se não existir, cria o cliente
        const customerData = {
            name: member.name,
            email: member.email,
            mobilePhone: member.whatsapp,
            externalReference: member.id,
            // Poderíamos extrair CPF/CNPJ do form e passar como 'cpfCnpj' aqui.
        };

        const createResponse = await asaasClient.post('/customers', customerData);
        return createResponse.data.id;
    } catch (error) {
        console.error('Erro ao integrar com Asaas (Customer):', error.response?.data || error.message);
        throw new Error('Falha ao criar cliente no Asaas');
    }
};

/**
 * Cria uma cobrança para o cliente
 */
const createPayment = async (customerId, value, description) => {
    try {
        const paymentData = {
            customer: customerId,
            billingType: 'UNDEFINED', // PIX, BOLETO, CREDIT_CARD ou UNDEFINED para escolher na tela
            value: value,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias
            description: description,
        };

        const response = await asaasClient.post('/payments', paymentData);
        return response.data;
    } catch (error) {
        console.error('Erro ao integrar com Asaas (Payment):', error.response?.data || error.message);
        throw new Error('Falha ao criar cobrança no Asaas');
    }
};

module.exports = {
    createOrGetCustomer,
    createPayment
};
