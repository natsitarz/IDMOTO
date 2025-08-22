// Firebase Timestamp interface - only what's actually used
export interface FirebaseTimestamp {
  toDate: () => Date;
}

// User interface - only properties actually used in codebase
export interface User {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  emailVerified?: boolean; // Used in profile edit
}

// Vehicle/Car interface - only properties actually used
export interface Vehicle {
  id: string;
  userID: string;
  manufacturer?: string;
  model?: string;
  year?: number | string;
  color?: string;
  mileage?: number | string;
  engine?: string;
  horsepower?: number | string;
  transmission?: string;
  description?: string;
  visibility?: 'public' | 'private';
  bgAlignX?: number;
  nm?: string; // Used in CarSpecs
  version?: string; // Used in CarSpecs
  gallery?: string[]; // Array of image URLs
  image?: string; // Background image URL
}

// Post interface for feed - only properties actually used
export interface Post {
  id: string;
  userId: string; // Note: feed uses userId, not userID
  content?: string;
  text?: string; // Also used for content in some places
  imageUrl?: string;
  likes?: string[];
  userName?: string;
  userPhoto?: string;
  createdAt?: FirebaseTimestamp;
}

// Ad interface for feed
export interface FeedAd {
  isAd: true;
  id: string;
}

// Union type for feed items
export type FeedItem = Post | FeedAd;

// Car form data interface - only for form components
export interface CarFormData {
  manufacturer: string;
  model: string;
  year: string | number;
  engine: string;
  horsepower: string | number;
  transmission: string;
  description: string;
  nm?: string; // Used in CarFormSpecs
  version?: string; // Used in CarFormSpecs
  mileage?: string | number; // Used in CarFormSpecs
  color?: string; // Used in CarFormSpecs
}

// Car log entry interface - minimal based on actual usage
export interface CarLogEntry {
  id?: string;
  type?: string;
  description?: string;
  createdAt?: FirebaseTimestamp;
  date?: string; // Also used as string
}

// Window interface for Google Ads
export interface WindowWithAds extends Window {
  adsbygoogle?: unknown[];
}

// Firebase Auth User - minimal interface for auth operations
export interface FirebaseUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

// Update data interface for firebase operations
export interface UserUpdateData {
  postCreatedAt: null;
  joinedAt?: string;
  createdAt?: string;
  displayName?: string;
  bio?: string;
  [key: string]: unknown; // For Firestore compatibility
}
