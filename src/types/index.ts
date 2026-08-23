export interface Service {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number | null;
  duration: number | null;
  category: string;
  image?: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  isPlaceholder?: boolean;
}

export interface GalleryItem {
  _id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  altText: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
}

export interface Review {
  _id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  source: string;
  verified: boolean;
  featured: boolean;
  active: boolean;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  active: boolean;
  sortOrder: number;
}

export interface BusinessSettings {
  _id?: string;
  businessName: string;
  category: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city: string;
  country: string;
  googleRating: number;
  googleReviewCount: number;
  googleMapsUrl?: string;
  googleMapsEmbedUrl?: string;
  websiteUrl?: string;
  logoUrl?: string;
  faviconUrl?: string;
  aboutText?: string;
  announcementText?: string;
  announcementEnabled: boolean;
  whatsappEnabled: boolean;
  bookingEnabled: boolean;
  instagramUrl?: string;
  facebookUrl?: string;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  is24Hours?: boolean;
}

export interface OpeningHours {
  _id?: string;
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
  note?: string;
}

export interface Appointment {
  _id: string;
  customerName: string;
  phone: string;
  customerEmail?: string;
  serviceId?: string;
  serviceName?: string;
  preferredDate: string;
  preferredTime?: string;
  message?: string;
  paymentMethod?: 'cash' | 'jazzcash' | 'easypaisa' | 'card';
  paymentReceipt?: string;
  paymentReceiptPublicId?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  adminNotes?: string;
  createdAt: string;
}

export interface ContactEnquiry {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  service?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: { path: string; message: string }[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
