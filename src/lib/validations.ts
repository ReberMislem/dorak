// ============================================
// دورك - Zod Validation Schemas
// ============================================

import { z } from "zod";

// ---- Auth Schemas ----
export const loginSchema = z.object({
  email: z
    .string()
    .email("البريد الإلكتروني غير صالح")
    .max(255),
  password: z
    .string()
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
    .max(100),
});

export const registerSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(100),
  email: z.string().email("البريد الإلكتروني غير صالح").max(255),
  password: z
    .string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "يجب أن تحتوي على حرف كبير وصغير ورقم"
    ),
  phone: z.string().optional(),
  shopName: z.string().min(2, "اسم المحل مطلوب").max(100),
  shopCategory: z.enum([
    "BARBERSHOP",
    "RESTAURANT",
    "CLINIC",
    "CAR_WASH",
    "BEAUTY_SALON",
    "OTHER",
  ]),
});

// ---- Queue Schemas ----
export const createQueueSchema = z.object({
  name: z.string().min(2).max(100),
  nameAr: z.string().max(100).optional(),
  branchId: z.string().optional(),
  maxCapacity: z.number().int().min(1).max(500).default(100),
  avgServiceTime: z.number().int().min(1).max(120).default(15),
  notifyBefore: z.number().int().min(1).max(10).default(3),
  openTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  autoCallEnabled: z.boolean().default(false),
});

export const updateQueueSchema = createQueueSchema.partial();

export const queueStatusSchema = z.object({
  status: z.enum(["OPEN", "PAUSED", "CLOSED"]),
});

// ---- Ticket Schemas ----
export const joinQueueSchema = z.object({
  queueId: z.string().min(1),
  customerName: z.string().max(100).optional().or(z.literal("")),
  customerPhone: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, "رقم الهاتف غير صالح")
    .optional()
    .or(z.literal("")),
});

// ---- Shop Schemas ----
export const updateShopSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  nameAr: z.string().max(100).optional(),
  category: z
    .enum(["BARBERSHOP", "RESTAURANT", "CLINIC", "CAR_WASH", "BEAUTY_SALON", "OTHER"])
    .optional(),
  description: z.string().max(1000).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  registrationStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  registrationEndTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  dailyQueueLimit: z.number().int().min(0).optional().or(z.null()),
  autoResetEnabled: z.boolean().optional(),
  currentStatus: z.enum(["OPEN", "CLOSED", "BREAK"]).optional(),
  workingDays: z.string().optional(),
});

// ---- Staff Schemas ----
export const inviteStaffSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(["SHOP_OWNER", "SHOP_STAFF"]),
  password: z.string().min(8).max(100),
});

// ---- Branch Schemas ----
export const createBranchSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب").max(100),
  nameAr: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
});

// ---- Plan Schemas ----
export const planSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب").max(100),
  slug: z.string().min(2, "الرابط مطلوب").max(100),
  description: z.string().max(1000).optional(),
  price: z.number().min(0),
  currencyCode: z.string().min(2).max(10),
  currencySymbol: z.string().min(1).max(5),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]),
  discountType: z.enum(["PERCENTAGE", "FIXED", "NONE"]),
  discountValue: z.number().min(0),
  trialDays: z.number().int().min(0),
  features: z.array(z.string()).optional(),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateQueueInput = z.infer<typeof createQueueSchema>;
export type UpdateQueueInput = z.infer<typeof updateQueueSchema>;
export type JoinQueueInput = z.infer<typeof joinQueueSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
export type InviteStaffInput = z.infer<typeof inviteStaffSchema>;
export type CreateBranchInput = z.infer<typeof createBranchSchema>;
