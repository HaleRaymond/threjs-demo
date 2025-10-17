"use client";

import { FormEvent, KeyboardEvent, useState, useRef, useEffect, useCallback } from "react";
import Scene from "./components/scene/Scene";
import { useKeyboardHandler } from "../hooks/useKeyboardHandler";

type ChatMessage = {
  id: string;
  content: string;
};

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { keyboardHeight, isKeyboardOpen, platform, onInputFocus, onInputBlur } = useKeyboardHandler();

  // Platform-specific movement strategies - 3% scene movement
  const getMovementValues = () => {
    const sceneMovementPercentage = 0.03; // 3% movement
    
    if (platform === 'ios') {
      // iOS: Scene moves 3%, Chat moves fully
      return {
        scene: Math.floor(keyboardHeight * sceneMovementPercentage),
        chat: keyboardHeight
      };
    } else if (platform === 'android') {
      // Android: Scene moves 3%, Chat moves fully
      return {
        scene: Math.floor(keyboardHeight * sceneMovementPercentage),
        chat: keyboardHeight
      };
    } else {
      // Fallback: 3% movement
      return {
        scene: Math.floor(keyboardHeight * sceneMovementPercentage),
        chat: keyboardHeight
      };
    }
  };

  const { scene: sceneMovement, chat: chatMovement } = getMovementValues();

  // Auto-scroll to bottom
  useEffect(() => {
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, isKeyboardOpen]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 100);
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  const sendMessage = useCallback(() => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), content: input.trim() }]);
    setInput("");
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
      }
    }, 50);
  }, [input]);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    sendMessage();
  }, [sendMessage]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  const openChat = useCallback(() => {
    setIsChatOpen(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 300);
  }, []);

  return (
    <div className="fixed inset-0 bg-black" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* SCENE - Only 3% movement */}
      <div 
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={{ 
          transform: `translateY(-${sceneMovement}px)`,
          // Visual effects when chat is open
          filter: isChatOpen 
            ? platform === 'ios' 
              ? 'brightness(0.8) blur(3px)' 
              : 'brightness(0.85) blur(2px)'
            : 'none',
          scale: isChatOpen ? '1.005' : '1' // Very subtle scale
        }}
      >
        <Scene />
      </div>

      {/* TALK TO ME BUTTON */}
      {!isChatOpen && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10 safe-area-bottom">
          <button
            onClick={openChat}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-semibold shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/20"
          >
            Talk to me
          </button>
        </div>
      )}

      {/* CHAT MODAL - Full movement */}
      {isChatOpen && (
        <div 
          className="fixed inset-0 z-50 transition-transform duration-500 ease-out"
          style={{ transform: `translateY(-${chatMovement}px)` }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              backgroundColor: platform === 'ios' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.5)',
              backdropFilter: platform === 'ios' ? 'blur(6px)' : 'blur(4px)'
            }}
            onClick={closeChat}
          />
          
          {/* Chat Container */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl rounded-t-3xl border-t border-white/20 shadow-2xl max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h2 className="text-xl font-semibold text-white">Chat</h2>
              <button
                onClick={closeChat}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-6 messages-container"
              style={{
                maxHeight: platform === 'ios' ? '32vh' : '36vh',
                minHeight: '150px'
              }}
            >
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-white/50 py-8">
                    <p className="text-lg">Start a conversation...</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[80%] bg-blue-600/90 backdrop-blur-sm text-white rounded-2xl px-5 py-3 text-[16px] leading-relaxed break-words border border-blue-400/30 shadow-lg">
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/20 safe-area-bottom">
              <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full bg-white/10 backdrop-blur-lg text-white rounded-2xl px-5 py-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-white/50 border border-white/20 transition-all duration-200"
                    style={{
                      minHeight: '52px',
                      maxHeight: '120px'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600/50 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 backdrop-blur-sm border border-blue-400/30 hover:scale-105 active:scale-95"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
