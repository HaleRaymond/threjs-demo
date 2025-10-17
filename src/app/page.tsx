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
  const [showMessages, setShowMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { keyboardHeight, isKeyboardOpen, onInputFocus, onInputBlur } = useKeyboardHandler();

  // iOS touch prevention - ONLY PREVENT ON NON-INPUT ELEMENTS
  useEffect(() => {
    const preventFocus = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // ONLY prevent on non-input elements
      if (target && !['TEXTAREA', 'INPUT', 'BUTTON'].includes(target.tagName)) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', preventFocus, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', preventFocus);
    };
  }, []);

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

  const handleTextareaFocus = () => {
    setShowMessages(true);
    onInputFocus();
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }, 350);
  };

  const handleTextareaBlur = () => {
    onInputBlur();
  };

  const closeMessages = () => {
    setShowMessages(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900">
      {/* SCENE - SEPARATE FIXED LAYER */}
      <div className="scene-container">
        <Scene />
      </div>

      {/* UI - SEPARATE LAYER */}
      <div className="ui-container">
        
        {/* CLOSE BUTTON - FIXED POSITION */}
        {showMessages && (
          <div className="absolute top-0 left-0 right-0 safe-area-inset z-20">
            <div className="flex items-center justify-end py-4 px-4">
              <button
                onClick={closeMessages}
                className="px-4 py-2 bg-black/60 text-white/90 rounded-full text-sm backdrop-blur-lg border border-white/10"
                style={{ minHeight: '44px' }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* MESSAGES PANEL - MOVES WITH KEYBOARD */}
        {showMessages && (
          <div 
            className="movable-ui messages-panel"
            style={{
              transform: `translateY(-${keyboardHeight}px)`,
              paddingTop: 'env(safe-area-inset-top, 0px)'
            }}
          >
            <div className="flex-1 overflow-hidden flex flex-col h-full">
              {/* Spacer for close button */}
              <div className="h-16" />
              
              {/* Messages */}
              <div 
                className="flex-1 overflow-y-auto px-4 messages-container"
                style={{
                  paddingBottom: isKeyboardOpen ? '120px' : '0px'
                }}
              >
                <div className="space-y-3 py-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-blue-600 text-white text-[15px] leading-relaxed break-words shadow-xl">
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INPUT AREA - FIXED AT BOTTOM, ALLOW FOCUS */}
        <div 
          className="input-area"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            zIndex: 1000
          }}
        >
          <div className="px-4 pb-4 bg-gradient-to-t from-black/50 to-transparent pt-6">
            <form onSubmit={handleSubmit} className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={handleTextareaFocus}
                  onBlur={handleTextareaBlur}
                  placeholder="Type a message..."
                  rows={1}
                  className="w-full bg-black/60 backdrop-blur-lg text-white px-4 py-3 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 border border-white/10 text-[16px]"
                  style={{
                    minHeight: '48px',
                    maxHeight: '120px'
                  }}
                  // CRITICAL: Ensure textarea can receive focus
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex-shrink-0 shadow-xl"
                style={{ minHeight: '48px' }}
                // Allow button to work
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
