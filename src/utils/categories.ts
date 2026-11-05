import type { Product, StoreCategory, Tenant } from '../types';

export const DEFAULT_CATEGORIES: StoreCategory[] = [
  { id: 'main', label: 'أطباق رئيسية', emoji: '🍛' },
  { id: 'appetizers', label: 'مقبلات', emoji: '🥟' },
  { id: 'sweets', label: 'حلويات', emoji: '🍰' },
  { id: 'bakery', label: 'معجنات', emoji: '🥐' },
  { id: 'drinks', label: 'مشروبات', emoji: '🥤' },
];

/** Label used for products whose section was deleted. */
export const UNCATEGORIZED: StoreCategory = { id: '', label: 'أخرى', emoji: '📦' };

/** Stores that never edited their sections keep the original five. */
export const getCategories = (tenant: Pick<Tenant, 'categories'> | undefined): StoreCategory[] =>
  Array.isArray(tenant?.categories) ? tenant!.categories : DEFAULT_CATEGORIES;

export const categoryLabel = (categories: StoreCategory[], id: string) => {
  const c = categories.find(c => c.id === id) || UNCATEGORIZED;
  return `${c.emoji ? c.emoji + ' ' : ''}${c.label}`;
};

/** Products whose category no longer exists. */
export const isUncategorized = (categories: StoreCategory[], p: Pick<Product, 'category'>) => !categories.some(c => c.id === p.category);

export const newCategoryId = () => `cat-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/** Shows ISO timestamps in a readable Arabic form; leaves older free-text values as they are. */
export const formatOrderTime = (value: string) => {
  const date = new Date(value);
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value) || Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ar-SA', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};
