// ============================================================================
// IDMOTO Types - All interfaces based on actual property usage in codebase
// ============================================================================

// Firebase Timestamp interface
export interface FirebaseTimestamp {
  toDate: () => Date;
}

// ============================================================================
// USER INTERFACES
// ============================================================================

// User interface for application state (covers Firebase Auth User + custom fields)
export interface User {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
}

// Firebase Auth User interface (for auth operations)
export interface FirebaseUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

// User profile data interface (extends User with Firestore fields)
export interface UserProfile extends User {
  bio?: string;
  joinedAt?: string;
  createdAt?: string;
  lastSeen?: FirebaseTimestamp;
}

// User update data interface for Firestore operations
export interface UserUpdateData {
  postCreatedAt: null;
  joinedAt?: string;
  createdAt?: string;
  displayName?: string;
  bio?: string;
  [key: string]: unknown; // For Firestore compatibility
}

// ============================================================================
// VEHICLE INTERFACES
// ============================================================================

// Complete Vehicle interface - covers all properties used across the app
export interface Vehicle {
  id: string;
  userID: string;
  ownerId?: string; // Used in edit hooks
  user?: string; // Legacy field for user display name
  
  // Basic vehicle info
  manufacturer?: string;
  model?: string;
  year?: number | string;
  color?: string;
  mileage?: number | string;
  
  // Engine specs
  engine?: string;
  horsepower?: number | string;
  transmission?: string;
  nm?: string; // Torque in Newton-meters
  version?: string; // Engine version/variant
  
  // Additional info
  description?: string;
  visibility?: 'public' | 'private';
  
  // Media
  image?: string; // Background image URL
  gallery?: string[]; // Array of gallery image URLs
  bgAlignX?: number; // Background image alignment (0-100)
  
  // Timestamps
  createdAt?: FirebaseTimestamp;
}

// ============================================================================
// FORM INTERFACES
// ============================================================================

// Car form data interface for form components - matches useCarEditHooks exactly
export interface CarFormData {
  manufacturer: string;
  model: string;
  year: string;
  engine: string;
  horsepower: string;
  transmission: string;
  description: string;
  version: string;
  mileage: string;
  color: string;
  nm: string;
}

// ============================================================================
// FEED/POST INTERFACES
// ============================================================================

// Post interface for social feed
export interface Post {
  id: string;
  userId: string; // Note: feed uses userId, not userID like vehicles
  content?: string;
  text?: string; // Also used for content in some places
  imageUrl?: string;
  likes?: string[]; // Array of user IDs who liked the post
  userName?: string;
  userPhoto?: string;
  createdAt?: FirebaseTimestamp;
}

// Ad interface for feed ads
export interface FeedAd {
  isAd: true;
  id: string;
}

// Union type for feed items (posts + ads)
export type FeedItem = Post | FeedAd;

// ============================================================================
// LOG INTERFACES
// ============================================================================

// Car log entry interface
export interface CarLogEntry {
  id?: string;
  type?: string;
  description?: string;
  createdAt?: FirebaseTimestamp;
  date?: string; // Also used as string in some places
}

// ============================================================================
// ACTIVITY INTERFACES
// ============================================================================

// User activity interface (for profile activity feed)
export interface UserActivity {
  id?: string;
  description: string;
  createdAt?: FirebaseTimestamp;
}

// ============================================================================
// UTILITY INTERFACES
// ============================================================================

// Window interface with Google Ads
export interface WindowWithAds extends Window {
  adsbygoogle?: unknown[];
}

// Overview data interface (for profile overview section)
export interface UserOverview {
  favoriteVehicle?: {
    manufacturer?: string;
    model?: string;
  };
}

// Profile data interface (complete user profile for display)
export interface ProfileData {
  displayName: string;
  photoURL: string;
  email: string;
  bio: string;
  joinedAt?: string;
  uid?: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

// Type guard to check if feed item is an ad
export const isAd = (item: FeedItem): item is FeedAd => {
  return 'isAd' in item && item.isAd === true;
};

// Type guard to check if timestamp exists and has toDate method
export const hasValidTimestamp = (obj: { createdAt?: FirebaseTimestamp }): obj is { createdAt: FirebaseTimestamp } => {
  return obj.createdAt !== undefined && typeof obj.createdAt.toDate === 'function';
};
