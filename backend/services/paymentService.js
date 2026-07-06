const { Op } = require('sequelize');
const { Payment, Invoice, Vendor } = require('../models');
const { getPagination, paginatedResponse } = require('../utils/pagination');
const { getVendorForUser } = require('../utils/vendorHelper');

const updateInvoicePaymentStatus = async (invoice) => {
  const payments = await Payment.findAll({ where: { invoice_id: invoice.id } });
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.payment_amount), 0);
  const invoiceAmount = parseFloat(invoice.invoice_amount);

  let paymentStatus = 'UNPAID';
  if (totalPaid >= invoiceAmount) {
    paymentStatus = 'PAID';
  } else if (totalPaid > 0) {
    paymentStatus = 'PARTIALLY_PAID';
  }

  await invoice.update({ payment_status: paymentStatus });
  return paymentStatus;
};

const createPayment = async (data) => {
  const invoice = await Invoice.findByPk(data.invoice_id);
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.status = 404;
    throw err;
  }

  if (invoice.approval_status !== 'APPROVED') {
    const err = new Error('Payments can only be recorded for approved invoices');
    err.status = 400;
    throw err;
  }

  const amount = parseFloat(data.payment_amount);
  if (!amount || amount <= 0) {
    const err = new Error('Payment amount must be greater than zero');
    err.status = 400;
    throw err;
  }

  const existingPayments = await Payment.findAll({ where: { invoice_id: invoice.id } });
  const totalPaid = existingPayments.reduce((sum, p) => sum + parseFloat(p.payment_amount), 0);
  const invoiceAmount = parseFloat(invoice.invoice_amount);

  if (totalPaid + amount > invoiceAmount) {
    const err = new Error(`Payment exceeds remaining balance. Remaining: ${(invoiceAmount - totalPaid).toFixed(2)}`);
    err.status = 400;
    throw err;
  }

  const payment = await Payment.create(data);
  await updateInvoicePaymentStatus(invoice);

  return payment;
};

const getAllPayments = async (query, user) => {
  const { page, limit, offset } = getPagination(query);
  const invoiceWhere = {};

  if (user.role === 'VENDOR') {
    const vendor = await getVendorForUser(user);
    invoiceWhere.vendor_id = vendor.id;
  }

  const { rows, count } = await Payment.findAndCountAll({
    include: [
      {
        model: Invoice,
        as: 'invoice',
        where: Object.keys(invoiceWhere).length ? invoiceWhere : undefined,
        include: [{ model: Vendor, as: 'vendor', attributes: ['id', 'vendor_name'] }],
      },
    ],
    limit,
    offset,
    order: [['id', 'DESC']],
  });

  return paginatedResponse(rows, count, page, limit);
};

module.exports = { createPayment, getAllPayments, updateInvoicePaymentStatus };
