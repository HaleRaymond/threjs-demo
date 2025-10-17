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
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages, isKeyboardOpen]);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), content: input.trim() },
    ]);
    setInput("");
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
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* SCENE - ABSOLUTELY FIXED */}
      <div className="scene-container">
        <Scene />
      </div>

      {/* CHAT OVERLAY - LIKE REPLIKA */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'transform 0.3s ease-out',
        transform: `translateY(-${keyboardHeight}px)`
      }}>
        {!isChatOpen ? (
          // "Talk to me" button
          <div style={{ 
            padding: '16px',
            paddingBottom: `calc(16px + env(safe-area-inset-bottom, 0px))`
          }}>
            <button
              onClick={() => setIsChatOpen(true)}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '16px',
                border: 'none',
                fontSize: '18px',
                fontWeight: '600'
              }}
            >
              Talk to me
            </button>
          </div>
        ) : (
          // Chat interface
          <div style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            padding: '16px',
            paddingBottom: `calc(16px + env(safe-area-inset-bottom, 0px))`
          }}>
            {/* Messages */}
            <div style={{
              maxHeight: isKeyboardOpen ? '120px' : '200px',
              overflowY: 'auto',
              marginBottom: '16px',
              transition: 'max-height 0.3s ease-out'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {messages.map((msg) => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      maxWidth: '80%',
                      padding: '12px 16px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      borderRadius: '16px',
                      fontSize: '15px',
                      lineHeight: '1.4'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input form */}
            <form onSubmit={handleSubmit} style={{ 
              display: 'flex', 
              gap: '12px', 
              alignItems: 'flex-end' 
            }}>
              <div style={{ flex: 1 }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                  placeholder="Type a message..."
                  rows={1}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    resize: 'none',
                    minHeight: '48px',
                    maxHeight: '120px',
                    fontFamily: 'inherit',
                    fontSize: '16px'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim()}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '16px',
                  border: 'none',
                  fontWeight: '600',
                  opacity: input.trim() ? 1 : 0.5,
                  cursor: input.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Close button when chat is open */}
      {isChatOpen && (
        <button
          onClick={() => setIsChatOpen(false)}
          style={{
            position: 'fixed',
            top: `calc(16px + env(safe-area-inset-top, 0px))`,
            right: '16px',
            zIndex: 1001,
            padding: '8px 16px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.2)',
            fontSize: '14px'
          }}
        >
          Close
        </button>
      )}
    </div>
  );
}
