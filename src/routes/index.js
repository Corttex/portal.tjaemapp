const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const healthRoutes = require('./health.routes');
const agentRoutes = require('./agent.routes');
const membersRoutes = require('./members.routes');
const settingsRoutes = require('./settings.routes');
const aiRoutes = require('./ai.routes');

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/agents', agentRoutes);
router.use('/members', membersRoutes);
router.use('/settings', settingsRoutes);
router.use('/chat', aiRoutes);

module.exports = router;
