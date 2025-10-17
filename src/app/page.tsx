"use client";

import { FormEvent, KeyboardEvent, useState, useRef, useEffect } from "react";
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }, 100);
  }, [messages, isKeyboardOpen]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 100);
      textarea.style.height = newHeight + 'px';
    }
  }, [input]);

  // Close modal when clicking backdrop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeChat();
      }
    };

    if (isChatOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatOpen]);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), content: input.trim() },
    ]);
    setInput("");
    
    // Reset textarea height
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
      }
    }, 50);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const closeChat = () => {
    setIsChatOpen(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const openChat = () => {
    setIsChatOpen(true);
    // Focus input after modal animation
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black">
      {/* MAIN 3D SCENE - Always visible, never moves */}
      <div className="absolute inset-0">
        <Scene />
      </div>

      {/* TALK TO ME BUTTON - Fixed at bottom */}
      {!isChatOpen && (
        <div 
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
          }}
        >
          <button
            onClick={openChat}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-semibold shadow-2xl transition-all duration-200 transform hover:scale-105"
          >
            Talk to me
          </button>
        </div>
      )}

      {/* CHAT MODAL - Slides up from bottom like Replika */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeChat}
          />
          
          {/* Modal Content */}
          <div 
            ref={modalRef}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(-${keyboardHeight}px)`,
              maxHeight: '90vh'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Chat</h2>
              <button
                onClick={closeChat}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 messages-container"
              style={{
                maxHeight: '40vh',
                minHeight: '200px'
              }}
            >
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>Start a conversation...</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl px-4 py-3 text-[15px] leading-relaxed break-words shadow-sm">
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div 
              className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-3xl"
              style={{
                paddingBottom: `calc(1rem + env(safe-area-inset-bottom, 0px))`
              }}
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
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    style={{
                      minHeight: '44px',
                      maxHeight: '100px'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
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
