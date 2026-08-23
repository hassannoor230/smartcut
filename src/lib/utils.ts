import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return 'Price on enquiry';
  return `Rs. ${price.toLocaleString()}`;
}

export function formatPhoneDisplay(phone: string): string {
  return phone;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-]/g, '');
}
