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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { keyboardHeight, isKeyboardOpen, onInputFocus, onInputBlur } = useKeyboardHandler();

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

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* 3D SCENE - FIXED HEIGHT (Like Replika) */}
      <div className="flex-1 relative min-h-0"> {/* Critical: flex-1 with min-h-0 */}
        <div className="absolute inset-0">
          <Scene />
        </div>
      </div>

      {/* CHAT INTERFACE - SEPARATE FROM SCENE (Like Replika) */}
      <div 
        className="flex-shrink-0 bg-white/10 backdrop-blur-lg border-t border-white/20 transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(-${keyboardHeight}px)`
        }}
      >
        {/* Messages Area */}
        <div 
          className="max-h-48 overflow-y-auto px-4 py-3"
          style={{
            maxHeight: isKeyboardOpen ? '120px' : '192px',
            transition: 'max-height 0.3s ease-out'
          }}
        >
          <div className="space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-blue-600 text-white text-sm leading-relaxed break-words">
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="px-4 pb-4 safe-area-bottom">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
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
                className="w-full bg-black/60 text-white px-4 py-3 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 border border-white/20"
                style={{
                  minHeight: '48px',
                  maxHeight: '120px'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-3 bg-blue-600 text-white rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
