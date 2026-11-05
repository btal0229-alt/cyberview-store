import { Tenant, DaySchedule, DayKey } from '../types';

export const DEFAULT_WEEK_SCHEDULE: DaySchedule[] = [
  { key: 'sun', label: 'الأحد', isOpen: true, openTime: '12:00', closeTime: '23:30' },
  { key: 'mon', label: 'الإثنين', isOpen: true, openTime: '12:00', closeTime: '23:30' },
  { key: 'tue', label: 'الثلاثاء', isOpen: true, openTime: '12:00', closeTime: '23:30' },
  { key: 'wed', label: 'الأربعاء', isOpen: true, openTime: '12:00', closeTime: '23:30' },
  { key: 'thu', label: 'الخميس', isOpen: true, openTime: '12:00', closeTime: '01:00' },
  { key: 'fri', label: 'الجمعة', isOpen: true, openTime: '13:00', closeTime: '01:00' },
  { key: 'sat', label: 'السبت', isOpen: true, openTime: '12:00', closeTime: '23:30' },
];

const DAY_INDEX_MAP: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export interface StoreOpenStatus {
  isOpen: boolean;
  statusLabel: string;
  isAutoScheduled: boolean;
  todayScheduleText: string;
  nextOpenText?: string;
}

/**
 * Checks whether the tenant's kitchen is currently open based on auto-schedule
 * or manual store override.
 */
export function isTenantOpenNow(tenant: Tenant, date: Date = new Date()): StoreOpenStatus {
  // If auto-schedule is disabled, respect the manual isOpen toggle
  if (!tenant.autoScheduleEnabled) {
    return {
      isOpen: tenant.isOpen,
      statusLabel: tenant.isOpen ? 'مفتوح (تشغيل يدوي)' : 'مغلق مؤقتاً (إيقاف يدوي)',
      isAutoScheduled: false,
      todayScheduleText: tenant.isOpen ? 'المتجر متاح لاستقبال الطلبات' : 'المتجر مغلق حالياً بقرار من التاجر',
    };
  }

  const schedule = tenant.schedule && tenant.schedule.length > 0 ? tenant.schedule : DEFAULT_WEEK_SCHEDULE;
  const currentDayIndex = date.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
  const currentDayKey = DAY_INDEX_MAP[currentDayIndex];
  const todayConfig = schedule.find(s => s.key === currentDayKey) || schedule[currentDayIndex];

  if (!todayConfig || !todayConfig.isOpen) {
    return {
      isOpen: false,
      statusLabel: 'مغلق اليوم (عطلة أسبوعية)',
      isAutoScheduled: true,
      todayScheduleText: `${todayConfig?.label || 'اليوم'}: عطلة مغلقة`,
      nextOpenText: 'يستأنف العمل غداً حسب الجدول المعتمد',
    };
  }

  // Format current time HH:MM
  const currentHours = String(date.getHours()).padStart(2, '0');
  const currentMinutes = String(date.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  const { openTime, closeTime } = todayConfig;

  // Handle shifts: normal day (e.g. 12:00 to 23:00) vs midnight crossover (e.g. 16:00 to 01:00)
  let isOpenNow = false;

  if (closeTime > openTime) {
    // Normal day shift
    isOpenNow = currentTimeStr >= openTime && currentTimeStr < closeTime;
  } else {
    // Past-midnight shift (e.g. 13:00 to 01:00)
    isOpenNow = currentTimeStr >= openTime || currentTimeStr < closeTime;
  }

  if (isOpenNow) {
    return {
      isOpen: true,
      statusLabel: `مفتوح تلقائياً (حتى ${formatTimeArabic(closeTime)})`,
      isAutoScheduled: true,
      todayScheduleText: `${todayConfig.label}: من ${formatTimeArabic(openTime)} إلى ${formatTimeArabic(closeTime)}`,
    };
  } else {
    const isBeforeOpening = currentTimeStr < openTime;
    const statusLabel = isBeforeOpening 
      ? `مغلق تلقائياً (يفتح اليوم ${formatTimeArabic(openTime)})`
      : 'مغلق تلقائياً (خارج ساعات العمل)';

    return {
      isOpen: false,
      statusLabel,
      isAutoScheduled: true,
      todayScheduleText: `${todayConfig.label}: من ${formatTimeArabic(openTime)} إلى ${formatTimeArabic(closeTime)}`,
      nextOpenText: isBeforeOpening ? `يفتح اليوم في تمام ${formatTimeArabic(openTime)}` : 'يفتح غداً حسب الجدول',
    };
  }
}

/**
 * Format 24h time string (e.g., "14:30") to friendly Arabic time (e.g., "2:30 م")
 */
export function formatTimeArabic(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const period = h >= 12 ? 'م' : 'ص';

  if (h === 0) {
    h = 12;
  } else if (h > 12) {
    h -= 12;
  }

  return `${h}:${m} ${period}`;
}
