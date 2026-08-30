const AgentService = require('../services/agent.service');

const getSkills = (req, res) => {
  res.json({ success: true, skills: AgentService.getSkills() });
};

const getPipelines = (req, res) => {
  res.json({ success: true, pipelines: AgentService.getPipelines() });
};

const createPipeline = (req, res) => {
  const { name, steps } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Nome do pipeline é obrigatório.' });

  const pipeline = AgentService.createPipeline({ name, steps });
  res.json({ success: true, pipeline });
};

const runPipeline = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await AgentService.runPipeline(id);
    res.json(result);
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSkills,
  getPipelines,
  createPipeline,
  runPipeline
};
