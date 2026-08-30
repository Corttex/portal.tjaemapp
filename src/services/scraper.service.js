const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeMembers() {
    console.log('Iniciando o scraper de associados...');
    try {
        const response = await axios.get('https://tjaembrasil.com.br/associados/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html = response.data;
        const $ = cheerio.load(html);

        const members = [];
        
        // Find links that look like member profiles
        $('a').each((index, element) => {
            const link = $(element).attr('href');
            const name = $(element).text().trim();

            if (link && link.includes('/associados/') && name && name.length > 5) {
                // Avoid duplicates and non-member links
                if (!members.find(m => m.link === link) && name.toUpperCase() === name) {
                    members.push({
                        id: Math.random().toString(36).substring(2, 10),
                        name,
                        link,
                        status: 'PENDENTE_ATUALIZACAO',
                        createdAt: new Date().toISOString()
                    });
                }
            }
        });

        console.log(`Foram encontrados ${members.length} associados.`);
        
        const dataPath = path.join(__dirname, '..', '..', 'members.json');
        fs.writeFileSync(dataPath, JSON.stringify(members, null, 2));
        
        console.log(`Dados salvos em ${dataPath}`);
        return members;
    } catch (error) {
        console.error('Erro ao fazer o scraping:', error.message);
    }
}

// Allow running directly
if (require.main === module) {
    scrapeMembers();
}

module.exports = { scrapeMembers };
