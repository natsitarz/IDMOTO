/**
 * React Hook for Content Moderation
 * Provides easy integration with the content moderation system
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  contentModerator,
  ContentModerator,
  ImageModerationResult,
  ModerationLevel,
  ModerationResult,
} from "./contentModerator";

interface UseModerationOptions {
  level?: ModerationLevel;
  onBlock?: (reasons: string[]) => void;
  onApprove?: () => void;
  autoCheck?: boolean;
}

interface ModerationState {
  isChecking: boolean;
  lastResult: {
    isAppropriate: boolean;
    textResult?: ModerationResult;
    imageResult?: ImageModerationResult;
    blockedReasons: string[];
    overallConfidence: number;
  } | null;
  error: string | null;
}

export function useContentModeration(options: UseModerationOptions = {}) {
  const {
    level = ModerationLevel.MEDIUM,
    onBlock,
    onApprove,
    autoCheck = false,
  } = options;

  const [state, setState] = useState<ModerationState>({
    isChecking: false,
    lastResult: null,
    error: null,
  });

  // Create moderator with specified level
  const moderatorRef = useRef(contentModerator);

  // Update moderation level when it changes
  useEffect(() => {
    if (level !== ModerationLevel.MEDIUM) {
      moderatorRef.current = new ContentModerator(level);
    }

    // Use autoCheck parameter in some way (even if just for future features)
    if (autoCheck) {
      console.log("Auto-check enabled for content moderation");
    }
  }, [level, autoCheck]);

  // Check text content
  const checkText = useCallback(
    async (text: string): Promise<ModerationResult> => {
      setState((prev) => ({ ...prev, isChecking: true, error: null }));

      try {
        const result = await moderatorRef.current.moderateText(text);

        if (!result.isAppropriate && onBlock) {
          onBlock(
            result.reason
              ? [result.reason]
              : ["Content flagged as inappropriate"]
          );
        } else if (result.isAppropriate && onApprove) {
          onApprove();
        }

        setState((prev) => ({
          ...prev,
          isChecking: false,
          lastResult: {
            isAppropriate: result.isAppropriate,
            textResult: result,
            blockedReasons: result.reason ? [result.reason] : [],
            overallConfidence: result.confidence,
          },
        }));

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setState((prev) => ({
          ...prev,
          isChecking: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [onBlock, onApprove]
  );

  // Check image content
  const checkImage = useCallback(
    async (file: File): Promise<ImageModerationResult> => {
      setState((prev) => ({ ...prev, isChecking: true, error: null }));

      try {
        const result = await moderatorRef.current.moderateImage(file);

        if (!result.isAppropriate && onBlock) {
          onBlock(
            result.reason ? [result.reason] : ["Image flagged as inappropriate"]
          );
        } else if (result.isAppropriate && onApprove) {
          onApprove();
        }

        setState((prev) => ({
          ...prev,
          isChecking: false,
          lastResult: {
            isAppropriate: result.isAppropriate,
            imageResult: result,
            blockedReasons: result.reason ? [result.reason] : [],
            overallConfidence: result.confidence,
          },
        }));

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setState((prev) => ({
          ...prev,
          isChecking: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [onBlock, onApprove]
  );

  // Check complete post (text + image)
  const checkPost = useCallback(
    async (text: string, image?: File): Promise<boolean> => {
      setState((prev) => ({ ...prev, isChecking: true, error: null }));

      try {
        const result = await moderatorRef.current.moderatePost(text, image);

        if (!result.isAppropriate && onBlock) {
          onBlock(result.blockedReasons);
        } else if (result.isAppropriate && onApprove) {
          onApprove();
        }

        setState((prev) => ({
          ...prev,
          isChecking: false,
          lastResult: result,
        }));

        return result.isAppropriate;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setState((prev) => ({
          ...prev,
          isChecking: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [onBlock, onApprove]
  );

  // Quick validation without storing results
  const validateText = useCallback(async (text: string): Promise<boolean> => {
    try {
      const result = await moderatorRef.current.moderateText(text);
      return result.isAppropriate;
    } catch {
      return true; // Allow on error
    }
  }, []);

  const validateImage = useCallback(async (file: File): Promise<boolean> => {
    try {
      const result = await moderatorRef.current.moderateImage(file);
      return result.isAppropriate;
    } catch {
      return true; // Allow on error
    }
  }, []);

  // Clear last result
  const clearResult = useCallback(() => {
    setState((prev) => ({ ...prev, lastResult: null, error: null }));
  }, []);

  // Get blocking reasons as user-friendly messages
  const getBlockingMessage = useCallback((): string | null => {
    if (!state.lastResult || state.lastResult.isAppropriate) {
      return null;
    }

    const reasons = state.lastResult.blockedReasons;
    if (reasons.length === 0) {
      return "Content was flagged as inappropriate";
    }

    // Return the first reason or combine them
    if (reasons.length === 1) {
      return reasons[0];
    }

    return `Multiple issues found: ${reasons.join(", ")}`;
  }, [state.lastResult]);

  // Get suggestions for improvement
  const getSuggestions = useCallback((): string[] => {
    if (!state.lastResult?.textResult?.suggestions) {
      return [
        "Please keep your content family-friendly and automotive-focused",
        "Consider rephrasing your message to be more appropriate",
        "Focus on sharing your automotive experiences and knowledge",
      ];
    }

    return state.lastResult.textResult.suggestions;
  }, [state.lastResult]);

  return {
    // State
    isChecking: state.isChecking,
    lastResult: state.lastResult,
    error: state.error,

    // Actions
    checkText,
    checkImage,
    checkPost,
    validateText,
    validateImage,
    clearResult,

    // Helpers
    getBlockingMessage,
    getSuggestions,

    // Quick access to results
    isBlocked: state.lastResult ? !state.lastResult.isAppropriate : false,
    confidence: state.lastResult?.overallConfidence ?? 0,
    blockedReasons: state.lastResult?.blockedReasons ?? [],
  };
}

// Component for displaying moderation feedback
interface ModerationFeedbackProps {
  isBlocked: boolean;
  message: string | null;
  suggestions: string[];
  onDismiss?: () => void;
}

export function ModerationFeedback({
  isBlocked,
  message,
  suggestions,
  onDismiss,
}: ModerationFeedbackProps) {
  if (!isBlocked || !message) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg
            className="w-4 h-4 text-red-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h4 className="text-red-400 font-semibold text-sm mb-1">
            Content Blocked
          </h4>
          <p className="text-red-300 text-sm mb-3 leading-relaxed">{message}</p>

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-red-300 text-xs font-medium">Suggestions:</p>
              <ul className="space-y-1">
                {suggestions.slice(0, 2).map((suggestion, index) => (
                  <li
                    key={index}
                    className="text-red-200 text-xs flex items-start gap-1"
                  >
                    <span className="text-red-400 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="cursor-pointer p-1 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Component for showing moderation status while checking
interface ModerationStatusProps {
  isChecking: boolean;
  checkingText?: string;
}

export function ModerationStatus({
  isChecking,
  checkingText = "Checking content...",
}: ModerationStatusProps) {
  if (!isChecking) return null;

  return (
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-3 mb-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
        <div className="flex-1">
          <p className="text-blue-300 text-sm font-medium">{checkingText}</p>
          <p className="text-blue-200 text-xs opacity-75">
            Ensuring content meets community guidelines
          </p>
        </div>
      </div>
    </div>
  );
}
