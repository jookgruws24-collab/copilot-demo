import { getDatabase } from './client';
import { hashPasswordSync } from '../auth/password';
import { now, addDays } from '../utils/dates';

/**
 * Seed database with sample data for development and testing
 */
export function seedDatabase() {
  const db = getDatabase();

  console.log('🌱 Seeding database...');

  try {
    // Clear existing data (in reverse order of foreign keys)
    db.prepare('DELETE FROM history').run();
    db.prepare('DELETE FROM purchases').run();
    db.prepare('DELETE FROM achievement_progress').run();
    db.prepare('DELETE FROM products').run();
    db.prepare('DELETE FROM achievements').run();
    db.prepare('DELETE FROM sessions').run();
    db.prepare('DELETE FROM invitation_codes').run();
    db.prepare('DELETE FROM employees').run();

    // Seed Employees
    console.log('  Creating employees...');
    const employees = [
      {
        employee_id: 'EMP001',
        name: 'Admin User',
        email: 'admin@company.com',
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
