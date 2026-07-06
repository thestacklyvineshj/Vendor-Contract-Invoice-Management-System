const { Op } = require('sequelize');

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const paginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  },
});

const buildSearchCondition = (fields, search) => {
  if (!search || !search.trim()) return {};
  const term = `%${search.trim()}%`;
  return {
    [Op.or]: fields.map((field) => ({ [field]: { [Op.like]: term } })),
  };
};

module.exports = { getPagination, paginatedResponse, buildSearchCondition };
