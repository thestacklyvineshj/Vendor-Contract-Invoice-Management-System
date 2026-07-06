const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: {
    type: DataTypes.ENUM('ADMIN', 'FINANCE_MANAGER', 'VENDOR'),
    allowNull: false,
    defaultValue: 'VENDOR',
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'users' });

const Vendor = sequelize.define('Vendor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  vendor_name: { type: DataTypes.STRING(150), allowNull: false },
  contact_person: { type: DataTypes.STRING(100), allowNull: false },
  phone: { type: DataTypes.STRING(20), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  address: { type: DataTypes.TEXT, allowNull: false },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    allowNull: false,
    defaultValue: 'ACTIVE',
  },
}, { tableName: 'vendors' });

const Contract = sequelize.define('Contract', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vendor_id: { type: DataTypes.INTEGER, allowNull: false },
  contract_title: { type: DataTypes.STRING(200), allowNull: false },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  contract_value: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'TERMINATED'),
    allowNull: false,
    defaultValue: 'ACTIVE',
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'contracts' });

const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vendor_id: { type: DataTypes.INTEGER, allowNull: false },
  contract_id: { type: DataTypes.INTEGER, allowNull: false },
  invoice_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  invoice_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  invoice_date: { type: DataTypes.DATEONLY, allowNull: false },
  due_date: { type: DataTypes.DATEONLY, allowNull: false },
  payment_status: {
    type: DataTypes.ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID'),
    allowNull: false,
    defaultValue: 'UNPAID',
  },
  approval_status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
}, { tableName: 'invoices' });

const InvoiceComment = sequelize.define('InvoiceComment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  invoice_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'invoice_comments' });

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  invoice_id: { type: DataTypes.INTEGER, allowNull: false },
  payment_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  payment_date: { type: DataTypes.DATEONLY, allowNull: false },
  payment_mode: { type: DataTypes.STRING(50), allowNull: false },
  transaction_reference: { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'payments' });

User.hasOne(Vendor, { foreignKey: 'user_id', as: 'vendorProfile' });
Vendor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Vendor.hasMany(Contract, { foreignKey: 'vendor_id', as: 'contracts' });
Contract.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

Vendor.hasMany(Invoice, { foreignKey: 'vendor_id', as: 'invoices' });
Invoice.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

Contract.hasMany(Invoice, { foreignKey: 'contract_id', as: 'invoices' });
Invoice.belongsTo(Contract, { foreignKey: 'contract_id', as: 'contract' });

Invoice.hasMany(Payment, { foreignKey: 'invoice_id', as: 'payments' });
Payment.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });

Invoice.hasMany(InvoiceComment, { foreignKey: 'invoice_id', as: 'comments' });
InvoiceComment.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });

User.hasMany(InvoiceComment, { foreignKey: 'user_id', as: 'comments' });
InvoiceComment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Vendor,
  Contract,
  Invoice,
  InvoiceComment,
  Payment,
};
