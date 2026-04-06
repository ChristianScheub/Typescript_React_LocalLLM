import { useState, useEffect } from 'react';
import { HuggingFaceAuthService } from '@services/huggingfaceAuth';
import Logger from '@services/logger';

interface UseHuggingFaceTokenAuthReturn {
  token: string;
  displayToken: string;
  showToken: boolean;
  hasToken: boolean;
  isSaving: boolean;
  saveMessage: 'success' | 'error' | null;
  isEditing: boolean;
  isExpanded: boolean;
  onTokenChange: (value: string) => void;
  onToggleShowToken: () => void;
  onSaveToken: () => Promise<void>;
  onClearToken: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onToggleExpanded: () => void;
}

/**
 * Custom hook to manage HuggingFace token authentication state and logic
 * Consolidates 7 useState calls into a single interface
 */
export function useHuggingFaceTokenAuth(onTokenChange?: (hasToken: boolean) => void): UseHuggingFaceTokenAuthReturn {
  const [token, setToken] = useState('');
  const [displayToken, setDisplayToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<'success' | 'error' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize token state on mount
  useEffect(() => {
    const existingToken = HuggingFaceAuthService.getToken();
    if (existingToken) {
      setHasToken(true);
      const masked = '*'.repeat(Math.max(0, existingToken.length - 10)) + existingToken.slice(-10);
      setDisplayToken(masked);
    }
  }, []);

  const handleSaveToken = async () => {
    if (!token.trim()) {
      setSaveMessage('error');
      return;
    }

    if (!HuggingFaceAuthService.isValidToken(token)) {
      setSaveMessage('error');
      return;
    }

    setIsSaving(true);
    try {
      HuggingFaceAuthService.saveToken(token);
      setHasToken(true);
      const masked = '*'.repeat(Math.max(0, token.length - 10)) + token.slice(-10);
      setDisplayToken(masked);
      setToken('');
      setIsEditing(false);
      setSaveMessage('success');
      onTokenChange?.(true);
      Logger.infoService('[useHuggingFaceTokenAuth] Token saved successfully');
      
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (error) {
      setSaveMessage('error');
      Logger.errorStack(
        '[useHuggingFaceTokenAuth] Failed to save token',
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearToken = () => {
    HuggingFaceAuthService.clearToken();
    setToken('');
    setDisplayToken('');
    setHasToken(false);
    setIsEditing(false);
    setSaveMessage(null);
    onTokenChange?.(false);
    Logger.infoService('[useHuggingFaceTokenAuth] Token cleared');
  };

  return {
    token,
    displayToken,
    showToken,
    hasToken,
    isSaving,
    saveMessage,
    isEditing,
    isExpanded,
    onTokenChange: setToken,
    onToggleShowToken: () => {
      setSaveMessage(null);
      setShowToken(!showToken);
    },
    onSaveToken: handleSaveToken,
    onClearToken: handleClearToken,
    onEdit: () => {
      setSaveMessage(null);
      setIsEditing(true);
    },
    onCancel: () => {
      setIsEditing(false);
      setToken('');
      setSaveMessage(null);
    },
    onToggleExpanded: () => {
      setIsExpanded(!isExpanded);
      setSaveMessage(null);
    }
  };
}
