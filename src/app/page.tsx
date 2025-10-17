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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isKeyboardOpen]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
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
    <div className="fixed inset-0">
      {/* SCENE - Always visible, fixed position */}
      <div className="scene-container">
        <Scene />
      </div>

      {/* CHAT INTERFACE */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        
        {/* MESSAGES OVERLAY - Only when chat is open */}
        {isChatOpen && (
          <div className="absolute inset-0 pointer-events-auto safe-area-top">
            {/* Close button */}
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={handleCloseChat}
                className="px-4 py-2 bg-black/60 text-white rounded-full text-sm backdrop-blur-lg"
              >
                Close
              </button>
            </div>

            {/* Messages */}
            <div className="h-full flex flex-col justify-end pb-24">
              <div className="px-4 space-y-3 overflow-y-auto max-h-full">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-blue-600 text-white text-[15px] leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM INPUT AREA */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-auto safe-area-bottom">
          {!isChatOpen ? (
            // Initial state - "Talk to me" button
            <div className="px-4 pb-6">
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl text-lg font-medium shadow-lg"
              >
                Talk to me
              </button>
            </div>
          ) : (
            // Chat open - Input area
            <div className="px-4 pb-4 bg-gradient-to-t from-black/50 to-transparent pt-4">
              <form onSubmit={handleSubmit} className="flex gap-2 items-end">
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
                    className="w-full bg-white/90 text-black px-4 py-3 rounded-2xl resize-none focus:outline-none placeholder-gray-500"
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
          )}
        </div>
      </div>
    </div>
  );
}
