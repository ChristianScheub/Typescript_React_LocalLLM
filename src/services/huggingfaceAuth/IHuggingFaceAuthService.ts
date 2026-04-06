/**
 * IHuggingFaceAuthService
 * Interface for Hugging Face authentication token management
 */
export interface IHuggingFaceAuthService {
  saveToken(token: string): void;
  getToken(): string | null;
  clearToken(): void;
  hasToken(): boolean;
  isValidToken(token: string): boolean;
}
