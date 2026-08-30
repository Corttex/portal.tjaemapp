const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');
const db = require('../config/database');
const logger = require('../utils/logger');

const membersDbPath = path.join(__dirname, '..', '..', 'members.json');

// --- Helper local JSON ---
const getMembersJson = () => {
  if (!fs.existsSync(membersDbPath)) return [];
  try {
    const data = fs.readFileSync(membersDbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const saveMembersJson = (members) => {
  fs.writeFileSync(membersDbPath, JSON.stringify(members, null, 2));
};

// --- Service Principal ---

/**
 * Busca membros por termo (nome, cpf, id) no PostgreSQL ou JSON
 */
const searchMembers = async (q) => {
  if (!q || q.length < 3) return [];

  // Tenta consultar no PostgreSQL primeiro
  try {
    const res = await db.query(
      `SELECT id, name, cpf, email, whatsapp, full_address as "fullAddress", 
              document_type as "documentType", status, link, documents, created_at as "createdAt"
       FROM members
       WHERE name ILIKE $1 OR cpf ILIKE $1 OR id ILIKE $1
       ORDER BY name ASC
       LIMIT 10`,
      [`%${q}%`]
    );

    if (res && res.rows.length > 0) {
      return res.rows;
    }
  } catch (err) {
    logger.warn(`[MEMBERS SERVICE] PG Search indisponível (${err.message}). Usando fallback JSON.`);
  }

  // Fallback JSON com busca por inclusão e fuzzy string matching
  const members = getMembersJson();
  const queryLower = q.toLowerCase();

  let matches = members.filter(m => 
    (m.name && m.name.toLowerCase().includes(queryLower)) ||
    (m.id && m.id.toLowerCase().includes(queryLower)) ||
    (m.cpf && m.cpf.includes(q))
  );

  if (matches.length === 0 && members.length > 0) {
    const memberNames = members.map(m => m.name || '');
    const matchesFuzzy = stringSimilarity.findBestMatch(queryLower, memberNames);

    matchesFuzzy.ratings
      .filter(r => r.rating > 0.4)
      .slice(0, 10)
      .forEach(r => {
        const found = members.find(m => m.name === r.target);
        if (found && !matches.find(m => m.id === found.id)) {
          matches.push(found);
        }
      });
  }

  return matches.slice(0, 10);
};

/**
 * Busca membro por ID
 */
const getMemberById = async (id) => {
  try {
    const res = await db.query(
      `SELECT id, name, cpf, email, whatsapp, full_address as "fullAddress", 
              document_type as "documentType", status, link, documents, created_at as "createdAt"
       FROM members WHERE id = $1`,
      [id]
    );

    if (res && res.rows.length > 0) {
      return res.rows[0];
    }
  } catch (err) {
    logger.warn(`[MEMBERS SERVICE] PG getMemberById indisponível. Usando JSON.`);
  }

  const members = getMembersJson();
  return members.find(m => m.id === id) || null;
};

/**
 * Insere ou Atualiza Membro no PostgreSQL e sincroniza com JSON
 */
const saveOrUpdateMember = async (memberData) => {
  const now = new Date().toISOString();
  const id = memberData.id;

  if (!id) throw new Error('ID do associado é obrigatório');

  // 1. PostgreSQL Persistence
  try {
    const existing = await db.query('SELECT id FROM members WHERE id = $1', [id]);
    if (existing && existing.rows.length > 0) {
      await db.query(
        `UPDATE members
         SET name = COALESCE($1, name),
             cpf = COALESCE($2, cpf),
             email = COALESCE($3, email),
             whatsapp = COALESCE($4, whatsapp),
             full_address = COALESCE($5, full_address),
             document_type = COALESCE($6, document_type),
             status = COALESCE($7, status),
             documents = COALESCE($8::jsonb, documents),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $9`,
        [
          memberData.name,
          memberData.cpf,
          memberData.email,
          memberData.whatsapp,
          memberData.fullAddress,
          memberData.documentType,
          memberData.status,
          JSON.stringify(memberData.documents || {}),
          id
        ]
      );
      logger.info(`[MEMBERS SERVICE] Membro ${id} atualizado no PostgreSQL.`);
    } else {
      await db.query(
        `INSERT INTO members (id, name, cpf, email, whatsapp, full_address, document_type, status, link, documents)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)`,
        [
          id,
          memberData.name || 'Membro TJAEM',
          memberData.cpf || null,
          memberData.email || null,
          memberData.whatsapp || null,
          memberData.fullAddress || null,
          memberData.documentType || null,
          memberData.status || 'PENDENTE_ATUALIZACAO',
          memberData.link || null,
          JSON.stringify(memberData.documents || {})
        ]
      );
      logger.info(`[MEMBERS SERVICE] Membro ${id} inserido no PostgreSQL.`);
    }
  } catch (err) {
    logger.warn(`[MEMBERS SERVICE] Falha ao persistir no PG (${err.message}). Mantendo sincronia JSON.`);
  }

  // 2. JSON Fallback Persistence
  const members = getMembersJson();
  const idx = members.findIndex(m => m.id === id);

  if (idx !== -1) {
    members[idx] = { ...members[idx], ...memberData, updatedAt: now };
  } else {
    members.push({ ...memberData, createdAt: now, updatedAt: now });
  }

  saveMembersJson(members);
  return idx !== -1 ? members[idx] : memberData;
};

/**
 * Zera/Reseta os dados dos membros (Conforme solicitado pelo usuário)
 */
const zeroMembersData = async () => {
  logger.info('[MEMBERS SERVICE] Executando zeramento/reset de dados...');
  
  // 1. Limpa PostgreSQL
  try {
    await db.query('TRUNCATE TABLE members RESTART IDENTITY CASCADE');
    logger.info('[MEMBERS SERVICE] Tabela members truncada no PostgreSQL.');
  } catch (err) {
    logger.warn(`[MEMBERS SERVICE] PG Truncate indisponível: ${err.message}`);
  }

  // 2. Limpa JSON local para estado inicial zerado []
  saveMembersJson([]);
  return { success: true, message: 'Dados de membros zerados com sucesso para novos uploads.' };
};

module.exports = {
  searchMembers,
  getMemberById,
  saveOrUpdateMember,
  zeroMembersData,
  getMembersJson
};
