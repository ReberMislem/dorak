// ============================================
// دورك - Global TypeScript Types
// ============================================

// ---- Auth Types ----
export type AccountStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "DEACTIVATED";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  shopId?: string;
  accountStatus: AccountStatus;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  shopId?: string;
  accountStatus: AccountStatus;
  iat?: number;
  exp?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  shopName: string;
  shopCategory: ShopCategory;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

// ---- Enums ----
export type UserRole = "SUPER_ADMIN" | "SHOP_OWNER" | "SHOP_STAFF";
export type ShopCategory =
  | "BARBERSHOP"
  | "RESTAURANT"
  | "CLINIC"
  | "CAR_WASH"
  | "BEAUTY_SALON"
  | "OTHER";
export type QueueStatus = "OPEN" | "PAUSED" | "CLOSED";
export type TicketStatus =
  | "WAITING"
  | "CALLED"
  | "SERVING"
  | "COMPLETED"
  | "SKIPPED"
  | "CANCELLED"
  | "NO_SHOW";
export type SubscriptionPlan =
  | "FREE"
  | "STARTER"
  | "PROFESSIONAL"
  | "ENTERPRISE";

// ---- Shop Types ----
export interface Shop {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  category: ShopCategory;
  description?: string;
  logo?: string;
  coverImage?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country: string;
  timezone: string;
  isActive: boolean;
  isVerified: boolean;
  settings?: ShopSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ShopSettings {
  language: "ar" | "en";
  theme: "light" | "dark";
  notificationsEnabled: boolean;
  autoCallEnabled: boolean;
  maxTicketsPerDay?: number;
}

// ---- Queue Types ----
export interface Queue {
  id: string;
  shopId: string;
  branchId?: string;
  name: string;
  nameAr?: string;
  status: QueueStatus;
  maxCapacity: number;
  avgServiceTime: number;
  isActive: boolean;
  notifyBefore: number;
  openTime?: string;
  closeTime?: string;
  currentNumber: number;
  createdAt: string;
  updatedAt: string;
  // Computed
  waitingCount?: number;
  estimatedWait?: number;
}

// ---- Ticket Types ----
export interface Ticket {
  id: string;
  shopId: string;
  queueId: string;
  ticketNumber: number;
  customerName?: string;
  customerPhone?: string;
  customerToken: string;
  status: TicketStatus;
  position: number;
  estimatedWait?: number;
  notified: boolean;
  calledAt?: string;
  servedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  queue?: Queue;
  shop?: Shop;
}

export interface JoinQueueData {
  queueId: string;
  customerName?: string;
  customerPhone?: string;
}

// ---- Analytics Types ----
export interface DailyStats {
  date: string;
  totalTickets: number;
  completedTickets: number;
  cancelledTickets: number;
  skippedTickets: number;
  avgWaitTime: number;
  avgServiceTime: number;
  peakHour?: number;
  maxQueueLength: number;
}

export interface DashboardStats {
  today: {
    totalTickets: number;
    completedTickets: number;
    cancelledTickets: number;
    avgWaitTime: number;
    currentWaiting: number;
  };
  weekly: DailyStats[];
  hourlyDistribution: { hour: number; count: number }[];
}

// ---- API Response Types ----
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ---- WebSocket Event Types ----
export interface WsEvent {
  type: WsEventType;
  payload: unknown;
  shopId: string;
  queueId?: string;
  timestamp: string;
}

export type WsEventType =
  | "TICKET_CREATED"
  | "TICKET_CALLED"
  | "TICKET_COMPLETED"
  | "TICKET_CANCELLED"
  | "TICKET_SKIPPED"
  | "QUEUE_STATUS_CHANGED"
  | "QUEUE_UPDATED"
  | "POSITION_UPDATED";

// ---- UI Types ----
export interface NavItem {
  title: string;
  titleAr: string;
  href: string;
  icon?: string;
  badge?: number;
  children?: NavItem[];
}

export interface Breadcrumb {
  label: string;
  href?: string;
}
