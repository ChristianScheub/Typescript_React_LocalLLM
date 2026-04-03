# Model State Manager Service

Global state management for tracking loaded AI models across different providers. Maintains a registry of which models are currently loaded for each provider and notifies subscribers of state changes.

## Responsibilities

- Track loaded models per provider (Transformers.js, Web-LLM, etc.)
- Maintain map of provider -> loaded models
- Provide subscriber pattern for state change notifications
- Query model loading status across providers
- Clear model state when models are unloaded
