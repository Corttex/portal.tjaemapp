const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agent.controller');

router.get('/skills', agentController.getSkills);
router.get('/pipelines', agentController.getPipelines);
router.post('/pipelines', agentController.createPipeline);
router.post('/pipelines/:id/run', agentController.runPipeline);

module.exports = router;
