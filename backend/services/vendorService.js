const { Op } = require('sequelize');
const { Vendor } = require('../models');
const { getPagination, paginatedResponse, buildSearchCondition } = require('../utils/pagination');
const { getVendorForUser } = require('../utils/vendorHelper');

const getAllVendors = async (query, user) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};

  if (user.role === 'VENDOR') {
    const vendor = await getVendorForUser(user);
    where.id = vendor.id;
  }

  if (query.status) where.status = query.status;

  const searchCondition = buildSearchCondition(
    ['vendor_name', 'contact_person', 'email', 'phone'],
    query.search
  );

  const { rows, count } = await Vendor.findAndCountAll({
    where: { ...where, ...searchCondition },
    limit,
    offset,
    order: [['id', 'DESC']],
  });

  return paginatedResponse(rows, count, page, limit);
};

const createVendor = async (data) => {
  return Vendor.create(data);
};

const updateVendor = async (id, data, user) => {
  const vendor = await Vendor.findByPk(id);
  if (!vendor) {
    const err = new Error('Vendor not found');
    err.status = 404;
    throw err;
  }

  if (user.role === 'VENDOR') {
    const ownVendor = await getVendorForUser(user);
    if (ownVendor.id !== parseInt(id, 10)) {
      const err = new Error('Access denied');
      err.status = 403;
      throw err;
    }
  }

  await vendor.update(data);
  return vendor;
};

const deleteVendor = async (id) => {
  const vendor = await Vendor.findByPk(id);
  if (!vendor) {
    const err = new Error('Vendor not found');
    err.status = 404;
    throw err;
  }
  await vendor.destroy();
  return { message: 'Vendor deleted successfully' };
};

const getVendorById = async (id) => {
  const vendor = await Vendor.findByPk(id);
  if (!vendor) {
    const err = new Error('Vendor not found');
    err.status = 404;
    throw err;
  }
  return vendor;
};

module.exports = {
  getAllVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorById,
};
