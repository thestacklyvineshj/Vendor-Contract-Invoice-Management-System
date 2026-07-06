const dashboardService = require('../services/dashboardService');

const getAdmin = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminDashboard();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getFinance = async (req, res, next) => {
  try {
    const data = await dashboardService.getFinanceDashboard();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getVendor = async (req, res, next) => {
  try {
    const data = await dashboardService.getVendorDashboard(req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAdmin, getFinance, getVendor };
