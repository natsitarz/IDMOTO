/**
 * Client-side API utilities for secure server-side operations
 */

import { auth } from "@/app/parts/firebase";

// Get Firebase ID token for authentication
async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

// Content Validation API
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedContent?: string;
}

export async function validateContent(
  content: string, 
  contentType: 'post' | 'bio' | 'vehicle_description' | 'vehicle_data',
  metadata?: Record<string, unknown>
): Promise<ValidationResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return {
        isValid: false,
        errors: ['Authentication required'],
        warnings: []
      };
    }

    const response = await fetch('/api/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content,
        contentType,
        metadata
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Validation failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Content validation error:', error);
    return {
      isValid: false,
      errors: ['Validation service temporarily unavailable'],
      warnings: []
    };
  }
}

// Content Moderation API
interface ModerationResult {
  isAppropriate: boolean;
  confidence: number;
  flaggedTerms: string[];
  reason?: string;
}

export async function moderateContent(content: string): Promise<ModerationResult> {
  try {
    const response = await fetch('/api/moderate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        contentType: 'text'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Moderation failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Content moderation error:', error);
    return {
      isAppropriate: true, // Fail open for better UX
      confidence: 0,
      flaggedTerms: [],
      reason: 'Moderation service temporarily unavailable'
    };
  }
}

// File Upload Validation API
interface UploadValidationResult {
  success: boolean;
  filename?: string;
  message?: string;
  error?: string;
}

export async function validateFileUpload(
  file: File, 
  carId: string
): Promise<UploadValidationResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('carId', carId);
    formData.append('authToken', token);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload validation failed');
    }

    return await response.json();
  } catch (error) {
    console.error('File upload validation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload validation failed'
    };
  }
}

// Gemini AI API
interface GeminiResult {
  result?: string;
  error?: string;
}

export async function callGeminiAPI(prompt: string): Promise<GeminiResult> {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Gemini API failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      error: error instanceof Error ? error.message : 'AI service temporarily unavailable'
    };
  }
}

// Enhanced content submission with validation and moderation
export async function submitContentSecurely(
  content: string,
  contentType: 'post' | 'bio' | 'vehicle_description' | 'vehicle_data',
  metadata?: Record<string, unknown>
): Promise<{
  success: boolean;
  errors: string[];
  warnings: string[];
  sanitizedContent?: string;
}> {
  // Step 1: Validate content
  const validation = await validateContent(content, contentType, metadata);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
      warnings: validation.warnings
    };
  }

  // Step 2: Moderate content
  const moderation = await moderateContent(content);
  if (!moderation.isAppropriate) {
    return {
      success: false,
      errors: [moderation.reason || 'Content not appropriate'],
      warnings: validation.warnings
    };
  }

  return {
    success: true,
    errors: [],
    warnings: validation.warnings,
    sanitizedContent: validation.sanitizedContent
  };
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkClientRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false; // Rate limited
  }
  
  record.count++;
  return true;
}

// AI Query function
export async function queryAI(question: string, provider: 'gemini' | 'chatgpt' = 'gemini', userInfo?: string, systemPrompt?: string) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Authentication required for AI queries');
    }

    const token = await user.getIdToken();
    const apiEndpoint = provider === 'gemini' ? '/api/gemini' : '/api/chatgpt';
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        question,
        userInfo,
        systemPrompt
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `AI ${provider} query failed`);
    }

    const data = await response.json();
    return data.answer || data.response;
  } catch (error) {
    console.error(`AI ${provider} query error:`, error);
    throw error;
  }
}

export const apiClient = {
  submitContentSecurely,
  moderateContent,
  validateFileUpload,
  validateContent,
  queryAI,
};
