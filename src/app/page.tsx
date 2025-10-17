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
  const modalRef = useRef<HTMLDivElement>(null);
  
  const { keyboardHeight, isKeyboardOpen, onInputFocus, onInputBlur } = useKeyboardHandler();

  // Auto-scroll to bottom
  useEffect(() => {
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages, isKeyboardOpen, keyboardHeight]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 100);
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  // Close modal when clicking backdrop - FIXED TYPE
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeChat();
      }
    };

    if (isChatOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside as EventListener);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as EventListener);
    };
  }, [isChatOpen]);

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

  const sendMessage = useCallback(() => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), content: input.trim() },
    ]);
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

  return (
    <div className="fixed inset-0 bg-black">
      {/* MAIN 3D SCENE - Always visible */}
      <div className="absolute inset-0">
        <Scene />
      </div>

      {/* TALK TO ME BUTTON */}
      {!isChatOpen && (
        <div 
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10 safe-area-bottom"
        >
          <button
            onClick={openChat}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-semibold shadow-2xl transition-all duration-200 transform hover:scale-105 backdrop-blur-sm border border-white/10"
          >
            Talk to me
          </button>
        </div>
      )}

      {/* TRANSPARENT CHAT MODAL - Like Replika */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50">
          {/* Semi-transparent backdrop - Like Replika */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeChat}
          />
          
          {/* Transparent modal content - Like Replika */}
          <div 
            ref={modalRef}
            className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl rounded-t-3xl border-t border-white/10 shadow-2xl transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(-${keyboardHeight}px)`,
              maxHeight: '90vh'
            }}
          >
            {/* Minimal header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white/90">Chat</h2>
              <button
                onClick={closeChat}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              >
                <span className="text-xl">×</span>
              </button>
            </div>

            {/* Messages Area - Transparent */}
            <div 
              className="flex-1 overflow-y-auto p-4 messages-container"
              style={{
                maxHeight: '40vh',
                minHeight: '200px'
              }}
            >
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-white/50 py-8">
                    <p>Start a conversation...</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[80%] bg-blue-600/90 backdrop-blur-sm text-white rounded-2xl px-4 py-3 text-[15px] leading-relaxed break-words border border-white/10">
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area - Transparent */}
            <div 
              className="p-4 border-t border-white/10 safe-area-bottom"
            >
              <form onSubmit={handleSubmit} className="flex gap-3 items-end">
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
                    className="w-full bg-black/40 backdrop-blur-lg text-white rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-white/50 border border-white/20"
                    style={{
                      minHeight: '44px',
                      maxHeight: '100px'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-5 py-3 bg-blue-600/90 hover:bg-blue-700/90 disabled:bg-gray-600/50 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 backdrop-blur-sm border border-white/10"
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
