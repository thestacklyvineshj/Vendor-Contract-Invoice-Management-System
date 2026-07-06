const { Op } = require('sequelize');
const { Contract, Vendor } = require('../models');
const { getPagination, paginatedResponse, buildSearchCondition } = require('../utils/pagination');
const { getVendorForUser } = require('../utils/vendorHelper');

const getAllContracts = async (query, user) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};

  if (user.role === 'VENDOR') {
    const vendor = await getVendorForUser(user);
    where.vendor_id = vendor.id;
  } else if (query.vendor_id) {
    where.vendor_id = query.vendor_id;
  }

  if (query.status) where.status = query.status;

  const searchCondition = buildSearchCondition(['contract_title'], query.search);

  const { rows, count } = await Contract.findAndCountAll({
    where: { ...where, ...searchCondition },
    include: [{ model: Vendor, as: 'vendor', attributes: ['id', 'vendor_name', 'email'] }],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return paginatedResponse(rows, count, page, limit);
};

const createContract = async (data) => {
  const vendor = await Vendor.findByPk(data.vendor_id);
  if (!vendor) {
    const err = new Error('Vendor not found');
    err.status = 404;
    throw err;
  }
  return Contract.create(data);
};

const updateContract = async (id, data) => {
  const contract = await Contract.findByPk(id);
  if (!contract) {
    const err = new Error('Contract not found');
    err.status = 404;
    throw err;
  }
  await contract.update(data);
  return contract;
};

const deleteContract = async (id) => {
  const contract = await Contract.findByPk(id);
  if (!contract) {
    const err = new Error('Contract not found');
    err.status = 404;
    throw err;
  }
  await contract.destroy();
  return { message: 'Contract deleted successfully' };
};

const getContractById = async (id, user) => {
  const contract = await Contract.findByPk(id, {
    include: [{ model: Vendor, as: 'vendor' }],
  });
  if (!contract) {
    const err = new Error('Contract not found');
    err.status = 404;
    throw err;
  }

  if (user.role === 'VENDOR') {
    const vendor = await getVendorForUser(user);
    if (contract.vendor_id !== vendor.id) {
      const err = new Error('Access denied');
      err.status = 403;
      throw err;
    }
  }

  return contract;
};

module.exports = {
  getAllContracts,
  createContract,
  updateContract,
  deleteContract,
  getContractById,
};
