const getStatus = (req, res) => {
  res.json({
    status: 'online',
    system: 'TJAEM Portal Engine v2.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

module.exports = { getStatus };
