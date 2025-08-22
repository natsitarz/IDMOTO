import { NextRequest, NextResponse } from "next/server";

// Simple auth helper
function getAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// Basic validation helper
function validateTextInput(text: string, maxLength: number = 500): { isValid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: 'Text is required' };
  }
  
  if (text.trim().length === 0) {
    return { isValid: false, error: 'Text cannot be empty' };
  }
  
  if (text.length > maxLength) {
    return { isValid: false, error: `Text cannot exceed ${maxLength} characters` };
  }
  
  return { isValid: true };
}

// Simple rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (record.count >= maxRequests) {
    return true;
  }
  
  record.count++;
  return false;
}

// Server-side validation rules
const VALIDATION_RULES = {
  maxPostLength: 500,
  maxBioLength: 200,
  maxVehicleDescLength: 1000,
  bannedDomains: ['bit.ly', 'tinyurl.com', 'short.link'], // Suspicious URL shorteners
  requiredFields: {
    vehicle: ['manufacturer', 'model'],
    post: ['text'],
    profile: ['displayName']
  }
};

interface ValidationRequest {
  content: string;
  contentType: 'post' | 'bio' | 'vehicle_description' | 'vehicle_data';
  metadata?: Record<string, unknown>;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedContent?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(clientIP, 50, 60000)) { // 50 requests per minute
      return NextResponse.json(
        { error: "Too many requests. Please try again later." }, 
        { status: 429 }
      );
    }

    // Basic authentication check
    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, contentType, metadata }: ValidationRequest = await req.json();

    if (!content || !contentType) {
      return NextResponse.json(
        { error: "Content and contentType are required" }, 
        { status: 400 }
      );
    }

    const result = validateContent(content, contentType, metadata);

    // Log validation attempts for security monitoring
    console.log(`Content validation - Type: ${contentType}, Valid: ${result.isValid}`);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Content validation error:", error);
    return NextResponse.json(
      { error: "Validation service error" }, 
      { status: 500 }
    );
  }
}

function validateContent(content: string, contentType: string, metadata?: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedContent = content;

  // Basic text validation
  const maxLength = getMaxLength(contentType);
  const textValidation = validateTextInput(content, maxLength);
  if (!textValidation.isValid) {
    errors.push(textValidation.error!);
  }

  // Content-specific validation
  switch (contentType) {
    case 'post':
      validatePostContent(content, errors, warnings);
      break;
    case 'bio':
      validateBioContent(content, errors, warnings);
      break;
    case 'vehicle_description':
      validateVehicleDescription(content, errors, warnings);
      break;
    case 'vehicle_data':
      validateVehicleData(metadata, errors, warnings);
      break;
  }

  // Sanitize content
  sanitizedContent = sanitizeContent(content);

  // Check for suspicious URLs
  validateUrls(content, errors, warnings);

  // Check for spam patterns
  validateSpamPatterns(content, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedContent
  };
}

function getMaxLength(contentType: string): number {
  switch (contentType) {
    case 'post': return VALIDATION_RULES.maxPostLength;
    case 'bio': return VALIDATION_RULES.maxBioLength;
    case 'vehicle_description': return VALIDATION_RULES.maxVehicleDescLength;
    default: return 500;
  }
}

function validatePostContent(content: string, errors: string[], warnings: string[]): void {
  // Check for required automotive context (optional warning)
  const autoKeywords = ['car', 'vehicle', 'drive', 'engine', 'auto', 'wheel', 'brake', 'gear'];
  const hasAutoContext = autoKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  );
  
  if (!hasAutoContext && content.length > 50) {
    warnings.push('Consider adding automotive context to your post');
  }

  // Check for excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.5 && content.length > 20) {
    warnings.push('Consider using less capital letters');
  }
}

function validateBioContent(content: string, errors: string[], warnings: string[]): void {
  // Check for contact information (basic detection)
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
  
  if (emailRegex.test(content)) {
    warnings.push('Consider not including email addresses in your bio');
  }
  
  if (phoneRegex.test(content)) {
    warnings.push('Consider not including phone numbers in your bio');
  }
}

function validateVehicleDescription(content: string, errors: string[], warnings: string[]): void {
  // Check for vehicle-related content
  const vehicleKeywords = ['engine', 'transmission', 'horsepower', 'mileage', 'year', 'model'];
  const hasVehicleContext = vehicleKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  );
  
  if (!hasVehicleContext) {
    warnings.push('Consider adding more vehicle-specific details');
  }
}

function validateVehicleData(metadata: Record<string, unknown> | undefined, errors: string[], warnings: string[]): void {
  if (!metadata) {
    errors.push('Vehicle metadata is required');
    return;
  }

  const required = VALIDATION_RULES.requiredFields.vehicle;
  for (const field of required) {
    if (!metadata[field] || metadata[field].toString().trim().length === 0) {
      errors.push(`${field} is required for vehicle data`);
    }
  }

  // Validate year if provided
  if (metadata.year) {
    const year = parseInt(String(metadata.year));
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear + 2) {
      errors.push('Invalid vehicle year');
    }
  }

  // Validate horsepower if provided
  if (metadata.horsepower) {
    const hp = parseInt(String(metadata.horsepower));
    if (isNaN(hp) || hp < 0 || hp > 2000) {
      warnings.push('Horsepower value seems unusual');
    }
  }
}

function sanitizeContent(content: string): string {
  // Basic HTML/script tag removal
  let sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized;
}

function validateUrls(content: string, errors: string[], warnings: string[]): void {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = content.match(urlRegex) || [];

  for (const url of urls) {
    try {
      const urlObj = new URL(url);
      
      // Check against banned domains
      if (VALIDATION_RULES.bannedDomains.includes(urlObj.hostname)) {
        errors.push(`Suspicious URL detected: ${urlObj.hostname}`);
      }
      
      // Check for non-HTTPS URLs
      if (urlObj.protocol === 'http:') {
        warnings.push('Consider using HTTPS URLs for better security');
      }
    } catch {
      warnings.push('Invalid URL format detected');
    }
  }
}

function validateSpamPatterns(content: string, warnings: string[]): void {
  // Check for excessive repetition
  const words = content.toLowerCase().split(/\s+/);
  const wordCounts = new Map<string, number>();
  
  words.forEach(word => {
    if (word.length > 2) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  });

  for (const [word, count] of wordCounts) {
    if (count > 5) {
      warnings.push(`Word "${word}" is repeated frequently`);
      break; // Only warn once
    }
  }

  // Check for excessive punctuation
  const punctuationCount = (content.match(/[!?]{2,}/g) || []).length;
  if (punctuationCount > 3) {
    warnings.push('Consider using less excessive punctuation');
  }
}
