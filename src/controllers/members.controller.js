const membersService = require('../services/members.service');
const asaasService = require('../services/asaas.service');
const pdfService = require('../services/pdf.service');

const searchMembers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 3) {
            return res.status(400).json({ error: 'Forneça pelo menos 3 caracteres para a busca.' });
        }

        const results = await membersService.searchMembers(q);
        return res.json({ results });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao pesquisar associados.', details: error.message });
    }
};

const updateMember = async (req, res) => {
    try {
        const { memberId, email, whatsapp, fullAddress, documentType } = req.body;
        const files = req.files; 
        
        if (!memberId) {
            return res.status(400).json({ error: 'ID do associado é obrigatório.' });
        }

        const member = await membersService.getMemberById(memberId);
        if (!member) {
            return res.status(404).json({ error: 'Associado não encontrado.' });
        }

        // Atualiza os dados
        member.email = email || member.email;
        member.whatsapp = whatsapp || member.whatsapp;
        member.fullAddress = fullAddress || member.fullAddress;
        member.documentType = documentType || member.documentType;
        member.status = 'AGUARDANDO_PAGAMENTO';

        if (files) {
            member.documents = member.documents || {};
            if (files.identidade) {
                member.documents.identidade = files.identidade[0].filename;
            }
            if (files.carteiraAtual) {
                member.documents.carteiraAtual = files.carteiraAtual[0].filename;
            }
        }

        const updatedMember = await membersService.saveOrUpdateMember(member);

        try {
            // Integração Asaas
            const customerId = await asaasService.createOrGetCustomer(updatedMember);
            const paymentData = await asaasService.createPayment(customerId, 250.00, 'Renovação Anual TJAEM Brasil');

            return res.json({
                success: true,
                message: 'Dados atualizados com sucesso! Você será redirecionado para o pagamento.',
                paymentUrl: paymentData.invoiceUrl,
                member: updatedMember
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao gerar a cobrança no Asaas.', details: error.message });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao atualizar associado.', details: error.message });
    }
};

const resetMembers = async (req, res) => {
    try {
        const result = await membersService.zeroMembersData();
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao zerar dados.', details: error.message });
    }
};

const handleWebhook = async (req, res) => {
    const { event, payment } = req.body;
    
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
        const searchId = payment.externalReference;
        const searchEmail = payment.customerEmail;
        
        let member = null;
        if (searchId) {
            member = await membersService.getMemberById(searchId);
        }

        if (member) {
            member.status = 'ATIVO';
            
            try {
                const pdfFileName = await pdfService.generateDigitalWallet(member);
                member.documents = member.documents || {};
                member.documents.carteiraDigital = pdfFileName;
                
                await membersService.saveOrUpdateMember(member);
                console.log(`[WEBHOOK] Pagamento confirmado e carteira gerada no PostgreSQL/JSON para: ${member.name}`);
            } catch (error) {
                console.error('[WEBHOOK ERROR] Erro ao gerar carteira:', error);
            }
        }
    }
    
    return res.status(200).send('OK');
};

module.exports = {
    searchMembers,
    updateMember,
    resetMembers,
    handleWebhook
};
