import {
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Zap,
  HeartPulse,
  Film,
  PiggyBank,
  Coffee,
  Plane,
  Gift,
  Circle,
} from 'lucide-react'

/** Icon name (stored in budget_categories.icon) → lucide component. */
export const CATEGORY_ICONS = {
  'shopping-cart': ShoppingCart,
  utensils: Utensils,
  car: Car,
  home: Home,
  zap: Zap,
  'heart-pulse': HeartPulse,
  film: Film,
  'piggy-bank': PiggyBank,
  coffee: Coffee,
  plane: Plane,
  gift: Gift,
  circle: Circle,
}

/** Ordered list for the icon picker grid (12 icons). */
export const ICON_OPTIONS = Object.keys(CATEGORY_ICONS)

export function iconFor(name) {
  return CATEGORY_ICONS[name] || Circle
}

/** Preset category suggestions for onboarding + quick-add. */
export const PRESET_CATEGORIES = [
  { name: 'Groceries', icon: 'shopping-cart' },
  { name: 'Dining Out', icon: 'utensils' },
  { name: 'Transport', icon: 'car' },
  { name: 'Housing', icon: 'home' },
  { name: 'Utilities', icon: 'zap' },
  { name: 'Health', icon: 'heart-pulse' },
  { name: 'Entertainment', icon: 'film' },
  { name: 'Savings', icon: 'piggy-bank' },
  { name: 'Other', icon: 'circle' },
]

/** Best-guess icon for a category name (used when auto-creating). */
export function suggestIcon(name) {
  const preset = PRESET_CATEGORIES.find(
    (p) => p.name.toLowerCase() === name.trim().toLowerCase()
  )
  return preset?.icon || 'circle'
}
