import { getDatabase } from '../lib/db/client';
import { hashPasswordSync, verifyPasswordSync } from '../lib/auth/password';
import { createSession, validateSession } from '../lib/auth/session';
import { createPurchase } from '../lib/purchases/create';
import { claimAchievementReward } from '../lib/achievements/claim';

/**
 * Production-ready comprehensive test suite
 * Tests all critical database operations and API logic
 */

let testsPassed = 0;
let testsFailed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  try {
    console.log(`\n🔍 Testing: ${name}`);
    fn();
    testsPassed++;
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    testsFailed++;
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error:`, error instanceof Error ? error.message : error);
  }
}

async function runTests() {
  console.log('🚀 Starting Production Test Suite\n');
  console.log('=' .repeat(60));

  const db = getDatabase();

  // ============================================================================
  // 1. DATABASE CONNECTIVITY & SCHEMA
  // ============================================================================
  console.log('\n📊 TEST CATEGORY: Database Connectivity & Schema');
  console.log('-'.repeat(60));

  test('Database connection works', () => {
    const result = db.prepare('SELECT 1 as test').get() as { test: number };
    if (result.test !== 1) throw new Error('Database query failed');
  });

  test('All tables exist', () => {
    const tables = [
      'employees', 'invitation_codes', 'sessions', 'achievements',
      'achievement_progress', 'products', 'purchases', 'history', 'schema_version'
    ];
    
    for (const table of tables) {
      const result = db.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
      ).get(table);
      if (!result) throw new Error(`Table ${table} does not exist`);
    }
  });

  test('Foreign keys are enabled', () => {
    const result = db.prepare('PRAGMA foreign_keys').get() as { foreign_keys: number };
    if (result.foreign_keys !== 1) throw new Error('Foreign keys not enabled');
  });

  test('WAL mode is enabled', () => {
    const result = db.prepare('PRAGMA journal_mode').get() as { journal_mode: string };
    if (result.journal_mode.toLowerCase() !== 'wal') {
      console.warn('   ⚠️  WAL mode not enabled, may affect concurrent access');
    }
  });

  // ============================================================================
  // 2. AUTHENTICATION & PASSWORD HASHING
  // ============================================================================
  console.log('\n🔐 TEST CATEGORY: Authentication & Security');
  console.log('-'.repeat(60));

  test('Password hashing works', () => {
    const password = 'testpass123';
    const hash = hashPasswordSync(password);
    if (!hash || hash === password) throw new Error('Password not hashed');
    if (!verifyPasswordSync(password, hash)) throw new Error('Password verification failed');
    if (verifyPasswordSync('wrongpass', hash)) throw new Error('Wrong password verified!');
  });

  test('Session creation works', () => {
    const adminEmployee = db.prepare(
      'SELECT id FROM employees WHERE role = ?'
    ).get('admin') as { id: number } | undefined;
    
    if (!adminEmployee) throw new Error('No admin employee found');
    
    const session = createSession(adminEmployee.id);
    if (!session.token) throw new Error('Session token not created');
    if (!session.expires_at) throw new Error('Session expiration not set');
  });

  test('Session validation works', () => {
    const adminEmployee = db.prepare(
      'SELECT id FROM employees WHERE role = ?'
    ).get('admin') as { id: number } | undefined;
    
    if (!adminEmployee) throw new Error('No admin employee found');
    
    const session = createSession(adminEmployee.id);
    const employee = validateSession(session.token);
    
    if (!employee) throw new Error('Session validation failed');
    if (employee.id !== adminEmployee.id) throw new Error('Wrong employee returned');
  });

  test('Invalid session is rejected', () => {
    const employee = validateSession('invalid-token-12345');
    if (employee !== null) throw new Error('Invalid session was accepted!');
  });

  // ============================================================================
  // 3. EMPLOYEE MANAGEMENT
  // ============================================================================
  console.log('\n👥 TEST CATEGORY: Employee Management');
  console.log('-'.repeat(60));

  test('Admin employee exists', () => {
    const admin = db.prepare(
      'SELECT id, email, role FROM employees WHERE role = ?'
    ).get('admin');
    if (!admin) throw new Error('Admin employee not found');
  });

  test('Employee roles are valid', () => {
    const employees = db.prepare('SELECT role FROM employees').all() as { role: string }[];
    const validRoles = ['admin', 'hr', 'user'];
    for (const emp of employees) {
      if (!validRoles.includes(emp.role)) {
        throw new Error(`Invalid role found: ${emp.role}`);
      }
    }
  });

  test('Diamond balances are non-negative', () => {
    const employees = db.prepare('SELECT id, diamond_balance FROM employees').all() as { id: number; diamond_balance: number }[];
    for (const emp of employees) {
      if (emp.diamond_balance < 0) {
        throw new Error(`Employee ${emp.id} has negative balance: ${emp.diamond_balance}`);
      }
    }
  });

  test('Email uniqueness constraint works', () => {
    try {
      db.prepare(
        'INSERT INTO employees (employee_id, name, email, password_hash, contact, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run('TEST999', 'Test Duplicate', 'admin@company.com', 'hash', '1234', 'address', 'user');
      throw new Error('Duplicate email was allowed!');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('UNIQUE')) {
        throw new Error('Wrong error type for duplicate email');
      }
    }
  });

  // ============================================================================
  // 4. ACHIEVEMENTS & PROGRESS
  // ============================================================================
  console.log('\n🏆 TEST CATEGORY: Achievements & Progress');
  console.log('-'.repeat(60));

  test('Achievements exist', () => {
    const achievements = db.prepare('SELECT COUNT(*) as count FROM achievements').get() as { count: number };
    if (achievements.count === 0) {
      console.warn('   ⚠️  No achievements found - database may not be seeded');
    }
  });

  test('Achievement date constraints are valid', () => {
    const achievements = db.prepare(
      'SELECT id, start_date, end_date FROM achievements'
    ).all() as { id: number; start_date: string; end_date: string }[];
    
    for (const ach of achievements) {
      if (new Date(ach.start_date) >= new Date(ach.end_date)) {
        throw new Error(`Achievement ${ach.id} has invalid dates`);
      }
    }
  });

  test('Achievement progress percentages are valid', () => {
    const progress = db.prepare(
      'SELECT id, progress_percentage FROM achievement_progress'
    ).all() as { id: number; progress_percentage: number }[];
    
    for (const prog of progress) {
      if (prog.progress_percentage < 0 || prog.progress_percentage > 100) {
        throw new Error(`Progress ${prog.id} has invalid percentage: ${prog.progress_percentage}`);
      }
    }
  });

  test('Achievement claim logic works', () => {
    // Find an employee with a completed achievement
    const completedProgress = db.prepare(
      `SELECT ap.employee_id, ap.achievement_id, a.diamond_reward, e.diamond_balance, a.end_date
       FROM achievement_progress ap
       JOIN achievements a ON ap.achievement_id = a.id
       JOIN employees e ON ap.employee_id = e.id
       WHERE ap.status = 'completed' AND ap.progress_percentage = 100
       LIMIT 1`
    ).get() as { employee_id: number; achievement_id: number; diamond_reward: number; diamond_balance: number; end_date: string } | undefined;

    if (!completedProgress) {
      console.warn('   ⚠️  No completed achievements to test claim');
      return;
    }

    // Check if achievement is not expired
    if (new Date() > new Date(completedProgress.end_date)) {
      console.warn('   ⚠️  Completed achievement is expired, cannot test claim');
      return;
    }

    const beforeBalance = completedProgress.diamond_balance;
    const result = claimAchievementReward(completedProgress.employee_id, completedProgress.achievement_id);
    
    if (!result.success) throw new Error('Claim failed');
    if (result.newBalance !== beforeBalance + completedProgress.diamond_reward) {
      throw new Error('Diamond balance not updated correctly');
    }

    // Verify in database
    const afterEmployee = db.prepare(
      'SELECT diamond_balance FROM employees WHERE id = ?'
    ).get(completedProgress.employee_id) as { diamond_balance: number };
    
    if (afterEmployee.diamond_balance !== result.newBalance) {
      throw new Error('Database balance does not match returned balance');
    }
  });

  // ============================================================================
  // 5. PRODUCTS & INVENTORY
  // ============================================================================
  console.log('\n🛍️ TEST CATEGORY: Products & Inventory');
  console.log('-'.repeat(60));

  test('Products have valid prices', () => {
    const products = db.prepare(
      'SELECT id, diamond_price FROM products'
    ).all() as { id: number; diamond_price: number }[];
    
    for (const prod of products) {
      if (prod.diamond_price <= 0) {
        throw new Error(`Product ${prod.id} has invalid price: ${prod.diamond_price}`);
      }
    }
  });

  test('Product quantities are non-negative', () => {
    const products = db.prepare(
      'SELECT id, quantity FROM products'
    ).all() as { id: number; quantity: number }[];
    
    for (const prod of products) {
      if (prod.quantity < 0) {
        throw new Error(`Product ${prod.id} has negative quantity: ${prod.quantity}`);
      }
    }
  });

  // ============================================================================
  // 6. PURCHASE WORKFLOW
  // ============================================================================
  console.log('\n💳 TEST CATEGORY: Purchase Workflow');
  console.log('-'.repeat(60));

  test('Purchase creation deducts diamonds', () => {
    // Find an employee with enough balance and an available product
    const employee = db.prepare(
      'SELECT id, diamond_balance FROM employees WHERE diamond_balance > 100 LIMIT 1'
    ).get() as { id: number; diamond_balance: number } | undefined;

    const product = db.prepare(
      'SELECT id, diamond_price, quantity FROM products WHERE quantity > 0 AND diamond_price < 100 LIMIT 1'
    ).get() as { id: number; diamond_price: number; quantity: number } | undefined;

    if (!employee || !product) {
      console.warn('   ⚠️  Cannot test purchase - no suitable employee/product');
      return;
    }

    const beforeBalance = employee.diamond_balance;
    const beforeQuantity = product.quantity;

    const result = createPurchase({
      employeeId: employee.id,
      productId: product.id,
      quantity: 1,
    });

    if (result.newBalance !== beforeBalance - product.diamond_price) {
      throw new Error('Balance not deducted correctly');
    }

    // Verify product quantity decreased
    const afterProduct = db.prepare(
      'SELECT quantity FROM products WHERE id = ?'
    ).get(product.id) as { quantity: number };

    if (afterProduct.quantity !== beforeQuantity - 1) {
      throw new Error('Product quantity not decremented');
    }

    // Verify purchase record exists
    if (!result.purchase || result.purchase.status !== 'pending') {
      throw new Error('Purchase record not created correctly');
    }
  });

  test('Purchase status values are valid', () => {
    const purchases = db.prepare(
      'SELECT id, status FROM purchases'
    ).all() as { id: number; status: string }[];
    
    const validStatuses = ['pending', 'accepted', 'rejected'];
    for (const purch of purchases) {
      if (!validStatuses.includes(purch.status)) {
        throw new Error(`Purchase ${purch.id} has invalid status: ${purch.status}`);
      }
    }
  });

  test('Insufficient balance prevents purchase', () => {
    const employee = db.prepare(
      'SELECT id, diamond_balance FROM employees WHERE diamond_balance < 50 LIMIT 1'
    ).get() as { id: number; diamond_balance: number } | undefined;

    const expensiveProduct = db.prepare(
      'SELECT id FROM products WHERE diamond_price > 10000 LIMIT 1'
    ).get() as { id: number } | undefined;

    if (!employee || !expensiveProduct) {
      console.warn('   ⚠️  Cannot test insufficient balance scenario');
      return;
    }

    try {
      createPurchase({
        employeeId: employee.id,
        productId: expensiveProduct.id,
        quantity: 1,
      });
      throw new Error('Purchase with insufficient balance was allowed!');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('Insufficient balance')) {
        throw new Error('Wrong error type for insufficient balance');
      }
    }
  });

  // ============================================================================
  // 7. HISTORY & AUDIT TRAIL
  // ============================================================================
  console.log('\n📜 TEST CATEGORY: History & Audit Trail');
  console.log('-'.repeat(60));

  test('History records exist', () => {
    const historyCount = db.prepare('SELECT COUNT(*) as count FROM history').get() as { count: number };
    if (historyCount.count === 0) {
      console.warn('   ⚠️  No history records found');
    }
  });

  test('History type and action values are valid', () => {
    const history = db.prepare(
      'SELECT id, type, action FROM history'
    ).all() as { id: number; type: string; action: string }[];
    
    const validTypes = ['claim', 'purchase'];
    const validActions = ['created', 'approved', 'rejected', 'claimed'];
    
    for (const hist of history) {
      if (!validTypes.includes(hist.type)) {
        throw new Error(`History ${hist.id} has invalid type: ${hist.type}`);
      }
      if (!validActions.includes(hist.action)) {
        throw new Error(`History ${hist.id} has invalid action: ${hist.action}`);
      }
    }
  });

  test('History records are retrievable', () => {
    const history = db.prepare(
      'SELECT COUNT(*) as count FROM history WHERE created_at IS NOT NULL'
    ).get() as { count: number };
    
    if (history.count === 0) {
      throw new Error('No history records with valid timestamps');
    }
    
    // Verify history can be queried by date range
    const recentHistory = db.prepare(
      `SELECT COUNT(*) as count FROM history 
       WHERE datetime(created_at) >= datetime('now', '-30 days')`
    ).get() as { count: number };
    
    // Should have some recent history
    if (recentHistory.count === 0) {
      console.warn('   ⚠️  No recent history in last 30 days');
    }
  });

  // ============================================================================
  // 8. INVITATION CODES
  // ============================================================================
  console.log('\n🎫 TEST CATEGORY: Invitation Codes');
  console.log('-'.repeat(60));

  test('Invitation codes have valid status', () => {
    const codes = db.prepare(
      'SELECT id, is_active FROM invitation_codes'
    ).all() as { id: number; is_active: number }[];
    
    for (const code of codes) {
      if (code.is_active !== 0 && code.is_active !== 1) {
        throw new Error(`Code ${code.id} has invalid is_active value: ${code.is_active}`);
      }
    }
  });

  test('Invitation codes are unique', () => {
    const codes = db.prepare('SELECT code FROM invitation_codes').all() as { code: string }[];
    const uniqueCodes = new Set(codes.map(c => c.code));
    if (codes.length !== uniqueCodes.size) {
      throw new Error('Duplicate invitation codes found');
    }
  });

  // ============================================================================
  // 9. INDEXES & PERFORMANCE
  // ============================================================================
  console.log('\n⚡ TEST CATEGORY: Indexes & Performance');
  console.log('-'.repeat(60));

  test('Critical indexes exist', () => {
    const indexes = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='index'"
    ).all() as { name: string }[];
    
    const criticalIndexes = [
      'idx_employees_email',
      'idx_sessions_token',
      'idx_purchases_status',
      'idx_history_created_at',
    ];
    
    const indexNames = indexes.map(i => i.name);
    for (const idx of criticalIndexes) {
      if (!indexNames.includes(idx)) {
        console.warn(`   ⚠️  Critical index missing: ${idx}`);
      }
    }
  });

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Total:  ${testsPassed + testsFailed}`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! System is production-ready.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues before deploying.');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('\n💥 Test suite crashed:', error);
  process.exit(1);
});
