const { Op } = require('sequelize');
const { Invoice, Contract, Vendor, Payment, InvoiceComment, User } = require('../models');
const { getPagination, paginatedResponse, buildSearchCondition } = require('../utils/pagination');
const { getVendorForUser } = require('../utils/vendorHelper');

const generateInvoiceNumber = async () => {
  const count = await Invoice.count();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `INV-${date}-${String(count + 1).padStart(4, '0')}`;
};

const getAllInvoices = async (query, user) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};

  if (user.role === 'VENDOR') {
    const vendor = await getVendorForUser(user);
    where.vendor_id = vendor.id;
  } else if (query.vendor_id) {
    where.vendor_id = query.vendor_id;
  }

  if (query.approval_status) where.approval_status = query.approval_status;
  if (query.payment_status) {
    where.payment_status = query.payment_status.includes(',')
      ? { [Op.in]: query.payment_status.split(',') }
      : query.payment_status;
  }

  const searchCondition = buildSearchCondition(['invoice_number'], query.search);

  const { rows, count } = await Invoice.findAndCountAll({
    where: { ...where, ...searchCondition },
    include: [
      { model: Vendor, as: 'vendor', attributes: ['id', 'vendor_name', 'email'] },
      { model: Contract, as: 'contract', attributes: ['id', 'contract_title'] },
      { model: Payment, as: 'payments' },
    ],
    limit,
    offset,
    order: [['id', 'DESC']],
  });

  return paginatedResponse(rows, count, page, limit);
};

const getInvoiceById = async (id, user) => {
  const invoice = await Invoice.findByPk(id, {
    include: [
      { model: Vendor, as: 'vendor' },
      { model: Contract, as: 'contract' },
      { model: Payment, as: 'payments' },
      {
        model: InvoiceComment,
        as: 'comments',
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'role'] }],
      },
    ],
  });

  if (!invoice) {
    const err = new Error('Invoice not found');
    err.status = 404;
    throw err;
  }

  if (user.role === 'VENDOR') {
    const vendor = await getVendorForUser(user);
    if (invoice.vendor_id !== vendor.id) {
      const err = new Error('Access denied');
      err.status = 403;
      throw err;
    }
  }

  return invoice;
};

const createInvoice = async (data, user) => {
  const vendor = await getVendorForUser(user);

  const contract = await Contract.findByPk(data.contract_id);
  if (!contract || contract.vendor_id !== vendor.id) {
    const err = new Error('Invalid contract for this vendor');
    err.status = 400;
    throw err;
  }

  const invoiceNumber = data.invoice_number || (await generateInvoiceNumber());

  return Invoice.create({
    vendor_id: vendor.id,
    contract_id: data.contract_id,
    invoice_number: invoiceNumber,
    invoice_amount: data.invoice_amount,
    invoice_date: data.invoice_date,
    due_date: data.due_date,
    approval_status: 'PENDING',
    payment_status: 'UNPAID',
  });
};

const updateInvoice = async (id, data, user) => {
  const invoice = await getInvoiceById(id, user);

  if (user.role === 'VENDOR') {
    if (invoice.approval_status !== 'PENDING') {
      const err = new Error('Cannot update invoice after approval decision');
      err.status = 400;
      throw err;
    }
    const allowed = ['invoice_amount', 'invoice_date', 'due_date'];
    const updates = {};
    allowed.forEach((key) => {
      if (data[key] !== undefined) updates[key] = data[key];
    });
    await invoice.update(updates);
  } else if (user.role === 'ADMIN') {
    await invoice.update(data);
  } else {
    const err = new Error('Access denied');
    err.status = 403;
    throw err;
  }

  return invoice;
};

const deleteInvoice = async (id, user) => {
  const invoice = await getInvoiceById(id, user);

  if (user.role === 'VENDOR' && invoice.approval_status !== 'PENDING') {
    const err = new Error('Cannot delete invoice after approval decision');
    err.status = 400;
    throw err;
  }

  await invoice.destroy();
  return { message: 'Invoice deleted successfully' };
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};
