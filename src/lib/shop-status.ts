import { Shop, BreakTime, ShopStatus } from "@prisma/client";

export type DetailedShopStatus = {
  status: ShopStatus | "REGISTRATION_CLOSED" | "LIMIT_REACHED" | "NOT_WORKING_DAY";
  message: string;
  canRegister: boolean;
  nextRegistrationTime?: string;
  nextBreakTime?: BreakTime;
  remainingDailyLimit?: number;
};

export function isTimeInRange(current: string, start: string, end: string): boolean {
  // Simple HH:mm comparison
  return current >= start && current <= end;
}

export function getShopDetailedStatus(
  shop: Shop & { breakTimes: BreakTime[] },
  currentTicketCount: number,
  overrideTime?: string // Useful for testing
): DetailedShopStatus {
  // Use a fixed timezone or the shop's timezone
  const timezone = shop.timezone || "Asia/Riyadh";
  
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  });
  
  const currentTime = overrideTime || formatter.format(now);
  
  // Get current day index (0-6) in the shop's timezone
  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "narrow", // Returns "S", "M", "T", etc., but we actually want the index
    timeZone: timezone,
  });
  
  // A more reliable way to get the numeric day in a specific timezone
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: timezone,
  }).formatToParts(now);
  
  const dayName = parts.find(p => p.type === "weekday")?.value;
  const daysMap: Record<string, string> = {
    'Sun': '0', 'Mon': '1', 'Tue': '2', 'Wed': '3', 'Thu': '4', 'Fri': '5', 'Sat': '6'
  };
  const normalizedDay = dayName ? daysMap[dayName] : now.getDay().toString();

  // 1. Check Working Days
  if (shop.workingDays && !shop.workingDays.split(",").includes(normalizedDay)) {
    return {
      status: "NOT_WORKING_DAY",
      message: "اليوم هو يوم إجازة للمحل",
      canRegister: false,
    };
  }

  // 2. Check Shop Status Override
  if (shop.currentStatus === "CLOSED") {
    return {
      status: "CLOSED",
      message: "المحل مغلق حالياً بطلب من الإدارة",
      canRegister: false,
    };
  }

  // 3. Check Working Hours
  if (shop.openTime && shop.closeTime) {
    if (!isTimeInRange(currentTime, shop.openTime, shop.closeTime)) {
      return {
        status: "CLOSED",
        message: `المحل مغلق حالياً. ساعات العمل من ${shop.openTime} حتى ${shop.closeTime}`,
        canRegister: false,
      };
    }
  }

  // 4. Check Break Times
  const activeBreak = shop.breakTimes.find(b => b.isActive && isTimeInRange(currentTime, b.startTime, b.endTime));
  if (activeBreak) {
    return {
      status: "BREAK",
      message: `المحل في وقت استراحة: ${activeBreak.title}`,
      canRegister: false,
    };
  }

  // 5. Check Registration Start Time
  if (shop.registrationStartTime && currentTime < shop.registrationStartTime) {
    return {
      status: "REGISTRATION_CLOSED",
      message: `لم يبدأ التسجيل بعد. يبدأ استقبال العملاء الساعة ${shop.registrationStartTime}`,
      canRegister: false,
      nextRegistrationTime: shop.registrationStartTime,
    };
  }

  // 6. Check Registration End Time
  if (shop.registrationEndTime && currentTime > shop.registrationEndTime) {
    return {
      status: "REGISTRATION_CLOSED",
      message: "انتهى التسجيل لهذا اليوم",
      canRegister: false,
    };
  }

  // 7. Check Daily Limit
  if (shop.dailyQueueLimit && currentTicketCount >= shop.dailyQueueLimit) {
    return {
      status: "LIMIT_REACHED",
      message: "تم اكتمال الحجوزات لليوم. يرجى المحاولة غداً",
      canRegister: false,
      remainingDailyLimit: 0,
    };
  }

  const remainingDailyLimit = shop.dailyQueueLimit ? shop.dailyQueueLimit - currentTicketCount : undefined;

  // Find next break
  const nextBreak = shop.breakTimes
    .filter(b => b.isActive && b.startTime > currentTime)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

  return {
    status: "OPEN",
    message: "المحل مفتوح والتسجيل متاح",
    canRegister: true,
    remainingDailyLimit,
    nextBreakTime: nextBreak,
  };
}
