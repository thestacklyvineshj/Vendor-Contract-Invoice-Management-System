const { Vendor } = require('../models');

const getVendorForUser = async (user) => {
  if (user.role !== 'VENDOR') return null;
  const vendor = await Vendor.findOne({ where: { user_id: user.id } });
  if (!vendor) {
    const err = new Error('Vendor profile not found');
    err.status = 404;
    throw err;
  }
  return vendor;
};

module.exports = { getVendorForUser };
