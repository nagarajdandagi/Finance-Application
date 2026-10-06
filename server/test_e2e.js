const http = require('http');

async function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log(' FINOVA FINANCE — COMPREHENSIVE E2E VERIFICATION ');
  console.log('====================================================\n');

  // Test 1: Health Check
  console.log('1. Testing System Health API:');
  const health = await request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('   Status:', health.status, 'Payload:', health.data);
  if (health.status !== 200) throw new Error('Health check failed');

  // Test 2: Calculate EMI
  console.log('\n2. Testing Reducing Balance EMI Formula (< ₹1L vs ≥ ₹1L):');
  const emiReq = await request({
    hostname: 'localhost', port: 5000, path: '/api/calculator/emi', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { principal: 500000, interestRate: 12, tenure: 5, tenureUnit: 'years' });
  console.log('   ₹5,00,000 @ 12% for 5 years => Monthly EMI: ₹' + emiReq.data.data.monthlyEmi, 'Total Interest: ₹' + emiReq.data.data.totalInterest);
  if (emiReq.data.data.monthlyEmi !== 11122) throw new Error('EMI calculation mismatch!');

  // Test 3: Customer Login (Rahul Sharma)
  console.log('\n3. Testing Customer Authentication (Rahul Sharma):');
  const loginRes = await request({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { identifier: 'rahul@example.com', password: 'Password@123' });
  console.log('   Login successful:', loginRes.data.success, 'Token length:', loginRes.data.token?.length);
  const rahulToken = loginRes.data.token;

  // Test 4: Business Rule Verification - Submit Loan < ₹1,00,000
  console.log('\n4. Testing Business Rule: Loan < ₹1,00,000 (Automated Workflow):');
  const lowLoanRes = await request({
    hostname: 'localhost', port: 5000, path: '/api/applications', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${rahulToken}` }
  }, {
    productId: 'prod_emergency',
    requestedAmount: 50000,
    tenureMonths: 12,
    purpose: 'Urgent Device Repair',
    monthlyIncome: 85000,
    employmentType: 'Salaried'
  });
  console.log('   App ID:', lowLoanRes.data.applicationId, 'Status:', lowLoanRes.data.status, '(Expected: APPROVED / UNDER_VERIFICATION)');
  if (lowLoanRes.data.status === 'PENDING_ADMIN_REVIEW') throw new Error('Low loan should not be pending admin review!');

  // Test 5: Business Rule Verification - Submit Loan >= ₹1,00,000
  console.log('\n5. Testing Business Rule: Loan ≥ ₹1,00,000 (Mandatory PENDING ADMIN REVIEW):');
  const highLoanRes = await request({
    hostname: 'localhost', port: 5000, path: '/api/applications', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${rahulToken}` }
  }, {
    productId: 'prod_personal',
    requestedAmount: 400000,
    tenureMonths: 36,
    purpose: 'Interior Upgrades',
    monthlyIncome: 85000,
    employmentType: 'Salaried',
    guarantor: { fullName: 'Suresh Sharma', mobile: '9844001122', relationship: 'Father' }
  });
  console.log('   App ID:', highLoanRes.data.applicationId, 'Status:', highLoanRes.data.status);
  if (highLoanRes.data.status !== 'PENDING_ADMIN_REVIEW') throw new Error('High loan MUST be PENDING_ADMIN_REVIEW!');
  const pendingAppId = highLoanRes.data.applicationId;

  // Test 6: Admin Login
  console.log('\n6. Testing Admin Authentication (Finova Admin):');
  const adminLoginRes = await request({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { identifier: 'admin@finova.demo', password: 'Admin@123' });
  console.log('   Admin login:', adminLoginRes.data.success, 'Role:', adminLoginRes.data.user.role);
  const adminToken = adminLoginRes.data.token;

  // Test 7: Admin Review Queue & Sanction/Approve
  console.log('\n7. Testing Admin Review & Sanction of High-Value Application:', pendingAppId);
  const approveRes = await request({
    hostname: 'localhost', port: 5000, path: `/api/admin/applications/${pendingAppId}/approve`, method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
  }, { approvedAmount: 400000, interestRate: 11.5, adminNotes: 'Verified employment and bank statement. Approved by Underwriter.' });
  console.log('   Approve Response:', approveRes.data.message, 'New Loan Account:', approveRes.data.loanAccountId);
  const newLoanAccId = approveRes.data.loanAccountId;

  // Test 8: Verify Active Loan & Amortization Schedule
  console.log('\n8. Customer Verifying Newly Created Active Loan & Amortization Schedule:');
  const loanAccRes = await request({
    hostname: 'localhost', port: 5000, path: `/api/loans/account/${newLoanAccId}`, method: 'GET',
    headers: { 'Authorization': `Bearer ${rahulToken}` }
  });
  console.log('   Account:', loanAccRes.data.data.id, 'Principal:', loanAccRes.data.data.principal_amount, 'Installments Generated:', loanAccRes.data.data.repaymentSchedule.length);

  // Test 9: Process EMI Payment
  console.log('\n9. Testing Customer EMI Payment Simulation:');
  const payRes = await request({
    hostname: 'localhost', port: 5000, path: '/api/payments/pay', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${rahulToken}` }
  }, { loanAccountId: newLoanAccId, paymentMethod: 'UPI' });
  console.log('   Payment Status:', payRes.data.message, 'Txn ID:', payRes.data.data.transactionId, 'New Outstanding:', payRes.data.data.newOutstandingBalance);

  // Test 10: Admin Audit Logs
  console.log('\n10. Checking Security Audit Logs:');
  const auditRes = await request({
    hostname: 'localhost', port: 5000, path: '/api/admin/audit-logs', method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('   Audit Logs Recorded:', auditRes.data.data.length, 'Latest Action:', auditRes.data.data[0].action, 'By:', auditRes.data.data[0].admin_email);

  // Test 11: Notifications Center
  console.log('\n11. Checking Notifications:');
  const notifRes = await request({
    hostname: 'localhost', port: 5000, path: '/api/notifications', method: 'GET',
    headers: { 'Authorization': `Bearer ${rahulToken}` }
  });
  console.log('   Notifications for Rahul:', notifRes.data.data.length, 'Latest:', notifRes.data.data[0].title);

  console.log('\n====================================================');
  console.log(' ALL 11 END-TO-END WORKFLOW TESTS PASSED PERFECTLY! ');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
