const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

/**
 * Gera a carteira digital do associado
 * No futuro, isso usará um template base em PDF e carimbará os dados por cima.
 */
const generateDigitalWallet = async (member) => {
    try {
        // Criar um documento PDF vazio
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 350]); // Formato de carteirinha
        
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const { width, height } = page.getSize();

        // Fundo azul escuro da carteira
        page.drawRectangle({
            x: 0,
            y: 0,
            width,
            height,
            color: rgb(0.1, 0.2, 0.4),
        });

        // Cabeçalho
        page.drawText('TRIBUNAL DE JUSTIÇA ARBITRAL', {
            x: 50,
            y: height - 50,
            size: 24,
            font: boldFont,
            color: rgb(1, 1, 1),
        });

        page.drawText('DO ESTADO DO MARANHÃO - TJAEM', {
            x: 50,
            y: height - 75,
            size: 16,
            font: boldFont,
            color: rgb(0.8, 0.8, 0.8),
        });

        // Dados do associado
        const startY = height - 130;
        const lineSpacing = 25;

        page.drawText('NOME:', { x: 50, y: startY, size: 12, font, color: rgb(0.7, 0.7, 0.7) });
        page.drawText(member.name.toUpperCase(), { x: 100, y: startY, size: 14, font: boldFont, color: rgb(1, 1, 1) });

        page.drawText('FUNÇÃO:', { x: 50, y: startY - lineSpacing, size: 12, font, color: rgb(0.7, 0.7, 0.7) });
        page.drawText((member.documentType || 'ASSOCIADO').toUpperCase(), { x: 110, y: startY - lineSpacing, size: 14, font: boldFont, color: rgb(1, 1, 1) });

        // Validade
        const validateDate = new Date();
        validateDate.setFullYear(validateDate.getFullYear() + 1);
        const validateStr = validateDate.toLocaleDateString('pt-BR');

        page.drawText('VALIDADE:', { x: 50, y: startY - (lineSpacing * 2), size: 12, font, color: rgb(0.7, 0.7, 0.7) });
        page.drawText(validateStr, { x: 120, y: startY - (lineSpacing * 2), size: 14, font: boldFont, color: rgb(1, 1, 1) });
        
        // Rodapé / Registro
        page.drawText(`REGISTRO TJAEM: ${member.id}`, {
            x: 50,
            y: 40,
            size: 10,
            font,
            color: rgb(0.5, 0.5, 0.5),
        });

        // TODO: Se tivéssemos a foto, adicionaríamos aqui lendo o arquivo de member.documents.foto

        const pdfBytes = await pdfDoc.save();

        // Salvar em disco
        const artifactsDir = path.join(__dirname, '..', '..', 'production_artifacts');
        if (!fs.existsSync(artifactsDir)) {
            fs.mkdirSync(artifactsDir, { recursive: true });
        }
        
        const fileName = `carteira_${member.id}.pdf`;
        const filePath = path.join(artifactsDir, fileName);
        fs.writeFileSync(filePath, pdfBytes);

        return fileName;
    } catch (error) {
        console.error('Erro ao gerar carteira digital:', error);
        throw new Error('Falha ao gerar o PDF da carteira');
    }
};

module.exports = {
    generateDigitalWallet
};
