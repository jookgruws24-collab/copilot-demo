import { getDatabase } from './client';
import { hashPasswordSync } from '../auth/password';
import { now, addDays } from '../utils/dates';

/**
 * Comprehensive seed script with all status types and edge cases
 * Covers: achievements (upcoming/ongoing/expired), purchases (pending/approved/rejected), 
 * progress (0-100%), claims, history, various roles
 */
export function seedDatabase() {
  const db = getDatabase();

  console.log('🌱 Seeding database with comprehensive test data...');

  try {
    // Clear existing data (in reverse order of foreign keys)
    console.log('  Clearing existing data...');
    db.prepare('DELETE FROM history').run();
    db.prepare('DELETE FROM purchases').run();
    db.prepare('DELETE FROM achievement_progress').run();
    db.prepare('DELETE FROM products').run();
    db.prepare('DELETE FROM achievements').run();
    db.prepare('DELETE FROM sessions').run();
    db.prepare('DELETE FROM invitation_codes').run();
    db.prepare('DELETE FROM employees').run();

    // ============================================================================
    // EMPLOYEES - Various roles and balances
    // ============================================================================
    console.log('  Creating employees...');
    const employees = [
      // Admin - High balance for testing
      {
        employee_id: 'EMP001',
        name: 'Admin User',
        email: 'admin@company.com',
        password: 'admin123',
        contact: '+1-555-0101',
        address: '123 Admin Street, City, State 12345',
        role: 'admin',
        diamond_balance: 2000,
        invitation_code_used: null,
      },
      // HR - Medium balance
      {
        employee_id: 'EMP002',
        name: 'HR Manager',
        email: 'hr@company.com',
        password: 'hr123456',
        contact: '+1-555-0102',
        address: '456 HR Avenue, City, State 12345',
        role: 'hr',
        diamond_balance: 800,
        invitation_code_used: null,
      },
      // User with high balance (can purchase expensive items)
      {
        employee_id: 'EMP003',
        name: 'Alice Johnson',
        email: 'alice@company.com',
        password: 'user1234',
        contact: '+1-555-0103',
        address: '789 User Lane, City, State 12345',
        role: 'user',
        diamond_balance: 1500,
        invitation_code_used: 'WELCOME2025',
      },
      // User with medium balance
      {
        employee_id: 'EMP004',
        name: 'Bob Smith',
        email: 'bob@company.com',
        password: 'user1234',
        contact: '+1-555-0104',
        address: '321 Employee Road, City, State 12345',
        role: 'user',
        diamond_balance: 500,
        invitation_code_used: 'SALES2025',
      },
      // User with low balance (can't afford much)
      {
        employee_id: 'EMP005',
        name: 'Carol Davis',
        email: 'carol@company.com',
        password: 'user1234',
        contact: '+1-555-0105',
        address: '654 Worker Boulevard, City, State 12345',
        role: 'user',
        diamond_balance: 150,
        invitation_code_used: 'WELCOME2025',
      },
      // User with zero balance (new employee)
      {
        employee_id: 'EMP006',
        name: 'David Wilson',
        email: 'david@company.com',
        password: 'user1234',
        contact: '+1-555-0106',
        address: '987 New Hire Lane, City, State 12345',
        role: 'user',
        diamond_balance: 0,
        invitation_code_used: null,
      },
      // User with balance and active progress
      {
        employee_id: 'EMP007',
        name: 'Eve Martinez',
        email: 'eve@company.com',
        password: 'user1234',
        contact: '+1-555-0107',
        address: '111 Progress Street, City, State 12345',
        role: 'user',
        diamond_balance: 300,
        invitation_code_used: 'SALES2025',
      },
    ];

    const employeeIds: number[] = [];
    const insertEmployee = db.prepare(`
      INSERT INTO employees (employee_id, name, email, password_hash, contact, address, role, diamond_balance, invitation_code_used)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    employees.forEach((emp) => {
      const result = insertEmployee.run(
        emp.employee_id,
        emp.name,
        emp.email,
        hashPasswordSync(emp.password),
        emp.contact,
        emp.address,
        emp.role,
        emp.diamond_balance,
        emp.invitation_code_used
      );
      employeeIds.push(result.lastInsertRowid as number);
    });

    console.log(`  ✅ Created ${employees.length} employees`);

    // ============================================================================
    // INVITATION CODES - Active and inactive
    // ============================================================================
    console.log('  Creating invitation codes...');
    const invitationCodes = [
      { code: 'WELCOME2025', label: 'General Onboarding 2025', is_active: 1, created_by: employeeIds[0] },
      { code: 'SALES2025', label: 'Q1 Sales Team', is_active: 1, created_by: employeeIds[1] },
      { code: 'ENGR2025', label: 'Engineering Hires', is_active: 1, created_by: employeeIds[1] },
      { code: 'OLDCODE99', label: 'Expired Campaign', is_active: 0, created_by: employeeIds[0] },
      { code: 'TESTCODE', label: null, is_active: 1, created_by: employeeIds[0] },
    ];

    const insertCode = db.prepare(`
      INSERT INTO invitation_codes (code, label, is_active, created_by)
      VALUES (?, ?, ?, ?)
    `);

    invitationCodes.forEach((code) => {
      insertCode.run(code.code, code.label, code.is_active, code.created_by);
    });

    console.log(`  ✅ Created ${invitationCodes.length} invitation codes`);

    // ============================================================================
    // ACHIEVEMENTS - Upcoming, Ongoing, and Expired
    // ============================================================================
    console.log('  Creating achievements...');
    const baseDate = new Date();
    
    const achievements = [
      // ONGOING - Active achievements with various progress states
      {
        title: 'Complete Onboarding',
        description: 'Finish all onboarding tasks and training modules',
        conditions: 'Complete 5 training modules, attend orientation, setup workspace',
        diamond_reward: 100,
        start_date: addDays(baseDate, -7),
        end_date: addDays(baseDate, 30),
      },
      {
        title: 'First Month Excellence',
        description: 'Demonstrate exceptional performance in your first month',
        conditions: 'Meet all deadlines, positive peer feedback, complete first project',
        diamond_reward: 200,
        start_date: addDays(baseDate, -5),
        end_date: addDays(baseDate, 25),
      },
      {
        title: 'Team Collaboration Master',
        description: 'Excel at team collaboration and communication',
        conditions: 'Participate in 10 team meetings, help 3 colleagues, share knowledge',
        diamond_reward: 150,
        start_date: addDays(baseDate, -3),
        end_date: addDays(baseDate, 45),
      },
      
      // UPCOMING - Future achievements
      {
        title: 'Q2 Sales Target',
        description: 'Achieve quarterly sales goals',
        conditions: 'Complete 20 sales calls, close 5 deals, exceed quota by 10%',
        diamond_reward: 300,
        start_date: addDays(baseDate, 7),
        end_date: addDays(baseDate, 90),
      },
      {
        title: 'Innovation Challenge Winner',
        description: 'Win the company innovation challenge',
        conditions: 'Submit innovative idea, present to leadership, get approved',
        diamond_reward: 500,
        start_date: addDays(baseDate, 14),
        end_date: addDays(baseDate, 120),
      },
      
      // EXPIRED - Past achievements (some claimed, some not)
      {
        title: 'Year-End Sprint 2024',
        description: 'Complete all year-end deliverables',
        conditions: 'Close all open tickets, document work, clean up technical debt',
        diamond_reward: 250,
        start_date: addDays(baseDate, -90),
        end_date: addDays(baseDate, -7),
      },
      {
        title: 'Customer Satisfaction Award',
        description: 'Receive outstanding customer feedback',
        conditions: 'Maintain 4.5+ rating, handle 50+ support tickets, zero escalations',
        diamond_reward: 200,
        start_date: addDays(baseDate, -60),
        end_date: addDays(baseDate, -10),
      },
    ];

    const insertAchievement = db.prepare(`
      INSERT INTO achievements (title, description, conditions, diamond_reward, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const achievementIds: number[] = [];
    achievements.forEach((ach) => {
      const result = insertAchievement.run(
        ach.title,
        ach.description,
        ach.conditions,
        ach.diamond_reward,
        ach.start_date,
        ach.end_date
      );
      achievementIds.push(result.lastInsertRowid as number);
    });

    console.log(`  ✅ Created ${achievements.length} achievements`);

    // ============================================================================
    // ACHIEVEMENT PROGRESS - Various states (0%, 25%, 50%, 75%, 100%, claimed)
    // ============================================================================
    console.log('  Creating achievement progress...');
    const progressData = [
      // Alice (EMP003) - Various progress states
      { employee_id: employeeIds[2], achievement_id: achievementIds[0], progress: 100, status: 'completed' }, // Ready to claim
      { employee_id: employeeIds[2], achievement_id: achievementIds[1], progress: 75, status: 'on_doing' },
      { employee_id: employeeIds[2], achievement_id: achievementIds[5], progress: 100, status: 'claimed', claimed_at: addDays(baseDate, -5) }, // Already claimed expired
      
      // Bob (EMP004) - Different progress levels
      { employee_id: employeeIds[3], achievement_id: achievementIds[0], progress: 50, status: 'on_doing' },
      { employee_id: employeeIds[3], achievement_id: achievementIds[2], progress: 25, status: 'on_doing' },
      
      // Carol (EMP005) - Just started
      { employee_id: employeeIds[4], achievement_id: achievementIds[0], progress: 10, status: 'on_doing' },
      { employee_id: employeeIds[4], achievement_id: achievementIds[6], progress: 100, status: 'claimed', claimed_at: addDays(baseDate, -3) }, // Claimed expired
      
      // David (EMP006) - No progress yet (new employee)
      
      // Eve (EMP007) - Active participant
      { employee_id: employeeIds[6], achievement_id: achievementIds[0], progress: 90, status: 'on_doing' },
      { employee_id: employeeIds[6], achievement_id: achievementIds[1], progress: 100, status: 'completed' }, // Ready to claim
      { employee_id: employeeIds[6], achievement_id: achievementIds[2], progress: 60, status: 'on_doing' },
    ];

    const insertProgress = db.prepare(`
      INSERT INTO achievement_progress (employee_id, achievement_id, progress_percentage, status, claimed_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    progressData.forEach((prog) => {
      insertProgress.run(
        prog.employee_id,
        prog.achievement_id,
        prog.progress,
        prog.status,
        prog.claimed_at || null
      );
    });

    console.log(`  ✅ Created ${progressData.length} progress records`);

    // ============================================================================
    // PRODUCTS - Various price ranges and availability
    // ============================================================================
    console.log('  Creating products...');
    const products = [
      // Low-cost items
      { name: 'Coffee Mug', description: 'Company branded ceramic mug', diamond_price: 25, quantity_available: 100 },
      { name: 'Sticker Pack', description: 'Set of 10 company logo stickers', diamond_price: 15, quantity_available: 200 },
      
      // Medium-cost items
      { name: 'T-Shirt', description: 'Premium cotton company t-shirt', diamond_price: 50, quantity_available: 75 },
      { name: 'Water Bottle', description: 'Insulated stainless steel bottle', diamond_price: 75, quantity_available: 50 },
      { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', diamond_price: 100, quantity_available: 30 },
      
      // High-cost items
      { name: 'Noise-Cancelling Headphones', description: 'Premium over-ear headphones', diamond_price: 300, quantity_available: 15 },
      { name: 'Mechanical Keyboard', description: 'RGB mechanical gaming keyboard', diamond_price: 400, quantity_available: 10 },
      { name: 'Standing Desk Converter', description: 'Adjustable height desk converter', diamond_price: 600, quantity_available: 5 },
      
      // Very high-cost items
      { name: 'Ergonomic Office Chair', description: 'Premium ergonomic chair', diamond_price: 1000, quantity_available: 3 },
      { name: 'MacBook Pro', description: '14-inch MacBook Pro', diamond_price: 2000, quantity_available: 2 },
      
      // Limited/out of stock
      { name: 'Limited Edition Hoodie', description: 'Exclusive company anniversary hoodie', diamond_price: 150, quantity_available: 0 },
    ];

    const insertProduct = db.prepare(`
      INSERT INTO products (name, description, diamond_price, quantity_available)
      VALUES (?, ?, ?, ?)
    `);

    const productIds: number[] = [];
    products.forEach((prod) => {
      const result = insertProduct.run(prod.name, prod.description, prod.diamond_price, prod.quantity_available);
      productIds.push(result.lastInsertRowid as number);
    });

    console.log(`  ✅ Created ${products.length} products`);

    // ============================================================================
    // PURCHASES - Pending, Approved, and Rejected
    // ============================================================================
    console.log('  Creating purchases...');
    const purchases = [
      // PENDING purchases (waiting for admin approval)
      {
        employee_id: employeeIds[2], // Alice
        product_id: productIds[4], // Wireless Mouse
        product_name: 'Wireless Mouse',
        quantity: 1,
        diamond_cost: 100,
        status: 'pending',
        created_at: addDays(baseDate, -1),
      },
      {
        employee_id: employeeIds[3], // Bob
        product_id: productIds[2], // T-Shirt
        product_name: 'T-Shirt',
        quantity: 2,
        diamond_cost: 100,
        status: 'pending',
        created_at: addDays(baseDate, -2),
      },
      {
        employee_id: employeeIds[4], // Carol
        product_id: productIds[0], // Coffee Mug
        product_name: 'Coffee Mug',
        quantity: 1,
        diamond_cost: 25,
        status: 'pending',
        created_at: addDays(baseDate, 0),
      },
      
      // APPROVED purchases
      {
        employee_id: employeeIds[2], // Alice
        product_id: productIds[1], // Sticker Pack
        product_name: 'Sticker Pack',
        quantity: 3,
        diamond_cost: 45,
        status: 'approved',
        created_at: addDays(baseDate, -10),
        approved_by: employeeIds[0], // Admin
        approved_at: addDays(baseDate, -9),
      },
      {
        employee_id: employeeIds[3], // Bob
        product_id: productIds[3], // Water Bottle
        product_name: 'Water Bottle',
        quantity: 1,
        diamond_cost: 75,
        status: 'approved',
        created_at: addDays(baseDate, -8),
        approved_by: employeeIds[0], // Admin
        approved_at: addDays(baseDate, -7),
      },
      
      // REJECTED purchases (with reasons and refunds)
      {
        employee_id: employeeIds[6], // Eve
        product_id: productIds[8], // Ergonomic Chair
        product_name: 'Ergonomic Office Chair',
        quantity: 1,
        diamond_cost: 1000,
        status: 'rejected',
        created_at: addDays(baseDate, -5),
        approved_by: employeeIds[0], // Admin
        approved_at: addDays(baseDate, -4),
        rejection_reason: 'Out of budget allocation for this quarter',
      },
      {
        employee_id: employeeIds[4], // Carol
        product_id: productIds[10], // Limited Edition Hoodie
        product_name: 'Limited Edition Hoodie',
        quantity: 1,
        diamond_cost: 150,
        status: 'rejected',
        created_at: addDays(baseDate, -6),
        approved_by: employeeIds[1], // HR
        approved_at: addDays(baseDate, -5),
        rejection_reason: 'Product out of stock',
      },
    ];

    const insertPurchase = db.prepare(`
      INSERT INTO purchases (employee_id, product_id, product_name, quantity, diamond_cost, status, created_at, approved_by, approved_at, rejection_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    purchases.forEach((purch) => {
      insertPurchase.run(
        purch.employee_id,
        purch.product_id,
        purch.product_name,
        purch.quantity,
        purch.diamond_cost,
        purch.status,
        purch.created_at,
        purch.approved_by || null,
        purch.approved_at || null,
        purch.rejection_reason || null
      );
    });

    console.log(`  ✅ Created ${purchases.length} purchases`);

    // ============================================================================
    // HISTORY - Complete activity log
    // ============================================================================
    console.log('  Creating history records...');
    const historyRecords = [
      // Achievement claims
      {
        employee_id: employeeIds[2],
        employee_name: 'Alice Johnson',
        type: 'claim',
        action: 'claimed',
        details: 'Claimed achievement: Year-End Sprint 2024',
        diamonds: 250,
        created_at: addDays(baseDate, -5),
      },
      {
        employee_id: employeeIds[4],
        employee_name: 'Carol Davis',
        type: 'claim',
        action: 'claimed',
        details: 'Claimed achievement: Customer Satisfaction Award',
        diamonds: 200,
        created_at: addDays(baseDate, -3),
      },
      
      // Purchase approvals
      {
        employee_id: employeeIds[2],
        employee_name: 'Alice Johnson',
        type: 'purchase',
        action: 'created',
        details: 'Purchased 3x Sticker Pack',
        diamonds: -45,
        created_at: addDays(baseDate, -10),
      },
      {
        employee_id: employeeIds[2],
        employee_name: 'Alice Johnson',
        type: 'purchase',
        action: 'approved',
        details: 'Purchase approved: 3x Sticker Pack',
        diamonds: 0,
        created_at: addDays(baseDate, -9),
      },
      {
        employee_id: employeeIds[3],
        employee_name: 'Bob Smith',
        type: 'purchase',
        action: 'created',
        details: 'Purchased 1x Water Bottle',
        diamonds: -75,
        created_at: addDays(baseDate, -8),
      },
      {
        employee_id: employeeIds[3],
        employee_name: 'Bob Smith',
        type: 'purchase',
        action: 'approved',
        details: 'Purchase approved: 1x Water Bottle',
        diamonds: 0,
        created_at: addDays(baseDate, -7),
      },
      
      // Purchase rejections (with refunds)
      {
        employee_id: employeeIds[6],
        employee_name: 'Eve Martinez',
        type: 'purchase',
        action: 'created',
        details: 'Purchased 1x Ergonomic Office Chair',
        diamonds: -1000,
        created_at: addDays(baseDate, -5),
      },
      {
        employee_id: employeeIds[6],
        employee_name: 'Eve Martinez',
        type: 'purchase',
        action: 'rejected',
        details: 'Purchase rejected: 1x Ergonomic Office Chair (Refunded 1000💎)',
        diamonds: 1000,
        created_at: addDays(baseDate, -4),
      },
      {
        employee_id: employeeIds[4],
        employee_name: 'Carol Davis',
        type: 'purchase',
        action: 'created',
        details: 'Purchased 1x Limited Edition Hoodie',
        diamonds: -150,
        created_at: addDays(baseDate, -6),
      },
      {
        employee_id: employeeIds[4],
        employee_name: 'Carol Davis',
        type: 'purchase',
        action: 'rejected',
        details: 'Purchase rejected: 1x Limited Edition Hoodie (Refunded 150💎)',
        diamonds: 150,
        created_at: addDays(baseDate, -5),
      },
      
      // Pending purchases (deductions only)
      {
        employee_id: employeeIds[2],
        employee_name: 'Alice Johnson',
        type: 'purchase',
        action: 'created',
        details: 'Purchased 1x Wireless Mouse (Pending approval)',
        diamonds: -100,
        created_at: addDays(baseDate, -1),
      },
      {
        employee_id: employeeIds[3],
        employee_name: 'Bob Smith',
        type: 'purchase',
        action: 'created',
        details: 'Purchased 2x T-Shirt (Pending approval)',
        diamonds: -100,
        created_at: addDays(baseDate, -2),
      },
      {
        employee_id: employeeIds[4],
        employee_name: 'Carol Davis',
        type: 'purchase',
        action: 'created',
        details: 'Purchased 1x Coffee Mug (Pending approval)',
        diamonds: -25,
        created_at: addDays(baseDate, 0),
      },
    ];

    const insertHistory = db.prepare(`
      INSERT INTO history (employee_id, employee_name, type, action, details, diamonds, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    historyRecords.forEach((hist) => {
      insertHistory.run(
        hist.employee_id,
        hist.employee_name,
        hist.type,
        hist.action,
        hist.details,
        hist.diamonds,
        hist.created_at
      );
    });

    console.log(`  ✅ Created ${historyRecords.length} history records`);

    // ============================================================================
    // Summary
    // ============================================================================
    console.log('\n✅ Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • ${employees.length} employees (1 admin, 1 HR, ${employees.length - 2} users)`);
    console.log(`   • ${invitationCodes.length} invitation codes (4 active, 1 inactive)`);
    console.log(`   • ${achievements.length} achievements (3 ongoing, 2 upcoming, 2 expired)`);
    console.log(`   • ${progressData.length} progress records (various states: 0-100%, claimed)`);
    console.log(`   • ${products.length} products (1 out of stock)`);
    console.log(`   • ${purchases.length} purchases (3 pending, 2 approved, 2 rejected)`);
    console.log(`   • ${historyRecords.length} history entries`);
    console.log('\n🔑 Test Accounts:');
    console.log('   Admin:  admin@company.com / admin123');
    console.log('   HR:     hr@company.com / hr123456');
    console.log('   Users:  alice@company.com / user1234 (1500💎)');
    console.log('           bob@company.com / user1234 (500💎)');
    console.log('           carol@company.com / user1234 (150💎)');
    console.log('           david@company.com / user1234 (0💎)');
    console.log('           eve@company.com / user1234 (300💎)');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedDatabase();
  console.log('\n✨ Done!');
}
        password: 'admin123',
        contact: '+1-555-0101',
        address: '123 Admin Street, City, State 12345',
        role: 'admin',
        diamond_balance: 1000,
      },
      {
        employee_id: 'EMP002',
        name: 'HR Manager',
        email: 'hr@company.com',
        password: 'hr123456',
        contact: '+1-555-0102',
        address: '456 HR Avenue, City, State 12345',
        role: 'hr',
        diamond_balance: 500,
      },
      {
        employee_id: 'EMP003',
        name: 'John Doe',
        email: 'john@company.com',
        password: 'user1234',
        contact: '+1-555-0103',
        address: '789 User Lane, City, State 12345',
        role: 'user',
        diamond_balance: 250,
      },
      {
        employee_id: 'EMP004',
        name: 'Jane Smith',
        email: 'jane@company.com',
        password: 'user1234',
        contact: '+1-555-0104',
        address: '321 Employee Road, City, State 12345',
        role: 'user',
        diamond_balance: 150,
      },
      {
        employee_id: 'EMP005',
        name: 'Bob Johnson',
        email: 'bob@company.com',
        password: 'user1234',
        contact: '+1-555-0105',
        address: '654 Worker Boulevard, City, State 12345',
        role: 'user',
        diamond_balance: 75,
        invitation_code_used: 'WELCOME2025',
      },
    ];

    const employeeIds: number[] = [];
    for (const emp of employees) {
      const result = db
        .prepare(
          `INSERT INTO employees (employee_id, name, email, password_hash, contact, address, role, diamond_balance, invitation_code_used)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          emp.employee_id,
          emp.name,
          emp.email,
          hashPasswordSync(emp.password),
          emp.contact,
          emp.address,
          emp.role,
          emp.diamond_balance,
          emp.invitation_code_used || null
        );
      employeeIds.push(result.lastInsertRowid as number);
    }
    console.log(`  ✓ Created ${employees.length} employees`);

    // Seed Invitation Codes
    console.log('  Creating invitation codes...');
    const invitationCodes = [
      { code: 'WELCOME2025', label: 'New Year 2025 Batch', created_by: employeeIds[0] },
      { code: 'SPRING25', label: 'Spring Recruitment', created_by: employeeIds[1] },
      { code: 'TECH2025', label: 'Tech Department', created_by: employeeIds[0] },
      { code: 'INTERN25', label: 'Summer Interns', created_by: employeeIds[1] },
      { code: 'REFER25', label: 'Employee Referral Program', created_by: employeeIds[0] },
    ];

    for (const code of invitationCodes) {
      db.prepare(
        'INSERT INTO invitation_codes (code, label, created_by, is_active) VALUES (?, ?, ?, 1)'
      ).run(code.code, code.label, code.created_by);
    }
    console.log(`  ✓ Created ${invitationCodes.length} invitation codes`);

    // Seed Achievements
    console.log('  Creating achievements...');
    const today = new Date();
    const achievements = [
      {
        title: 'First Week Champion',
        description: 'Complete your first week at the company',
        conditions: 'Work for 5 consecutive days',
        diamond_reward: 50,
        start_date: addDays(today, -30).toISOString(),
        end_date: addDays(today, 60).toISOString(),
        created_by: employeeIds[1],
      },
      {
        title: 'Team Player',
        description: 'Collaborate with 5 different team members',
        conditions: 'Work on projects with 5+ colleagues',
        diamond_reward: 75,
        start_date: addDays(today, -15).toISOString(),
        end_date: addDays(today, 45).toISOString(),
        created_by: employeeIds[1],
      },
      {
        title: 'Productivity Master',
        description: 'Complete 10 tasks ahead of schedule',
        conditions: 'Submit 10 tasks before deadline',
        diamond_reward: 100,
        start_date: addDays(today, -7).toISOString(),
        end_date: addDays(today, 30).toISOString(),
        created_by: employeeIds[0],
      },
      {
        title: 'Innovation Award',
        description: 'Submit an innovative idea that gets implemented',
        conditions: 'Propose and implement a new process improvement',
        diamond_reward: 200,
        start_date: today.toISOString(),
        end_date: addDays(today, 90).toISOString(),
        created_by: employeeIds[0],
      },
      {
        title: 'Mentor of the Month',
        description: 'Help onboard a new employee',
        conditions: 'Successfully mentor a new hire through their first month',
        diamond_reward: 150,
        start_date: addDays(today, 5).toISOString(),
        end_date: addDays(today, 35).toISOString(),
        created_by: employeeIds[1],
      },
    ];

    const achievementIds: number[] = [];
    for (const achievement of achievements) {
      const result = db
        .prepare(
          `INSERT INTO achievements (title, description, conditions, diamond_reward, start_date, end_date, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          achievement.title,
          achievement.description,
          achievement.conditions,
          achievement.diamond_reward,
          achievement.start_date,
          achievement.end_date,
          achievement.created_by
        );
      achievementIds.push(result.lastInsertRowid as number);
    }
    console.log(`  ✓ Created ${achievements.length} achievements`);

    // Seed Achievement Progress
    console.log('  Creating achievement progress...');
    const progressRecords = [
      { employee_id: employeeIds[2], achievement_id: achievementIds[0], status: 'completed', progress: 100 },
      { employee_id: employeeIds[2], achievement_id: achievementIds[1], status: 'on_doing', progress: 60 },
      { employee_id: employeeIds[3], achievement_id: achievementIds[0], status: 'claimed', progress: 100, claimed_at: now() },
      { employee_id: employeeIds[3], achievement_id: achievementIds[2], status: 'on_doing', progress: 40 },
      { employee_id: employeeIds[4], achievement_id: achievementIds[0], status: 'on_doing', progress: 80 },
    ];

    for (const progress of progressRecords) {
      db.prepare(
        `INSERT INTO achievement_progress (employee_id, achievement_id, status, progress_percentage, claimed_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run(
        progress.employee_id,
        progress.achievement_id,
        progress.status,
        progress.progress,
        progress.claimed_at || null
      );
    }
    console.log(`  ✓ Created ${progressRecords.length} progress records`);

    // Seed Products
    console.log('  Creating products...');
    const products = [
      {
        name: 'Company T-Shirt',
        description: 'Premium quality cotton t-shirt with company logo',
        diamond_price: 50,
        quantity: 100,
        image_url: null,
      },
      {
        name: 'Coffee Mug',
        description: 'Ceramic mug with motivational quote',
        diamond_price: 25,
        quantity: 200,
        image_url: null,
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        diamond_price: 75,
        quantity: 50,
        image_url: null,
      },
      {
        name: 'Notebook Set',
        description: 'Set of 3 premium notebooks',
        diamond_price: 30,
        quantity: 150,
        image_url: null,
      },
      {
        name: 'Desk Plant',
        description: 'Small succulent plant for your desk',
        diamond_price: 40,
        quantity: 75,
        image_url: null,
      },
      {
        name: 'Bluetooth Speaker',
        description: 'Portable bluetooth speaker',
        diamond_price: 100,
        quantity: 30,
        image_url: null,
      },
      {
        name: 'Water Bottle',
        description: 'Insulated stainless steel water bottle',
        diamond_price: 35,
        quantity: 120,
        image_url: null,
      },
      {
        name: 'Hoodie',
        description: 'Comfortable hoodie with company branding',
        diamond_price: 80,
        quantity: 60,
        image_url: null,
      },
    ];

    const productIds: number[] = [];
    for (const product of products) {
      const result = db
        .prepare(
          `INSERT INTO products (name, description, diamond_price, quantity, image_url)
           VALUES (?, ?, ?, ?, ?)`
        )
        .run(
          product.name,
          product.description,
          product.diamond_price,
          product.quantity,
          product.image_url
        );
      productIds.push(result.lastInsertRowid as number);
    }
    console.log(`  ✓ Created ${products.length} products`);

    // Seed Purchases
    console.log('  Creating sample purchases...');
    const purchases = [
      {
        employee_id: employeeIds[2],
        product_id: productIds[1],
        product_name: 'Coffee Mug',
        diamond_cost: 25,
        status: 'pending',
      },
      {
        employee_id: employeeIds[3],
        product_id: productIds[0],
        product_name: 'Company T-Shirt',
        diamond_cost: 50,
        status: 'accepted',
        approved_by: employeeIds[0],
        approved_at: now(),
      },
      {
        employee_id: employeeIds[4],
        product_id: productIds[3],
        product_name: 'Notebook Set',
        diamond_cost: 30,
        status: 'pending',
      },
    ];

    for (const purchase of purchases) {
      db.prepare(
        `INSERT INTO purchases (employee_id, product_id, product_name, diamond_cost, status, approved_by, approved_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        purchase.employee_id,
        purchase.product_id,
        purchase.product_name,
        purchase.diamond_cost,
        purchase.status,
        purchase.approved_by || null,
        purchase.approved_at || null
      );
    }
    console.log(`  ✓ Created ${purchases.length} purchases`);

    // Seed History
    console.log('  Creating history records...');
    const historyRecords = [
      {
        employee_id: employeeIds[3],
        employee_name: 'Jane Smith',
        type: 'claim',
        action: 'claimed',
        details: JSON.stringify({
          achievement_id: achievementIds[0],
          achievement_title: 'First Week Champion',
          diamonds_earned: 50,
        }),
        diamonds: 50,
      },
      {
        employee_id: employeeIds[3],
        employee_name: 'Jane Smith',
        type: 'purchase',
        action: 'created',
        details: JSON.stringify({
          purchase_id: 2,
          product_id: productIds[0],
          product_name: 'Company T-Shirt',
          diamond_cost: 50,
          status: 'accepted',
        }),
        diamonds: -50,
      },
    ];

    for (const record of historyRecords) {
      db.prepare(
        `INSERT INTO history (employee_id, employee_name, type, action, details, diamonds)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        record.employee_id,
        record.employee_name,
        record.type,
        record.action,
        record.details,
        record.diamonds
      );
    }
    console.log(`  ✓ Created ${historyRecords.length} history records`);

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Employees: ${employees.length}`);
    console.log(`  - Invitation Codes: ${invitationCodes.length}`);
    console.log(`  - Achievements: ${achievements.length}`);
    console.log(`  - Products: ${products.length}`);
    console.log(`  - Purchases: ${purchases.length}`);
    console.log(`  - History Records: ${historyRecords.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('  Admin: admin@company.com / admin123');
    console.log('  HR: hr@company.com / hr123456');
    console.log('  User: john@company.com / user1234');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase();
}
