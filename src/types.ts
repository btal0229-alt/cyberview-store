export interface Product {
  id: string;
  name: string;
  price: number;
  category: string; // id of one of the store's categories (see StoreCategory)
  description: string;
  prepTimeMinutes: number;
  isAvailable: boolean;
  calories?: number;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  isSpecial?: boolean;
  ordersCount: number;
  servings?: string; // e.g. "تكفي 3-4 أشخاص"
  servingsCount?: number; // e.g. 1, 2, 4, 6
  isDemo?: boolean; // ready-made sample product added when the store is created
  createdAt: string;
}

export interface StoreCategory {
  id: string;
  label: string;
  emoji?: string;
}

export type DayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface DaySchedule {
  key: DayKey;
  label: string;
  isOpen: boolean;
  openTime: string;  // e.g. "12:00"
  closeTime: string; // e.g. "23:30"
}

export interface Tenant {
  id: string;
  name: string;
  type: 'family' | 'home_kitchen' | 'mufarzanat' | 'sweets' | 'cloud_kitchen' | 'artisan';
  ownerName: string;
  city: string;
  district: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  rating: number;
  totalOrders: number;
  totalRevenue: number;
  isOpen: boolean;
  autoScheduleEnabled?: boolean;
  schedule?: DaySchedule[];
  freelanceDocNumber?: string;
  bannerImage: string;
  avatarImage: string;
  brandColor?: string; // Hex color code e.g. '#d97706'
  // SaaS Licensing & Subscription Properties
  subscriptionPlanId?: string;
  subscriptionPlanName?: string;
  subscriptionStatus?: 'active' | 'trial' | 'expired' | 'suspended';
  subscriptionExpiryDate?: string; // e.g. '2027-11-04'
  licenseKey?: string;
  subdomain?: string;
  demoSeeded?: boolean;
  categories?: StoreCategory[]; // merchant-managed menu sections
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  activationCodes?: string[];
}

export interface Order {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'cooking' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryType: 'pickup' | 'delivery';
  address?: string;
  paymentMethod?: 'cash' | 'mada' | 'apple_pay' | 'bank_transfer';
  customerNotes?: string;
  source?: 'storefront' | 'dashboard';
}

export interface Review {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
  reply?: string;
  replyDate?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeOrdersCount: number;
  totalProducts: number;
  availableProductsCount: number;
  averageRating: number;
  growthRate: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  originalPrice?: number;
  period: 'monthly' | 'yearly' | 'lifetime';
  badge?: string;
  popular?: boolean;
  maxMeals: number; // 9999 for unlimited
  commissionRate: number; // e.g. 0%
  description: string;
  features: string[];
}

export interface LicenseKey {
  id: string;
  code: string;
  planId: string;
  planName: string;
  createdAt: string;
  expiresAt: string;
  status: 'available' | 'used';
  assignedTenantId?: string;
  assignedTenantName?: string;
}

export interface PlatformSettings {
  platformName: string;
  platformSubtitle: string;
  supportWhatsapp: string;
  supportPhone: string;
  supportEmail: string;
  currency: string;
  bankName: string;
  ibanNumber: string;
  accountHolder: string;
  allowSelfRegistration: boolean;
  freeTrialDays: number;
}

