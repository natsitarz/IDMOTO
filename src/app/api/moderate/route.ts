import { NextRequest, NextResponse } from "next/server";

// Basic server-side keyword filtering (subset of your comprehensive list)
const CRITICAL_NSFW_KEYWORDS = [
  // High-priority inappropriate terms that should always be blocked server-side
  'porn', 'nude', 'naked', 'xxx', 'nsfw', 'sex', 'sexual', 'erotic',
  'fuck', 'shit', 'bitch', 'asshole', 'pussy', 'cock', 'dick',
  'kurwa', 'pierdolić', 'jebać', 'chuj', 'porno', 'seks',
  'sexo', 'porno', 'joder', 'mierda', 'puta',
  'sexe', 'porno', 'putain', 'merde', 'salope'
];

interface ModerationResult {
  isAppropriate: boolean;
  confidence: number;
  flaggedTerms: string[];
  reason?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { content, contentType } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "No content provided" }, 
        { status: 400 }
      );
    }

    let result: ModerationResult;

    if (contentType === 'text') {
      result = moderateTextServerSide(content);
    } else {
      return NextResponse.json(
        { error: "Unsupported content type" }, 
        { status: 400 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Content moderation error:", error);
    return NextResponse.json(
      { error: "Moderation service error" }, 
      { status: 500 }
    );
  }
}

function moderateTextServerSide(text: string): ModerationResult {
  const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = normalizedText.split(/\s+/).filter(word => word.length > 1);
  const flaggedTerms: string[] = [];

  // Check for critical NSFW keywords
  for (const word of words) {
    if (CRITICAL_NSFW_KEYWORDS.includes(word)) {
      flaggedTerms.push(word);
    }
  }

  // Check for patterns (basic server-side detection)
  const suspiciousPatterns = detectSuspiciousPatterns(normalizedText);
  flaggedTerms.push(...suspiciousPatterns);

  const confidence = flaggedTerms.length > 0 ? 
    Math.min(flaggedTerms.length * 0.3, 1.0) : 0;

  const isAppropriate = flaggedTerms.length === 0;

  return {
    isAppropriate,
    confidence,
    flaggedTerms,
    reason: flaggedTerms.length > 0 ? 
      `Content contains inappropriate terms: ${flaggedTerms.slice(0, 3).join(', ')}` : 
      undefined
  };
}

function detectSuspiciousPatterns(text: string): string[] {
  const patterns: string[] = [];
  
  // Check for excessive repetition
  const words = text.split(/\s+/);
  const wordCounts = new Map<string, number>();
  
  words.forEach(word => {
    if (word.length > 2) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  });

  for (const [word, count] of wordCounts) {
    if (count > 5) { // Spam threshold
      patterns.push(`spam-${word}`);
    }
  }

  // Check for l33t speak of critical terms
  const l33tText = text
    .replace(/3/g, 'e')
    .replace(/1/g, 'i')
    .replace(/0/g, 'o')
    .replace(/4/g, 'a')
    .replace(/5/g, 's');

  const l33tWords = l33tText.split(/\s+/);
  for (const word of l33tWords) {
    if (CRITICAL_NSFW_KEYWORDS.includes(word.toLowerCase())) {
      patterns.push(`l33t-${word}`);
    }
  }

  return patterns;
}
