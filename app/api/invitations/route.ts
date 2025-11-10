import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db/client';
import { validateSession } from '@/lib/auth/session';
import { generateInvitationCode } from '@/lib/invitations/generate';
import { codeExists } from '@/lib/invitations/validate';
import { handleApiError, AuthenticationError, AuthorizationError } from '@/lib/utils/errors';
import type { InvitationCodeWithUsage, InvitationCodeCreate } from '@/types/invitation';

// GET /api/invitations - List all invitation codes
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    const employee = token ? validateSession(token) : null;

    if (!employee) {
      throw new AuthenticationError();
    }

    // T044: Role-based access control for admin-only endpoints
    if (employee.role !== 'admin' && employee.role !== 'hr') {
      throw new AuthorizationError('Only Admin and HR can view invitation codes');
    }

    // Get all invitation codes with usage stats
    const codes = query<InvitationCodeWithUsage>(`
      SELECT 
        ic.id,
        ic.code,
        ic.label,
        ic.created_by,
        ic.is_active,
        ic.created_at,
        e.name as created_by_name,
        COUNT(emp.id) as usage_count
      FROM invitation_codes ic
      LEFT JOIN employees e ON e.id = ic.created_by
      LEFT JOIN employees emp ON emp.invitation_code_used = ic.code
      GROUP BY ic.id
      ORDER BY ic.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: codes,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/invitations - Create new invitation code
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    const employee = token ? validateSession(token) : null;

    if (!employee) {
      throw new AuthenticationError();
    }

    if (employee.role !== 'admin' && employee.role !== 'hr') {
      throw new AuthorizationError('Only Admin and HR can create invitation codes');
    }

    const body = await request.json();
    const { label } = body as InvitationCodeCreate;

    // Generate unique code
    let code: string;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    do {
      code = generateInvitationCode();
      attempts++;
      
      if (attempts > MAX_ATTEMPTS) {
        throw new Error('Failed to generate unique invitation code');
      }
    } while (codeExists(code));

    // Insert invitation code
    const result = execute(
      'INSERT INTO invitation_codes (code, label, created_by, is_active) VALUES (?, ?, ?, 1)',
      [code, label || null, employee.id]
    );

    const newCode = {
      id: result.lastInsertRowid as number,
      code,
      label: label || null,
      created_by: employee.id,
      is_active: 1,
      created_at: new Date().toISOString(),
      created_by_name: employee.name,
      usage_count: 0,
    };

    return NextResponse.json({
      success: true,
      data: newCode,
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
