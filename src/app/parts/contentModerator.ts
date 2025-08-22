/**
 * Free Anti-NSFW Content Moderation System
 * Uses client-side filtering for text and basic image analysis
 */

// NSFW keyword database - comprehensive multilingual list of inappropriate terms
const NSFW_KEYWORDS = [
  // === ENGLISH ===
  // Explicit terms
  'sex', 'porn', 'nude', 'naked', 'xxx', 'nsfw',
  'sexual', 'erotic', 'adult', 'fetish', 'escort',
  'webcam', 'cam girl', 'strip', 'topless', 'lingerie',
  
  // Profanity and inappropriate language
  'fuck', 'shit', 'bitch', 'asshole', 'damn', 'hell',
  'bastard', 'crap', 'piss', 'cock', 'dick', 'pussy',
  'slut', 'whore', 'faggot', 'nigger', 'retard',
  
  // Drug-related terms
  'weed', 'marijuana', 'cocaine', 'heroin', 'meth',
  'drugs', 'dealer', 'high', 'stoned', 'junkie',
  
  // Violence and harmful content
  'kill', 'murder', 'suicide', 'bomb', 'terrorist',
  'weapon', 'gun', 'knife', 'violence', 'harm',
  
  // Spam and promotional
  'click here', 'buy now', 'make money', 'earn cash',
  'work from home', 'free money', 'get rich',
  
  // Contextual inappropriate terms
  'onlyfans', 'premium snap', 'sugar daddy', 'hookup',
  'dating', 'meet singles', 'chat now', 'live chat',

  // === POLISH ===
  // Explicit terms (Polish)
  'seks', 'porno', 'nagi', 'naga', 'nagie', 'pornografia',
  'seksualny', 'erotyka', 'dorosły', 'fetysz', 'prostytutka',
  'kamerka', 'dziewczyna z kamery', 'striptiz', 'topless',
  
  // Profanity (Polish)
  'kurwa', 'pierdolić', 'jebać', 'chuj', 'suka', 'dupek',
  'gówno', 'skurwysyn', 'dziwka', 'pizda', 'dupa', 'penis',
  'cipka', 'debil', 'idiota', 'kretyn', 'kuttas', 'kutas',
  
  // Drug-related (Polish)
  'marihuana', 'trawka', 'narkotyki', 'dealer', 'naćpany',
  'kokaina', 'heroina', 'metamfetamina', 'amfetamina',
  
  // Violence (Polish)
  'zabić', 'morderstwo', 'samobójstwo', 'bomba', 'terrorysta',
  'broń', 'pistolet', 'nóż', 'przemoc', 'krzywda',

  // === SPANISH ===
  // Explicit terms (Spanish)
  'sexo', 'porno', 'desnudo', 'desnuda', 'pornografía',
  'sexual', 'erótico', 'adulto', 'fetiche', 'prostituta',
  'webcam', 'chica webcam', 'striptease', 'topless',
  
  // Profanity (Spanish)
  'joder', 'mierda', 'puta', 'cabrón', 'coño', 'carajo',
  'pendejo', 'hijo de puta', 'imbécil', 'idiota', 'estúpido',
  'verga', 'polla', 'chocha', 'tetas', 'culo',
  
  // Drug-related (Spanish)
  'marihuana', 'hierba', 'drogas', 'dealer', 'drogado',
  'cocaína', 'heroína', 'metanfetamina', 'éxtasis',
  
  // Violence (Spanish)
  'matar', 'asesinato', 'suicidio', 'bomba', 'terrorista',
  'arma', 'pistola', 'cuchillo', 'violencia', 'daño',

  // === FRENCH ===
  // Explicit terms (French)
  'sexe', 'porno', 'nu', 'nue', 'pornographie',
  'sexuel', 'érotique', 'adulte', 'fétiche', 'prostituée',
  'webcam', 'fille webcam', 'strip-tease', 'topless',
  
  // Profanity (French)
  'putain', 'merde', 'salope', 'connard', 'enculé', 'bite',
  'con', 'fils de pute', 'imbécile', 'idiot', 'crétin',
  'chatte', 'seins', 'cul', 'queue', 'foutre',
  
  // Drug-related (French)
  'marijuana', 'herbe', 'drogues', 'dealer', 'défoncé',
  'cocaïne', 'héroïne', 'méthamphétamine', 'ecstasy',
  
  // Violence (French)
  'tuer', 'meurtre', 'suicide', 'bombe', 'terroriste',
  'arme', 'pistolet', 'couteau', 'violence', 'mal',

  // === COMMON VARIATIONS & LEETSPEAK ===
  // Common misspellings and variations
  'pr0n', 'p0rn', 'n00ds', 'nud3s', 'h0rny', 'h4rd',
  'bi7ch', 'b1tch', 'f*ck', 'sh*t', 'a$$', 'a55',
  
  // Additional inappropriate content
  'camgirl', 'sexting', 'nudes', 'horny', 'milf',
  'gilf', 'dilf', 'bdsm', 'kinky', 'orgasm'
];

// Level-based filtering system
export enum ModerationLevel {
  LOW = 'low',      // Basic filtering
  MEDIUM = 'medium', // Standard filtering
  HIGH = 'high'     // Strict filtering
}

// Moderation result interface
export interface ModerationResult {
  isAppropriate: boolean;
  confidence: number;
  flaggedTerms: string[];
  reason?: string;
  suggestions?: string[];
}

// Image analysis result
export interface ImageModerationResult {
  isAppropriate: boolean;
  confidence: number;
  reason?: string;
  detectedFeatures?: string[];
}

/**
 * Text Content Moderation
 */
export class TextModerator {
  private moderationLevel: ModerationLevel;
  private keywords: Set<string>;
  
  constructor(level: ModerationLevel = ModerationLevel.MEDIUM) {
    this.moderationLevel = level;
    this.keywords = new Set(NSFW_KEYWORDS.map(k => k.toLowerCase()));
  }

  /**
   * Moderate text content
   */
  moderateText(text: string): ModerationResult {
    if (!text || text.trim().length === 0) {
      return {
        isAppropriate: true,
        confidence: 1.0,
        flaggedTerms: []
      };
    }

    const normalizedText = this.normalizeText(text);
    const words = this.extractWords(normalizedText);
    const flaggedTerms: string[] = [];
    
    // Check for exact keyword matches
    for (const word of words) {
      if (this.keywords.has(word.toLowerCase())) {
        flaggedTerms.push(word);
      }
    }

    // Check for suspicious patterns
    const suspiciousPatterns = this.detectSuspiciousPatterns(normalizedText);
    flaggedTerms.push(...suspiciousPatterns);

    // Calculate confidence based on number of flags and context
    const confidence = this.calculateConfidence(flaggedTerms, normalizedText);
    
    // Determine if content is appropriate
    const isAppropriate = flaggedTerms.length === 0 || confidence < this.getThreshold();

    return {
      isAppropriate,
      confidence,
      flaggedTerms,
      reason: flaggedTerms.length > 0 ? 
        `Content contains inappropriate terms: ${flaggedTerms.slice(0, 3).join(', ')}` : 
        undefined,
      suggestions: !isAppropriate ? this.getSuggestions() : undefined
    };
  }

  /**
   * Normalize text for analysis
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ')     // Normalize spaces
      .trim();
  }

  /**
   * Extract words from text
   */
  private extractWords(text: string): string[] {
    return text.split(' ').filter(word => word.length > 1);
  }

  /**
   * Detect suspicious patterns like l33t speak, repeated characters, etc.
   */
  private detectSuspiciousPatterns(text: string): string[] {
    const patterns: string[] = [];
    
    // Check for l33t speak substitutions
    const l33tText = text
      .replace(/3/g, 'e')
      .replace(/1/g, 'i')
      .replace(/0/g, 'o')
      .replace(/4/g, 'a')
      .replace(/5/g, 's')
      .replace(/7/g, 't');
    
    const l33tWords = this.extractWords(l33tText);
    for (const word of l33tWords) {
      if (this.keywords.has(word) && !this.extractWords(text).includes(word)) {
        patterns.push(`l33t: ${word}`);
      }
    }

    // Check for excessive repetition (spam pattern)
    const words = this.extractWords(text);
    const wordCounts = new Map<string, number>();
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });

    for (const [word, count] of wordCounts) {
      if (count > 3 && word.length > 2) {
        patterns.push(`spam: ${word}`);
      }
    }

    return patterns;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(flaggedTerms: string[], text: string): number {
    if (flaggedTerms.length === 0) return 0;
    
    const textLength = text.length;
    const flaggedLength = flaggedTerms.join(' ').length;
    const ratio = flaggedLength / Math.max(textLength, 1);
    
    // Base confidence from ratio
    let confidence = Math.min(ratio * 2, 1.0);
    
    // Boost confidence for multiple flags
    if (flaggedTerms.length > 1) {
      confidence = Math.min(confidence * 1.5, 1.0);
    }
    
    // Boost confidence for common NSFW terms
    const highRiskTerms = ['sex', 'porn', 'nude', 'nsfw'];
    const hasHighRisk = flaggedTerms.some(term => 
      highRiskTerms.some(risk => term.toLowerCase().includes(risk))
    );
    
    if (hasHighRisk) {
      confidence = Math.min(confidence * 1.3, 1.0);
    }
    
    return confidence;
  }

  /**
   * Get threshold based on moderation level
   */
  private getThreshold(): number {
    switch (this.moderationLevel) {
      case ModerationLevel.LOW:
        return 0.7;
      case ModerationLevel.MEDIUM:
        return 0.5;
      case ModerationLevel.HIGH:
        return 0.3;
      default:
        return 0.5;
    }
  }

  /**
   * Get suggestions for improvement
   */
  private getSuggestions(): string[] {
    return [
      'Please keep your content family-friendly and automotive-focused',
      'Consider rephrasing your message to be more appropriate',
      'Remember that this is a community for car enthusiasts of all ages',
      'Focus on sharing your automotive experiences and knowledge'
    ];
  }
}

/**
 * Image Content Moderation using Canvas API
 */
export class ImageModerator {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
  }

  /**
   * Moderate image content using basic analysis
   */
  async moderateImage(file: File): Promise<ImageModerationResult> {
    if (!this.canvas || !this.ctx) {
      return {
        isAppropriate: true,
        confidence: 0.5,
        reason: 'Image analysis not available'
      };
    }

    try {
      // Basic file validation
      const fileValidation = this.validateFile(file);
      if (!fileValidation.isValid) {
        return {
          isAppropriate: false,
          confidence: 1.0,
          reason: fileValidation.reason
        };
      }

      // Load and analyze image
      const imageData = await this.loadImage(file);
      const analysis = this.analyzeImageData(imageData);
      
      return analysis;
    } catch (error) {
      console.warn('Image moderation failed:', error);
      return {
        isAppropriate: true,
        confidence: 0.3,
        reason: 'Could not analyze image'
      };
    }
  }

  /**
   * Validate file before processing
   */
  private validateFile(file: File): { isValid: boolean; reason?: string } {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        isValid: false,
        reason: 'File size too large (max 10MB)'
      };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        reason: 'Unsupported file type'
      };
    }

    // Check for suspicious file names
    const suspiciousNames = ['nude', 'nsfw', 'xxx', 'porn', 'sex'];
    const fileName = file.name.toLowerCase();
    for (const name of suspiciousNames) {
      if (fileName.includes(name)) {
        return {
          isValid: false,
          reason: 'Inappropriate file name'
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Load image and get ImageData
   */
  private loadImage(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        try {
          if (!this.canvas || !this.ctx) {
            reject(new Error('Canvas not available'));
            return;
          }

          // Resize image for analysis (max 400x400)
          const maxSize = 400;
          const scale = Math.min(maxSize / img.width, maxSize / img.height);
          const width = Math.floor(img.width * scale);
          const height = Math.floor(img.height * scale);

          this.canvas.width = width;
          this.canvas.height = height;

          this.ctx.drawImage(img, 0, 0, width, height);
          const imageData = this.ctx.getImageData(0, 0, width, height);

          URL.revokeObjectURL(url);
          resolve(imageData);
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  /**
   * Analyze image data for inappropriate content
   */
  private analyzeImageData(imageData: ImageData): ImageModerationResult {
    const { data, width, height } = imageData;
    const pixels = data.length / 4;
    
    let skinPixels = 0;
    let darkPixels = 0;
    let brightPixels = 0;
    
    // Analyze color distribution
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Detect skin tones (simple heuristic)
      if (this.isSkinTone(r, g, b)) {
        skinPixels++;
      }
      
      // Detect very dark or very bright areas
      const brightness = (r + g + b) / 3;
      if (brightness < 30) {
        darkPixels++;
      } else if (brightness > 225) {
        brightPixels++;
      }
    }
    
    // Calculate ratios
    const skinRatio = skinPixels / pixels;
    const darkRatio = darkPixels / pixels;
    const brightRatio = brightPixels / pixels;
    
    // Simple heuristic analysis
    const detectedFeatures: string[] = [];
    let suspicionScore = 0;
    
    // High skin tone ratio might indicate inappropriate content
    if (skinRatio > 0.4) {
      detectedFeatures.push('high skin tone ratio');
      suspicionScore += 0.3;
    }
    
    // Very dark images might be inappropriate
    if (darkRatio > 0.6) {
      detectedFeatures.push('very dark image');
      suspicionScore += 0.2;
    }
    
    // Very bright/washed out images
    if (brightRatio > 0.5) {
      detectedFeatures.push('overexposed areas');
      suspicionScore += 0.1;
    }
    
    // Check image dimensions (very wide or tall images might be suspicious)
    const aspectRatio = Math.max(width / height, height / width);
    if (aspectRatio > 3) {
      detectedFeatures.push('unusual aspect ratio');
      suspicionScore += 0.1;
    }
    
    const confidence = Math.min(suspicionScore, 1.0);
    const isAppropriate = confidence < 0.6; // Threshold for approval
    
    return {
      isAppropriate,
      confidence,
      detectedFeatures,
      reason: !isAppropriate ? 
        'Image contains potentially inappropriate content based on visual analysis' : 
        undefined
    };
  }

  /**
   * Simple skin tone detection
   */
  private isSkinTone(r: number, g: number, b: number): boolean {
    // Simple skin tone detection heuristic
    // Not perfect but helps with basic detection
    return (
      r > 95 && g > 40 && b > 20 &&
      r > g && r > b &&
      r - g > 15 &&
      Math.abs(r - g) > 15
    );
  }
}

/**
 * Main Content Moderator Class
 */
export class ContentModerator {
  private textModerator: TextModerator;
  private imageModerator: ImageModerator;

  constructor(level: ModerationLevel = ModerationLevel.MEDIUM) {
    this.textModerator = new TextModerator(level);
    this.imageModerator = new ImageModerator();
  }

  /**
   * Moderate text content
   */
  async moderateText(text: string): Promise<ModerationResult> {
    return this.textModerator.moderateText(text);
  }

  /**
   * Moderate image content
   */
  async moderateImage(file: File): Promise<ImageModerationResult> {
    return this.imageModerator.moderateImage(file);
  }

  /**
   * Moderate complete post (text + image)
   */
  async moderatePost(text: string, image?: File): Promise<{
    isAppropriate: boolean;
    textResult: ModerationResult;
    imageResult?: ImageModerationResult;
    overallConfidence: number;
    blockedReasons: string[];
  }> {
    const textResult = await this.moderateText(text);
    let imageResult: ImageModerationResult | undefined;
    
    if (image) {
      imageResult = await this.moderateImage(image);
    }
    
    // Combine results
    const isTextAppropriate = textResult.isAppropriate;
    const isImageAppropriate = imageResult?.isAppropriate ?? true;
    const isAppropriate = isTextAppropriate && isImageAppropriate;
    
    // Calculate overall confidence
    const textConfidence = textResult.confidence;
    const imageConfidence = imageResult?.confidence ?? 0;
    const overallConfidence = image ? 
      Math.max(textConfidence, imageConfidence) : 
      textConfidence;
    
    // Collect blocked reasons
    const blockedReasons: string[] = [];
    if (!isTextAppropriate && textResult.reason) {
      blockedReasons.push(textResult.reason);
    }
    if (!isImageAppropriate && imageResult?.reason) {
      blockedReasons.push(imageResult.reason);
    }
    
    return {
      isAppropriate,
      textResult,
      imageResult,
      overallConfidence,
      blockedReasons
    };
  }
}

// Export singleton instance
export const contentModerator = new ContentModerator(ModerationLevel.MEDIUM);

// Utility function for quick text checking
export const isTextAppropriate = (text: string): boolean => {
  const result = new TextModerator().moderateText(text);
  return result.isAppropriate;
};

// Utility function for quick image checking
export const isImageAppropriate = async (file: File): Promise<boolean> => {
  const result = await new ImageModerator().moderateImage(file);
  return result.isAppropriate;
};
