/**
 * HuggingFaceAuthServiceImpl
 * Manages Hugging Face authentication tokens for model downloads
 */
import type { IHuggingFaceAuthService } from '@services/huggingfaceAuth/IHuggingFaceAuthService';

const HF_TOKEN_STORAGE_KEY = 'hf_token';
const HF_TOKEN_SESSION_KEY = 'hf_token_session';

class HuggingFaceAuthServiceImplClass implements IHuggingFaceAuthService {
  /**
   * Save HuggingFace token to localStorage
   */
  saveToken(token: string): void {
    if (!token || token.trim() === '') {
      this.clearToken();
      return;
    }
    try {
      localStorage.setItem(HF_TOKEN_STORAGE_KEY, token.trim());
      sessionStorage.setItem(HF_TOKEN_SESSION_KEY, token.trim());
    } catch (error) {
      console.error('Failed to save HuggingFace token:', error);
      throw new Error('Failed to save authentication token');
    }
  }

  /**
   * Get HuggingFace token from storage
   */
  getToken(): string | null {
    try {
      let token = sessionStorage.getItem(HF_TOKEN_SESSION_KEY);
      if (token) return token;

      token = localStorage.getItem(HF_TOKEN_STORAGE_KEY);
      if (token) {
        sessionStorage.setItem(HF_TOKEN_SESSION_KEY, token);
      }
      return token;
    } catch (error) {
      console.error('Failed to retrieve HuggingFace token:', error);
      return null;
    }
  }

  /**
   * Clear HuggingFace token from storage
   */
  clearToken(): void {
    try {
      localStorage.removeItem(HF_TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(HF_TOKEN_SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear HuggingFace token:', error);
    }
  }

  /**
   * Check if token is available
   */
  hasToken(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Validate token format (basic check)
   * Real validation happens on first model download
   */
  isValidToken(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    return token.trim().length > 10;
  }
}

export const HuggingFaceAuthServiceImpl = new HuggingFaceAuthServiceImplClass();
