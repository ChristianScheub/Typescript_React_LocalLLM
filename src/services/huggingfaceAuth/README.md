# HuggingFaceAuthService

Manages Hugging Face authentication tokens for secure access to model downloads and private models on the Hugging Face Hub.

## Purpose

This service handles storing, retrieving, and validating authentication tokens for the Hugging Face API. It provides a unified interface for token management across the application, storing tokens securely in browser storage (localStorage + sessionStorage).

## Responsibilities

- **Token Management**: Save and retrieve HF authentication tokens from browser storage
- **Token Validation**: Basic validation of token format and validity
- **Session Caching**: Fast token retrieval via sessionStorage with localStorage fallback
- **Secure Storage**: Consistent token lifecycle management across sessions

## Interface

```typescript
interface IHuggingFaceAuthService {
  saveToken(token: string): void;
  getToken(): string | null;
  clearToken(): void;
  hasToken(): boolean;
  isValidToken(token: string): boolean;
}
```

## Usage

```typescript
import { HuggingFaceAuthService } from '@services/huggingfaceAuth';

// Save token
HuggingFaceAuthService.saveToken('hf_xxxxxxxxxxxxx');

// Retrieve token
const token = HuggingFaceAuthService.getToken();

// Check if token exists
if (HuggingFaceAuthService.hasToken()) {
  // Use token for requests
}

// Clear token
HuggingFaceAuthService.clearToken();
```

## Storage Strategy

- **sessionStorage**: Fast access during current session
- **localStorage**: Persistent storage across sessions
- Fallback mechanism: Session first, then localStorage

## Security Notes

- Tokens are stored in browser storage (not encrypted)
- Use HTTPS to prevent token interception in transit
- Users should regenerate tokens if compromised
- Tokens have limited API rights based on Hugging Face settings
