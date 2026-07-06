require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Vendor, Contract, Invoice, Payment, InvoiceComment } = require('../models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    await sequelize.sync({ alter: false });
    console.log('Database tables verified');

    const password = await bcrypt.hash('password123', 10);

    const [admin] = await User.findOrCreate({
      where: { email: 'admin@company.com' },
      defaults: {
        name: 'System Admin',
        email: 'admin@company.com',
        password,
        role: 'ADMIN',
      },
    });

    const [finance] = await User.findOrCreate({
      where: { email: 'finance@company.com' },
      defaults: {
        name: 'Finance Manager',
        email: 'finance@company.com',
        password,
        role: 'FINANCE_MANAGER',
      },
    });

    const [vendorUser1] = await User.findOrCreate({
      where: { email: 'vendor1@supplier.com' },
      defaults: {
        name: 'John Supplier',
        email: 'vendor1@supplier.com',
        password,
        role: 'VENDOR',
      },
    });

    const [vendorUser2] = await User.findOrCreate({
      where: { email: 'vendor2@supplier.com' },
      defaults: {
        name: 'Jane Vendor',
        email: 'vendor2@supplier.com',
        password,
        role: 'VENDOR',
      },
    });

    const [vendor1] = await Vendor.findOrCreate({
      where: { email: 'vendor1@supplier.com' },
      defaults: {
        user_id: vendorUser1.id,
        vendor_name: 'Acme Supplies Ltd',
        contact_person: 'John Supplier',
        phone: '+1-555-0101',
        email: 'vendor1@supplier.com',
        address: '123 Industrial Ave, New York, NY',
        status: 'ACTIVE',
      },
    });

    const [vendor2] = await Vendor.findOrCreate({
      where: { email: 'vendor2@supplier.com' },
      defaults: {
        user_id: vendorUser2.id,
        vendor_name: 'Global Tech Solutions',
        contact_person: 'Jane Vendor',
        phone: '+1-555-0202',
        email: 'vendor2@supplier.com',
        address: '456 Tech Park, San Francisco, CA',
        status: 'ACTIVE',
      },
    });

    const [contract1] = await Contract.findOrCreate({
      where: { contract_title: 'Office Supplies Annual Contract', vendor_id: vendor1.id },
      defaults: {
        vendor_id: vendor1.id,
        contract_title: 'Office Supplies Annual Contract',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        contract_value: 150000.00,
        status: 'ACTIVE',
      },
    });

    const [contract2] = await Contract.findOrCreate({
      where: { contract_title: 'IT Infrastructure Support', vendor_id: vendor2.id },
      defaults: {
        vendor_id: vendor2.id,
        contract_title: 'IT Infrastructure Support',
        start_date: '2025-03-01',
        end_date: '2026-02-28',
        contract_value: 250000.00,
        status: 'ACTIVE',
      },
    });

    const [contract3] = await Contract.findOrCreate({
      where: { contract_title: 'Equipment Maintenance', vendor_id: vendor1.id },
      defaults: {
        vendor_id: vendor1.id,
        contract_title: 'Equipment Maintenance',
        start_date: '2025-06-01',
        end_date: '2026-05-31',
        contract_value: 75000.00,
        status: 'ACTIVE',
      },
    });

    const [invoice1] = await Invoice.findOrCreate({
      where: { invoice_number: 'INV-20250701-0001' },
      defaults: {
        vendor_id: vendor1.id,
        contract_id: contract1.id,
        invoice_number: 'INV-20250701-0001',
        invoice_amount: 12500.00,
        invoice_date: '2025-07-01',
        due_date: '2025-07-31',
        approval_status: 'APPROVED',
        payment_status: 'PAID',
      },
    });

    const [invoice2] = await Invoice.findOrCreate({
      where: { invoice_number: 'INV-20250702-0002' },
      defaults: {
        vendor_id: vendor1.id,
        contract_id: contract1.id,
        invoice_number: 'INV-20250702-0002',
        invoice_amount: 8500.00,
        invoice_date: '2025-07-15',
        due_date: '2025-08-15',
        approval_status: 'PENDING',
        payment_status: 'UNPAID',
      },
    });

    const [invoice3] = await Invoice.findOrCreate({
      where: { invoice_number: 'INV-20250703-0003' },
      defaults: {
        vendor_id: vendor2.id,
        contract_id: contract2.id,
        invoice_number: 'INV-20250703-0003',
        invoice_amount: 22000.00,
        invoice_date: '2025-07-10',
        due_date: '2025-08-10',
        approval_status: 'APPROVED',
        payment_status: 'PARTIALLY_PAID',
      },
    });

    const [invoice4] = await Invoice.findOrCreate({
      where: { invoice_number: 'INV-20250601-0004' },
      defaults: {
        vendor_id: vendor2.id,
        contract_id: contract2.id,
        invoice_number: 'INV-20250601-0004',
        invoice_amount: 5000.00,
        invoice_date: '2025-06-01',
        due_date: '2025-06-30',
        approval_status: 'REJECTED',
        payment_status: 'UNPAID',
      },
    });

    await Payment.findOrCreate({
      where: { transaction_reference: 'TXN-001' },
      defaults: {
        invoice_id: invoice1.id,
        payment_amount: 12500.00,
        payment_date: '2025-07-20',
        payment_mode: 'Bank Transfer',
        transaction_reference: 'TXN-001',
      },
    });

    await Payment.findOrCreate({
      where: { transaction_reference: 'TXN-002' },
      defaults: {
        invoice_id: invoice3.id,
        payment_amount: 10000.00,
        payment_date: '2025-07-25',
        payment_mode: 'Wire Transfer',
        transaction_reference: 'TXN-002',
      },
    });

    await InvoiceComment.findOrCreate({
      where: { invoice_id: invoice4.id, user_id: finance.id },
      defaults: {
        invoice_id: invoice4.id,
        user_id: finance.id,
        comment: 'Invoice amount does not match contract terms',
      },
    });

    console.log('Seed data created successfully');
    console.log('\nTest Credentials (password: password123):');
    console.log('  Admin:    admin@company.com');
    console.log('  Finance:  finance@company.com');
    console.log('  Vendor 1: vendor1@supplier.com');
    console.log('  Vendor 2: vendor2@supplier.com');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
