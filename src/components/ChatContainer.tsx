import { useState, useEffect } from 'react';
import type { ChatMessage as ChatMessageType, ChatSettings } from '@types';
import { modelService } from '@services/model';
import { modelStateManager } from '@services/modelStateManager';
import Logger from '@services/logger';
import { useLogCounts } from '@hooks/useLogCounts';
import { useDevicePlatform } from '@hooks/useDevicePlatform';
import { ChatView } from '@views/Chat/ChatView';
import { MobileChatView } from '@views/mobileOnly/MobileChat/MobileChatView';

interface ChatContainerProps {
  provider: 'transformers' | 'webllm';
  chatSettings: ChatSettings;
  onSettingsChange?: (settings: ChatSettings) => void;
}

export function ChatContainer({ provider, chatSettings, onSettingsChange }: ChatContainerProps) {
  const { isMobile } = useDevicePlatform();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const logCounts = useLogCounts();

  useEffect(() => {
    Logger.infoService(`[ChatContainer] Initializing for provider: ${provider}`);
    
    const handleStateChange = () => {
      Logger.infoService(`[ChatContainer] State change detected for provider: ${provider}`);
      const loaded = modelStateManager.getLoadedModels(provider);
      Logger.infoService(`[ChatContainer] Loaded models: ${loaded.size > 0 ? Array.from(loaded).join(', ') : 'none'}`);
      
      if (loaded.size > 0) {
        const firstLoadedModel = Array.from(loaded)[0];
        Logger.infoService(`[ChatContainer] Setting current model to: ${firstLoadedModel}`);
        setCurrentModel(firstLoadedModel);
        setIsModelLoaded(true);
      } else {
        Logger.infoService(`[ChatContainer] No loaded models, clearing current model`);
        setCurrentModel(null);
        setIsModelLoaded(false);
      }
    };
    
    handleStateChange();
    const unsubscribe = modelStateManager.subscribe(handleStateChange);
    return () => {
      Logger.infoService(`[ChatContainer] Unsubscribing from modelStateManager for provider: ${provider}`);
      unsubscribe();
    };
  }, [provider]);

  const handleSendMessage = async () => {
    Logger.infoService(`[ChatContainer.handleSendMessage] Send clicked. Input: "${inputValue.substring(0, 50)}..."`);
    Logger.infoService(`[ChatContainer.handleSendMessage] State - ModelLoaded: ${isModelLoaded}, Loading: ${isLoading}, InputLength: ${inputValue.length}`);
    
    if (!inputValue.trim() || !isModelLoaded || isLoading) {
      Logger.warnService(`[ChatContainer.handleSendMessage] Message rejected - InputTrim: ${!!inputValue.trim()}, ModelLoaded: ${isModelLoaded}, Loading: ${isLoading}`);
      return;
    }

    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    Logger.infoService(`[ChatContainer.handleSendMessage] Adding user message to history (ID: ${userMessage.id})`);
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      Logger.infoService(`[ChatContainer.handleSendMessage] Generating response with provider: ${provider}`);
      const response = await modelService.generateResponse(provider, currentInput, {
        temperature: chatSettings.temperature,
        maxTokens: chatSettings.maxTokens,
        presencePenalty: chatSettings.presencePenalty,
        mode: chatSettings.mode,
      });
      Logger.infoService(`[ChatContainer.handleSendMessage] Response received, length: ${response.length}`);
      
      const assistantMessage: ChatMessageType = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      Logger.infoService(`[ChatContainer.handleSendMessage] Adding assistant message to history (ID: ${assistantMessage.id})`);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      Logger.errorStack(`[ChatContainer.handleSendMessage] Error generating response`, err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isMobile && onSettingsChange) {
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
          showSettings={showSettings}
          onShowSettings={setShowSettings}
          logCounts={logCounts}
        />
      </div>
    );
  }

  return (
    <ChatView
      messages={messages}
      inputValue={inputValue}
      onInputChange={setInputValue}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      error={error}
      currentModel={currentModel}
      isModelLoaded={isModelLoaded}
      provider={provider}
    />
  );
}
