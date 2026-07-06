const { Invoice, InvoiceComment } = require('../models');

const approveInvoice = async (id, userId) => {
  const invoice = await Invoice.findByPk(id);
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.status = 404;
    throw err;
  }

  if (invoice.approval_status !== 'PENDING') {
    const err = new Error('Only pending invoices can be approved');
    err.status = 400;
    throw err;
  }

  await invoice.update({ approval_status: 'APPROVED' });

  await InvoiceComment.create({
    invoice_id: id,
    user_id: userId,
    comment: 'Invoice approved',
  });

  return invoice;
};

const rejectInvoice = async (id, userId, comment) => {
  const invoice = await Invoice.findByPk(id);
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.status = 404;
    throw err;
  }

  if (invoice.approval_status !== 'PENDING') {
    const err = new Error('Only pending invoices can be rejected');
    err.status = 400;
    throw err;
  }

  await invoice.update({ approval_status: 'REJECTED' });

  if (comment) {
    await InvoiceComment.create({
      invoice_id: id,
      user_id: userId,
      comment,
    });
  }

  return invoice;
};

module.exports = { approveInvoice, rejectInvoice };
