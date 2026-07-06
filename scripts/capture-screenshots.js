const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:5173';
const OUT = path.join(__dirname, '..', 'screenshots');

const mockVendors = [
  { id: 1, vendor_name: 'Acme Supplies Ltd', contact_person: 'John Supplier', email: 'vendor1@supplier.com', phone: '+1-555-0101', status: 'ACTIVE' },
  { id: 2, vendor_name: 'Global Tech Solutions', contact_person: 'Jane Vendor', email: 'vendor2@supplier.com', phone: '+1-555-0202', status: 'ACTIVE' },
];

const mockContracts = [
  { id: 1, contract_title: 'Office Supplies Annual Contract', vendor_id: 1, vendor: { vendor_name: 'Acme Supplies Ltd' }, start_date: '2025-01-01', end_date: '2025-12-31', contract_value: 150000, status: 'ACTIVE' },
  { id: 2, contract_title: 'IT Infrastructure Support', vendor_id: 2, vendor: { vendor_name: 'Global Tech Solutions' }, start_date: '2025-03-01', end_date: '2026-02-28', contract_value: 250000, status: 'ACTIVE' },
];

const mockInvoices = [
  { id: 1, invoice_number: 'INV-20250701-0001', vendor_id: 1, vendor: { vendor_name: 'Acme Supplies Ltd' }, contract: { contract_title: 'Office Supplies Annual Contract' }, invoice_amount: 12500, invoice_date: '2025-07-01', due_date: '2025-07-31', approval_status: 'PENDING', payment_status: 'UNPAID' },
  { id: 2, invoice_number: 'INV-20250702-0002', vendor_id: 2, vendor: { vendor_name: 'Global Tech Solutions' }, contract: { contract_title: 'IT Infrastructure Support' }, invoice_amount: 22000, invoice_date: '2025-07-10', due_date: '2025-08-10', approval_status: 'APPROVED', payment_status: 'PARTIALLY_PAID' },
];

const mockPayments = [
  { id: 1, payment_amount: 12500, payment_date: '2025-07-20', payment_mode: 'Bank Transfer', transaction_reference: 'TXN-001', invoice: { invoice_number: 'INV-20250701-0001', invoice_amount: 12500 } },
];

const paginated = (data) => ({ success: true, data, pagination: { page: 1, limit: 10, total: data.length, totalPages: 1 } });

const shots = [
  { file: '01-login.png', path: '/login' },
  {
    file: '02-invoice-upload.png',
    path: '/vendor/upload',
    user: { id: 3, name: 'John Supplier', email: 'vendor1@supplier.com', role: 'VENDOR' },
    routes: { '**/api/profile': { user: { id: 3, name: 'John Supplier', email: 'vendor1@supplier.com', role: 'VENDOR' } }, '**/api/contracts*': paginated(mockContracts) },
  },
  {
    file: '03-invoice-approval.png',
    path: '/finance/approvals',
    user: { id: 2, name: 'Finance Manager', email: 'finance@company.com', role: 'FINANCE_MANAGER' },
    routes: { '**/api/profile': { user: { id: 2, name: 'Finance Manager', email: 'finance@company.com', role: 'FINANCE_MANAGER' } }, '**/api/invoices*': paginated(mockInvoices.filter((i) => i.approval_status === 'PENDING')) },
  },
  {
    file: '04-payment-dashboard.png',
    path: '/finance/payments',
    user: { id: 2, name: 'Finance Manager', email: 'finance@company.com', role: 'FINANCE_MANAGER' },
    routes: {
      '**/api/profile': { user: { id: 2, name: 'Finance Manager', email: 'finance@company.com', role: 'FINANCE_MANAGER' } },
      '**/api/invoices*': paginated(mockInvoices.filter((i) => i.approval_status === 'APPROVED')),
      '**/api/payments*': paginated(mockPayments),
    },
  },
  {
    file: '05-analytics-dashboard.png',
    path: '/admin',
    user: { id: 1, name: 'System Admin', email: 'admin@company.com', role: 'ADMIN' },
    routes: {
      '**/api/profile': { user: { id: 1, name: 'System Admin', email: 'admin@company.com', role: 'ADMIN' } },
      '**/api/dashboard/admin': {
        data: {
          summary: { totalVendors: 2, totalContracts: 3, totalInvoices: 4, totalPayments: 22500 },
          pendingVsApproved: { pending: 1, approved: 2, rejected: 1 },
          monthlyInvoiceVolume: [{ month: '2025-06', count: 1, total_amount: 5000 }, { month: '2025-07', count: 3, total_amount: 43000 }],
          vendorPaymentDistribution: [{ vendor_name: 'Acme Supplies Ltd', total_paid: 12500 }, { vendor_name: 'Global Tech Solutions', total_paid: 10000 }],
          paymentTrends: [{ month: '2025-07', total: 22500, count: 2 }],
          topVendorsByContractValue: [{ vendor_name: 'Global Tech Solutions', total_value: 250000 }, { vendor_name: 'Acme Supplies Ltd', total_value: 225000 }],
        },
      },
    },
  },
  {
    file: '06-vendor-management.png',
    path: '/admin/vendors',
    user: { id: 1, name: 'System Admin', email: 'admin@company.com', role: 'ADMIN' },
    routes: { '**/api/profile': { user: { id: 1, name: 'System Admin', email: 'admin@company.com', role: 'ADMIN' } }, '**/api/vendors*': paginated(mockVendors) },
  },
];

async function setupMocks(page, routes) {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    for (const [pattern, body] of Object.entries(routes)) {
      const key = pattern.replace('**', '');
      if (url.includes(key.replace(/\*/g, ''))) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, ...body }) });
      }
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });
}

async function capture() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  for (const shot of shots) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    if (shot.user) {
      await setupMocks(page, shot.routes);
      await page.goto(BASE);
      await page.evaluate((user) => {
        localStorage.setItem('token', 'screenshot-mock-token');
        localStorage.setItem('user', JSON.stringify(user));
      }, shot.user);
    }

    await page.goto(`${BASE}${shot.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT, shot.file) });
    console.log(`Captured ${shot.file}`);
    await page.close();
  }

  await browser.close();
  console.log('Done');
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
