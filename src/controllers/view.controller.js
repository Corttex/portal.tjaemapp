const path = require('path');
const config = require('../config/env');

const renderDashboard = (req, res) => {
  res.sendFile(path.join(config.rootBuildPath, 'index.html'));
};

const renderMasterAdmin = (req, res) => {
  res.sendFile(path.join(config.rootBuildPath, 'master/index.html'));
};

const renderAutomationStudio = (req, res) => {
  res.sendFile(path.join(config.rootBuildPath, 'automation/index.html'));
};

const renderRecadastramento = (req, res) => {
  res.sendFile(path.join(config.rootBuildPath, 'recadastramento.html'));
};

const renderCredencial = (req, res) => {
  res.sendFile(path.join(config.rootBuildPath, 'credencial.html'));
};

const renderAssociadosList = (req, res) => {
  res.sendFile(path.join(config.rootBuildPath, 'associados.html'));
};

module.exports = {
  renderDashboard,
  renderMasterAdmin,
  renderAutomationStudio,
  renderRecadastramento,
  renderCredencial,
  renderAssociadosList
};
