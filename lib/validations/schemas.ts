import { z } from 'zod';

// ============================================================================
// Common Schemas
// ============================================================================
export const roleSchema = z.enum(['user', 'admin', 'hr']);

export const progressStatusSchema = z.enum(['upcoming', 'on_doing', 'completed', 'claimed']);

export const purchaseStatusSchema = z.enum(['pending', 'accepted', 'rejected']);

export const historyTypeSchema = z.enum(['claim', 'purchase']);

export const historyActionSchema = z.enum(['created', 'approved', 'rejected', 'claimed']);

// ============================================================================
// Employee Schemas
// ============================================================================
export const employeeCreateSchema = z.object({
  employee_id: z.string().min(1, 'Employee ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  contact: z.string().min(1, 'Contact is required'),
  address: z.string().min(1, 'Address is required'),
  role: roleSchema.default('user'),
  invitation_code: z.string().optional(),
});

export const employeeUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  contact: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  role: roleSchema.optional(),
});

export const employeeLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================================================
// Invitation Code Schemas
// ============================================================================
export const invitationCodeCreateSchema = z.object({
  label: z.string().optional(),
  created_by: z.number().int().positive(),
});

export const invitationCodeToggleSchema = z.object({
  is_active: z.boolean(),
});

export const invitationCodeValidateSchema = z.object({
  code: z.string().length(8, 'Invitation code must be 8 characters'),
});

// ============================================================================
// Achievement Schemas
// ============================================================================
export const achievementCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  conditions: z.string().min(1, 'Conditions are required'),
  diamond_reward: z.number().int().positive('Diamond reward must be positive'),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date',
  }),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date',
  }),
}).refine(
  (data) => new Date(data.end_date) > new Date(data.start_date),
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
);

export const achievementUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  conditions: z.string().min(1).optional(),
  diamond_reward: z.number().int().positive().optional(),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
}).refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.end_date) > new Date(data.start_date);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
);

// ============================================================================
// Achievement Progress Schemas
// ============================================================================
export const achievementProgressCreateSchema = z.object({
  employee_id: z.number().int().positive(),
  achievement_id: z.number().int().positive(),
  status: progressStatusSchema.default('on_doing'),
  progress_percentage: z.number().int().min(0).max(100).default(0),
});

export const achievementProgressUpdateSchema = z.object({
  status: progressStatusSchema.optional(),
  progress_percentage: z.number().int().min(0).max(100).optional(),
});

export const achievementClaimSchema = z.object({
  employee_id: z.number().int().positive(),
  achievement_id: z.number().int().positive(),
});

// ============================================================================
// Product Schemas
// ============================================================================
export const productCreateSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  diamond_price: z.number().int().positive('Price must be positive'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative').default(0),
  image_url: z.string().url().optional(),
});

export const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  diamond_price: z.number().int().positive().optional(),
  quantity: z.number().int().min(0).optional(),
  image_url: z.string().url().optional(),
});

// ============================================================================
// Purchase Schemas
// ============================================================================
export const purchaseCreateSchema = z.object({
  employee_id: z.number().int().positive(),
  product_id: z.number().int().positive(),
});

export const purchaseApproveSchema = z.object({
  purchase_id: z.number().int().positive(),
  approved_by: z.number().int().positive(),
});

export const purchaseRejectSchema = z.object({
  purchase_id: z.number().int().positive(),
  approved_by: z.number().int().positive(),
  rejection_reason: z.string().min(1, 'Rejection reason is required'),
});

// ============================================================================
// History Schemas
// ============================================================================
export const historyFilterSchema = z.object({
  employee_id: z.number().int().positive().optional(),
  type: historyTypeSchema.optional(),
  action: historyActionSchema.optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().min(0).default(0),
});

// ============================================================================
// Session Schemas
// ============================================================================
export const sessionCreateSchema = z.object({
  employee_id: z.number().int().positive(),
  token: z.string().min(32),
  expires_at: z.string().datetime(),
});

// ============================================================================
// Pagination Schema
// ============================================================================
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().max(100).default(20),
});

// ============================================================================
// ID Param Schema
// ============================================================================
export const idParamSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()),
});
