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
  
  const { keyboardHeight, isKeyboardOpen, onInputFocus, onInputBlur } = useKeyboardHandler();

  // Platform detection
  const isIOS = typeof window !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = typeof window !== 'undefined' && /Android/.test(navigator.userAgent);

  // Auto-scroll to bottom
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
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = newHeight + 'px';
    }
  }, [input]);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), content: input.trim() },
    ]);
    setInput("");
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = '48px';
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

  const handleInputFocus = () => {
    onInputFocus();
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <div className="fixed inset-0 bg-black">
      {/* SCENE - ABSOLUTELY FIXED */}
      <div className="scene-container">
        <Scene />
      </div>

      {/* CHAT UI */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        
        {/* MESSAGES OVERLAY */}
        {isChatOpen && (
          <div 
            className="absolute inset-0 pointer-events-auto safe-area-top transition-transform duration-300 ease-out"
            style={{
              // Move messages up on both platforms
              transform: `translateY(-${keyboardHeight}px)`
            }}
          >
            {/* Close button */}
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={handleCloseChat}
                className="px-4 py-2 bg-black/70 text-white rounded-full text-sm backdrop-blur-lg border border-white/20"
              >
                Close
              </button>
            </div>

            {/* Messages container */}
            <div className="h-full flex flex-col justify-end pt-16">
              <div 
                className="flex-1 overflow-y-auto px-4 pb-4"
                style={{
                  // Extra padding for Android to see messages above keyboard
                  paddingBottom: isAndroid ? '120px' : '80px'
                }}
              >
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-blue-600 text-white text-[15px] leading-relaxed break-words shadow-lg">
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INPUT AREA - PLATFORM SPECIFIC POSITIONING */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-auto safe-area-bottom">
          <div 
            className="transition-transform duration-300 ease-out"
            style={{
              // DIFFERENT BEHAVIOR FOR IOS vs ANDROID
              transform: isIOS ? `translateY(-${keyboardHeight}px)` : 'none'
            }}
          >
            {!isChatOpen ? (
              // Initial "Talk to me" button
              <div className="px-4 pb-6">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-medium shadow-xl transition-colors"
                >
                  Talk to me
                </button>
              </div>
            ) : (
              // Chat input - DIFFERENT POSITIONING FOR ANDROID
              <div 
                className="px-4 pb-4 bg-gradient-to-t from-black/60 via-black/40 to-transparent pt-6"
                style={{
                  // On Android, use fixed positioning to stay above keyboard
                  position: isAndroid ? 'fixed' : 'relative',
                  bottom: isAndroid ? '0' : 'auto',
                  left: isAndroid ? '0' : 'auto',
                  right: isAndroid ? '0' : 'auto',
                  zIndex: isAndroid ? 1000 : 'auto'
                }}
              >
                <form onSubmit={handleSubmit} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={handleInputFocus}
                      onBlur={onInputBlur}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full bg-black/70 backdrop-blur-lg text-white px-4 py-3 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 border border-white/20"
                      style={{
                        minHeight: '48px',
                        maxHeight: '120px'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
