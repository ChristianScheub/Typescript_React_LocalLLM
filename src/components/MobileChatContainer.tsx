import { useEffect, useState } from 'react';
import type { ChatMessage as ChatMessageType, ChatSettings } from '@types';
import { modelService } from '@services/model';
import { modelStateManager } from '@services/modelStateManager';
import Logger from '@services/logger';
import { MobileChatView } from '@views/MobileChat/MobileChatView';
import { MobileChatWelcome } from '@ui/MobileChatWelcome';
import './MobileChatContainer.css';

interface MobileChatContainerProps {
  provider: 'transformers' | 'webllm';
  chatSettings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
}

export function MobileChatContainer({ provider, chatSettings, onSettingsChange }: MobileChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    Logger.infoService(`[MobileChatContainer] Initializing for provider: ${provider}`);
    
    const handleStateChange = () => {
      Logger.infoService(`[MobileChatContainer] State change detected for provider: ${provider}`);
      const loaded = modelStateManager.getLoadedModels(provider);
      Logger.infoService(`[MobileChatContainer] Loaded models: ${loaded.size > 0 ? Array.from(loaded).join(', ') : 'none'}`);
      
      if (loaded.size > 0) {
        const firstLoadedModel = Array.from(loaded)[0];
        Logger.infoService(`[MobileChatContainer] Setting current model to: ${firstLoadedModel}`);
        setCurrentModel(firstLoadedModel);
        setIsModelLoaded(true);
      } else {
        Logger.infoService(`[MobileChatContainer] No loaded models, clearing current model`);
        setCurrentModel(null);
        setIsModelLoaded(false);
      }
    };
    
    handleStateChange();
    const unsubscribe = modelStateManager.subscribe(handleStateChange);
    return () => {
      Logger.infoService(`[MobileChatContainer] Unsubscribing from modelStateManager for provider: ${provider}`);
      unsubscribe();
    };
  }, [provider]);

  const handleSendMessage = async () => {
    Logger.infoService(`[MobileChatContainer.handleSendMessage] Send clicked. Input: "${inputValue.substring(0, 50)}..."`);
    Logger.infoService(`[MobileChatContainer.handleSendMessage] State - ModelLoaded: ${isModelLoaded}, Loading: ${isLoading}, InputLength: ${inputValue.length}`);
    
    if (!inputValue.trim() || !isModelLoaded || isLoading) {
      Logger.warnService(`[MobileChatContainer.handleSendMessage] Message rejected - InputTrim: ${!!inputValue.trim()}, ModelLoaded: ${isModelLoaded}, Loading: ${isLoading}`);
      return;
    }

    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    Logger.infoService(`[MobileChatContainer.handleSendMessage] Adding user message to history (ID: ${userMessage.id})`);
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      Logger.infoService(`[MobileChatContainer.handleSendMessage] Generating response with provider: ${provider}`);
      const response = await modelService.generateResponse(provider, currentInput, {
        temperature: chatSettings.temperature,
        maxTokens: chatSettings.maxTokens,
        presencePenalty: chatSettings.presencePenalty,
        mode: chatSettings.mode,
      });
      Logger.infoService(`[MobileChatContainer.handleSendMessage] Response received, length: ${response.length}`);
      
      const assistantMessage: ChatMessageType = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      Logger.infoService(`[MobileChatContainer.handleSendMessage] Adding assistant message to history (ID: ${assistantMessage.id})`);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      Logger.errorStack(`[MobileChatContainer.handleSendMessage] Error generating response`, err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Show welcome screen if no model is loaded
  if (!isModelLoaded) {
    return (
      <div className="mobile-chat-container welcome">
        <MobileChatWelcome />
      </div>
    );
  }

  // Show actual chat view when model is loaded
  return (
    <div className="mobile-chat-container">
      <MobileChatView
        messages={messages}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        error={error}
        currentModel={currentModel}
        isModelLoaded={isModelLoaded}
        chatSettings={chatSettings}
        onSettingsChange={onSettingsChange}
      />
    </div>
  );
}
