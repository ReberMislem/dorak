// ============================================
// دورك - Application Constants
// ============================================

// ---- App Config ----
export const APP_NAME = "دورك";
export const APP_NAME_EN = "Dorak";
export const APP_DESCRIPTION =
  "منصة إدارة الطوابير الرقمية للمحلات الخدمية";
export const APP_VERSION = "1.0.0";

// ---- Routes ----
export const ROUTES = {
  // Public
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  QUEUE_JOIN: "/q",       // /q/[code]
  QUEUE_STATUS: "/ticket", // /ticket/[token]

  // Dashboard
  DASHBOARD: "/dashboard",
  QUEUES: "/dashboard/queues",
  ANALYTICS: "/dashboard/analytics",
  SETTINGS: "/dashboard/settings",
  STAFF: "/dashboard/staff",
  BRANCHES: "/dashboard/branches",
  QR_CODES: "/dashboard/qr-codes",
} as const;

// ---- API Routes ----
export const API = {
  // Auth
  AUTH_LOGIN: "/api/auth/login",
  AUTH_REGISTER: "/api/auth/register",
  AUTH_LOGOUT: "/api/auth/logout",
  AUTH_REFRESH: "/api/auth/refresh",
  AUTH_ME: "/api/auth/me",

  // Shops
  SHOPS: "/api/shops",
  SHOP: (id: string) => `/api/shops/${id}`,

  // Queues
  QUEUES: "/api/queues",
  QUEUE: (id: string) => `/api/queues/${id}`,
  QUEUE_STATUS: (id: string) => `/api/queues/${id}/status`,

  // Tickets
  TICKETS: "/api/tickets",
  TICKET: (token: string) => `/api/tickets/${token}`,
  TICKET_CALL_NEXT: (queueId: string) => `/api/queues/${queueId}/call-next`,
  TICKET_COMPLETE: (token: string) => `/api/tickets/${token}/complete`,
  TICKET_SKIP: (token: string) => `/api/tickets/${token}/skip`,
  TICKET_CANCEL: (token: string) => `/api/tickets/${token}/cancel`,

  // QR
  QR_GENERATE: "/api/qr/generate",
  QR_SCAN: (code: string) => `/api/qr/${code}`,

  // Analytics
  ANALYTICS_DASHBOARD: "/api/analytics/dashboard",
  ANALYTICS_DAILY: "/api/analytics/daily",

  // Staff
  STAFF: "/api/staff",
  STAFF_MEMBER: (id: string) => `/api/staff/${id}`,
} as const;

// ---- Shop Categories ----
export const SHOP_CATEGORIES = [
  { value: "BARBERSHOP",    labelAr: "صالون حلاقة",     labelEn: "Barbershop",    icon: "scissors" },
  { value: "RESTAURANT",   labelAr: "مطعم",             labelEn: "Restaurant",    icon: "utensils" },
  { value: "CLINIC",       labelAr: "عيادة",            labelEn: "Clinic",        icon: "stethoscope" },
  { value: "CAR_WASH",     labelAr: "مغسلة سيارات",    labelEn: "Car Wash",      icon: "car" },
  { value: "BEAUTY_SALON", labelAr: "صالون تجميل",     labelEn: "Beauty Salon",  icon: "sparkles" },
  { value: "OTHER",        labelAr: "أخرى",            labelEn: "Other",         icon: "store" },
] as const;

// ---- Ticket Status Labels ----
export const TICKET_STATUS_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  WAITING:   { ar: "في الانتظار",  en: "Waiting",   color: "blue" },
  CALLED:    { ar: "تم الاستدعاء", en: "Called",    color: "amber" },
  SERVING:   { ar: "قيد الخدمة",  en: "Serving",   color: "green" },
  COMPLETED: { ar: "مكتمل",        en: "Completed", color: "emerald" },
  SKIPPED:   { ar: "تم التخطي",    en: "Skipped",   color: "orange" },
  CANCELLED: { ar: "ملغي",         en: "Cancelled", color: "red" },
  NO_SHOW:   { ar: "لم يحضر",     en: "No Show",   color: "gray" },
};

// ---- Queue Status Labels ----
export const QUEUE_STATUS_LABELS: Record<string, { ar: string; en: string }> = {
  OPEN:   { ar: "مفتوح",  en: "Open" },
  PAUSED: { ar: "متوقف",  en: "Paused" },
  CLOSED: { ar: "مغلق",   en: "Closed" },
};

// ---- Subscription Plans ----
export const SUBSCRIPTION_PLANS = [
  {
    id: "FREE",
    nameAr: "مجاني",
    nameEn: "Free",
    price: 0,
    maxQueues: 1,
    maxStaff: 2,
    features: ["طابور واحد", "موظفان", "إحصائيات أساسية"],
  },
  {
    id: "STARTER",
    nameAr: "مبتدئ",
    nameEn: "Starter",
    price: 49,
    maxQueues: 3,
    maxStaff: 5,
    features: ["3 طوابير", "5 موظفين", "إحصائيات متقدمة", "QR مخصص"],
  },
  {
    id: "PROFESSIONAL",
    nameAr: "احترافي",
    nameEn: "Professional",
    price: 149,
    maxQueues: 10,
    maxStaff: 20,
    features: ["10 طوابير", "20 موظف", "تقارير متقدمة", "فروع متعددة", "API"],
  },
  {
    id: "ENTERPRISE",
    nameAr: "مؤسسي",
    nameEn: "Enterprise",
    price: -1, // تواصل معنا
    maxQueues: -1,
    maxStaff: -1,
    features: ["غير محدود", "دعم مخصص", "SLA", "تكامل مخصص"],
  },
] as const;

// ---- Pagination ----
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ---- Token Expiry ----
export const TOKEN_COOKIE_NAME = "dorak_access_token";
export const REFRESH_COOKIE_NAME = "dorak_refresh_token";

// ---- WebSocket Events ----
export const WS_EVENTS = {
  TICKET_CREATED:        "ticket:created",
  TICKET_CALLED:         "ticket:called",
  TICKET_COMPLETED:      "ticket:completed",
  TICKET_CANCELLED:      "ticket:cancelled",
  TICKET_SKIPPED:        "ticket:skipped",
  QUEUE_STATUS_CHANGED:  "queue:status",
  QUEUE_UPDATED:         "queue:updated",
  POSITION_UPDATED:      "position:updated",
  JOIN_QUEUE_ROOM:       "join:queue",
  JOIN_SHOP_ROOM:        "join:shop",
} as const;
