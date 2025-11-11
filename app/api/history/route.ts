import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db/client';
import { handleApiError, AuthenticationError } from '@/lib/utils/errors';
import type { History, HistoryResponse } from '@/types/history';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      throw new AuthenticationError('Not authenticated');
    }

    const employee = validateSession(token);
    if (!employee) {
      throw new AuthenticationError('Invalid or expired session');
    }

    const db = getDatabase();
    const searchParams = request.nextUrl.searchParams;

    // T097: Parse filter parameters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const employeeId = searchParams.get('employeeId');
    const type = searchParams.get('type');
    const action = searchParams.get('action');
    const search = searchParams.get('search');
    
    // T099: Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];

    // T104: Role-based filtering - Users see only own history
    if (employee.role === 'user') {
      conditions.push('employee_id = ?');
      params.push(employee.id);
    } else if (employeeId) {
      // Admin/HR can filter by employee
      conditions.push('employee_id = ?');
      params.push(parseInt(employeeId));
    }

    // T097: Date range filter
    if (startDate) {
      conditions.push("date(created_at) >= date(?)");
      params.push(startDate);
    }
    if (endDate) {
      conditions.push("date(created_at) <= date(?)");
      params.push(endDate);
    }

    // T097: Type and action filters
    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }
    if (action) {
      conditions.push('action = ?');
      params.push(action);
    }

    // T098: Search functionality
    if (search) {
      conditions.push('(employee_name LIKE ? OR details LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM history ${whereClause}`;
    const countResult = db.prepare(countQuery).get(...params) as { total: number };
    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results with T105: proper indexing
    const dataQuery = `
      SELECT * FROM history 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const historyRecords = db.prepare(dataQuery).all(...params, limit, offset) as History[];

    const response: HistoryResponse = {
      data: historyRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
