const { Op, fn, col, literal } = require('sequelize');
const {
  Vendor, Contract, Invoice, Payment,
} = require('../models');
const { getVendorForUser } = require('../utils/vendorHelper');

const getAdminDashboard = async () => {
  const totalVendors = await Vendor.count({ where: { status: 'ACTIVE' } });
  const totalContracts = await Contract.count();
  const totalInvoices = await Invoice.count();
  const totalPayments = await Payment.sum('payment_amount') || 0;

  const approvalCounts = await Invoice.findAll({
    attributes: ['approval_status', [fn('COUNT', col('id')), 'count']],
    group: ['approval_status'],
    raw: true,
  });

  const pendingVsApproved = {
    pending: 0,
    approved: 0,
    rejected: 0,
  };
  approvalCounts.forEach((item) => {
    const key = item.approval_status.toLowerCase();
    pendingVsApproved[key] = parseInt(item.count, 10);
  });

  const monthlyInvoiceVolume = await Invoice.findAll({
    attributes: [
      [fn('DATE_FORMAT', col('invoice_date'), '%Y-%m'), 'month'],
      [fn('COUNT', col('id')), 'count'],
      [fn('SUM', col('invoice_amount')), 'total_amount'],
    ],
    group: [fn('DATE_FORMAT', col('invoice_date'), '%Y-%m')],
    order: [[fn('DATE_FORMAT', col('invoice_date'), '%Y-%m'), 'ASC']],
    raw: true,
  });

  const vendorPaymentDistribution = await Payment.findAll({
    attributes: [
      [col('invoice.vendor.vendor_name'), 'vendor_name'],
      [fn('SUM', col('payment_amount')), 'total_paid'],
    ],
    include: [{
      model: Invoice,
      as: 'invoice',
      attributes: [],
      include: [{ model: Vendor, as: 'vendor', attributes: [] }],
    }],
    group: ['invoice.vendor_id', 'invoice.vendor.vendor_name'],
    raw: true,
  });

  const paymentTrends = await Payment.findAll({
    attributes: [
      [fn('DATE_FORMAT', col('payment_date'), '%Y-%m'), 'month'],
      [fn('SUM', col('payment_amount')), 'total'],
      [fn('COUNT', col('id')), 'count'],
    ],
    group: [fn('DATE_FORMAT', col('payment_date'), '%Y-%m')],
    order: [[fn('DATE_FORMAT', col('payment_date'), '%Y-%m'), 'ASC']],
    raw: true,
  });

  const topVendorsByContractValue = await Contract.findAll({
    attributes: [
      [col('vendor.vendor_name'), 'vendor_name'],
      [fn('SUM', col('contract_value')), 'total_value'],
      [fn('COUNT', col('Contract.id')), 'contract_count'],
    ],
    include: [{ model: Vendor, as: 'vendor', attributes: [] }],
    group: ['vendor_id', 'vendor.vendor_name'],
    order: [[fn('SUM', col('contract_value')), 'DESC']],
    limit: 5,
    raw: true,
  });

  return {
    summary: {
      totalVendors,
      totalContracts,
      totalInvoices,
      totalPayments: parseFloat(totalPayments),
    },
    pendingVsApproved,
    monthlyInvoiceVolume,
    vendorPaymentDistribution,
    paymentTrends,
    topVendorsByContractValue,
  };
};

const getFinanceDashboard = async () => {
  const pendingApprovals = await Invoice.count({ where: { approval_status: 'PENDING' } });
  const approvedUnpaid = await Invoice.count({
    where: { approval_status: 'APPROVED', payment_status: { [Op.ne]: 'PAID' } },
  });
  const totalPaid = await Payment.sum('payment_amount') || 0;

  const recentInvoices = await Invoice.findAll({
    include: [
      { model: Vendor, as: 'vendor', attributes: ['vendor_name'] },
      { model: Contract, as: 'contract', attributes: ['contract_title'] },
    ],
    order: [['id', 'DESC']],
    limit: 10,
  });

  const pendingInvoices = await Invoice.findAll({
    where: { approval_status: 'PENDING' },
    include: [
      { model: Vendor, as: 'vendor', attributes: ['vendor_name'] },
      { model: Contract, as: 'contract', attributes: ['contract_title'] },
    ],
    order: [['invoice_date', 'ASC']],
    limit: 10,
  });

  return {
    summary: {
      pendingApprovals,
      approvedUnpaid,
      totalPaid: parseFloat(totalPaid),
    },
    recentInvoices,
    pendingInvoices,
  };
};

const getVendorDashboard = async (user) => {
  const vendor = await getVendorForUser(user);

  const totalContracts = await Contract.count({ where: { vendor_id: vendor.id } });
  const totalInvoices = await Invoice.count({ where: { vendor_id: vendor.id } });

  const invoiceStatusBreakdown = await Invoice.findAll({
    where: { vendor_id: vendor.id },
    attributes: ['approval_status', 'payment_status', [fn('COUNT', col('id')), 'count']],
    group: ['approval_status', 'payment_status'],
    raw: true,
  });

  const recentInvoices = await Invoice.findAll({
    where: { vendor_id: vendor.id },
    include: [{ model: Contract, as: 'contract', attributes: ['contract_title'] }],
    order: [['id', 'DESC']],
    limit: 10,
  });

  const payments = await Payment.findAll({
    include: [{
      model: Invoice,
      as: 'invoice',
      where: { vendor_id: vendor.id },
      attributes: ['invoice_number', 'invoice_amount'],
    }],
    order: [['id', 'DESC']],
    limit: 10,
  });

  const contracts = await Contract.findAll({
    where: { vendor_id: vendor.id, status: 'ACTIVE' },
    order: [['end_date', 'ASC']],
    limit: 5,
  });

  return {
    summary: {
      totalContracts,
      totalInvoices,
      vendorName: vendor.vendor_name,
    },
    invoiceStatusBreakdown,
    recentInvoices,
    payments,
    contracts,
  };
};

module.exports = { getAdminDashboard, getFinanceDashboard, getVendorDashboard };
