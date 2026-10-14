export type PriceType = 'free' | 'paid' | 'voluntary';
export type VerificationStatus = 'verified' | 'pending' | 'unverified';
export type PublicationStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'cancelled';
export type VisibilityType = 'public' | 'unlisted' | 'private';

export interface UserPreferences {
  receiveNewsletter?: boolean;
  notifyNewEvents?: boolean;
  theme?: 'dark' | 'light' | 'system';
}

/**
 * Local visitor profile (no Firebase Auth): `uid` is the visitorId generated
 * in the browser and kept in localStorage. There are no roles or emails.
 */
export interface UserProfile {
  uid: string;
  displayName: string;
  preferredCityId: string;
  preferredCategoryIds: string[];
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  name: string;
  province: string;
  country: string;
  slug: string;
  timezone?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  emoji: string;
  color?: string;
  accentColor?: string;
  description: string;
  displayOrder: number;
  parentId?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  cityId: string;
  cityName: string;
  neighborhood?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description?: string;
  capacity?: number;
  isAccessible: boolean;
  googleMapsUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizerSocialLinks {
  instagram?: string;
  whatsapp?: string;
  website?: string;
  facebook?: string;
}

export interface Organizer {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoURL?: string;
  coverURL?: string;
  category: 'artist' | 'venue' | 'collective' | 'institution';
  cityId: string;
  cityName?: string;
  location?: string;
  socialLinks?: OrganizerSocialLinks;
  instagram?: string;
  whatsapp?: string;
  website?: string;
  verificationStatus: VerificationStatus;
  ownerIds: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface EventAccessibility {
  wheelchair?: boolean;
  audioDescription?: boolean;
  signLanguage?: boolean;
  quietSpace?: boolean;
}

export interface CulturalEvent {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  categoryId: string;
  categoryIds?: string[];
  categoryName: string;
  categoryEmoji: string;
  organizerId: string;
  organizerName: string;
  organizerLogo?: string;
  organizerType: 'artist' | 'venue' | 'collective' | 'institution';
  cityId: string;
  cityName: string;
  venueId?: string;
  venueName: string;
  address: string;
  location?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  startAt: string; // ISO date string (e.g. 2026-10-14T21:00:00-03:00)
  endAt?: string;
  timezone?: string;
  timeDisplay: string;
  dateBadge: string;
  priceType: PriceType;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
  priceDisplay: string;
  ticketUrl?: string;
  imageURL: string;
  imageURLs?: string[];
  imageAlt?: string;
  tags: string[];
  isFeatured?: boolean;
  isOutdoor?: boolean;
  isPetFriendly?: boolean;
  isAccessible?: boolean;
  isFamilyFriendly?: boolean;
  accessibility?: EventAccessibility;
  verificationStatus: VerificationStatus;
  publicationStatus: PublicationStatus;
  visibility?: VisibilityType;
  rejectionReason?: string;
  sourceType: 'community' | 'official' | 'organizer' | 'external_import';
  sourceURL?: string;
  sourceName?: string;
  attendeesCount: number;
  savesCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Favorite {
  id?: string;
  userId: string;
  eventId: string;
  createdAt: string;
}

export interface OrganizerMembership {
  id: string;
  organizerId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: string;
}

export interface EventReport {
  id: string;
  eventId: string;
  reporterId: string;
  reason: 'wrong_info' | 'duplicate' | 'cancelled' | 'inappropriate' | 'other';
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface ModerationQueueItem {
  id: string;
  eventId: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface EventMetrics {
  eventId: string;
  viewsCount: number;
  savesCount: number;
  clicksCount: number;
  updatedAt: string;
}

export interface FilterState {
  searchQuery: string;
  cityId: string;
  dateFilter: 'all' | 'today' | 'tomorrow' | 'weekend' | 'upcoming';
  categoryId: string;
  priceFilter: 'all' | 'free' | 'paid';
  tags: string[];
}
