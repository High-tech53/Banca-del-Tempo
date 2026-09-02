export type AccountKind = 'OFFERER' | 'REQUESTER' | 'BOTH';
export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type Frequency = 'ONE_TIME' | 'WEEKLY' | 'FLEXIBLE';
export type Urgency = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type OfferStatus = 'DRAFT'|'PENDING_REVIEW'|'APPROVED'|'REJECTED'|'IN_PROGRESS'|'COMPLETED'|'EXPIRED'|'WITHDRAWN';

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  showLastName: boolean;
  bio?: string | null;
  photoUrl?: string | null;
  city: string;
  zipCode: string;
  latitude?: number | null;
  longitude?: number | null;
  verificationStatus: VerificationStatus;
  ratingAverage: number;
  ratingCount: number;
  helpsCompleted: number;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  accountKind: AccountKind;
  profile: Profile | null;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description?: string | null;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  frequency: Frequency;
  availableDays: string[];
  timeFrom?: string | null;
  timeTo?: string | null;
  zone: string;
  city: string;
  zipCode: string;
  status: OfferStatus;
  viewCount: number;
  createdAt: string;
  category: Category;
  offerer: { id: string; profile: Partial<Profile> | null };
}

export interface Paginated<T> { data: T[]; nextCursor: string | null; }
