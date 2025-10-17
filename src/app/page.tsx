"use client";

import { useState, useEffect, useRef } from "react";
import Scene from "./components/scene/Scene";

type Message = {
  id: number;
  text: string;
  from: "user" | "bot";
};

function useKeyboardHandler() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        setIsKeyboardOpen(true);
        const viewportHeight = window.visualViewport?.height;
        if (viewportHeight) {
          setKeyboardHeight(window.innerHeight - viewportHeight);
        } else {
          setKeyboardHeight(300); // fallback height
        }
        document.documentElement.classList.add("ios-keyboard-open");
      }
    };

    const onFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        setIsKeyboardOpen(false);
        setKeyboardHeight(0);
        document.documentElement.classList.remove("ios-keyboard-open");
      }
    };

    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);

    return () => {
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return {
    keyboardHeight,
    isKeyboardOpen,
    onInputFocus: () => {},
    onInputBlur: () => {},
  };
}

export default function Page() {
  const { keyboardHeight, isKeyboardOpen, onInputFocus, onInputBlur } = useKeyboardHandler();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isKeyboardOpen]);

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { id: Date.now(), text: inputValue.trim(), from: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setTimeout(() => {
      const botMessage: Message = { id: Date.now() + 1, text: `Echo: ${userMessage.text}`, from: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
      inputRef.current?.blur();
    }
  };

  return (
    <>
      <Scene />

      <div
        className="messages-panel safe-area-inset"
        style={{
          bottom: isKeyboardOpen ? keyboardHeight : 0,
          transition: "bottom 0.3s ease-out",
          overflowY: "auto",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "rgba(255,255,255,0.9)",
        }}
      >
        <div className="messages-container px-4 py-2">
          {messages.map(({ id, text, from }) => (
            <div
              key={id}
              style={{
                marginBottom: "0.5rem",
                textAlign: from === "user" ? "right" : "left",
                color: from === "user" ? "#007aff" : "#000",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  backgroundColor: from === "user" ? "#d0e8ff" : "#e5e5ea",
                  maxWidth: "80%",
                  wordBreak: "break-word",
                }}
              >
                {text}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div
        className="input-container safe-area-inset"
        style={{
          bottom: isKeyboardOpen ? keyboardHeight : 0,
          transition: "bottom 0.3s ease-out",
          position: "fixed",
          left: 0,
          right: 0,
          zIndex: 1100,
          backgroundColor: "rgba(255,255,255,0.95)",
          padding: "0.5rem 1rem",
          display: "flex",
          alignItems: "center",
          borderTop: "1px solid #ccc",
        }}
      >
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          placeholder="Type your message"
          rows={1}
          style={{
            flexGrow: 1,
            resize: "none",
            borderRadius: "20px",
            border: "1px solid #ccc",
            padding: "0.5rem 1rem",
            fontSize: 16,
            lineHeight: "20px",
            outline: "none",
            backgroundColor: "#fff",
            maxHeight: 100,
          }}
          aria-label="Message input"
        />
        <button
          onClick={sendMessage}
          disabled={!inputValue.trim()}
          style={{
            marginLeft: "0.5rem",
            padding: "0.5rem 1rem",
            fontSize: 16,
            borderRadius: "20px",
            border: "none",
            backgroundColor: inputValue.trim() ? "#007aff" : "#ccc",
            color: "#fff",
            cursor: inputValue.trim() ? "pointer" : "not-allowed",
          }}
          aria-label="Send message"
          type="button"
        >
          Send
        </button>
      </div>
    </>
  );
}
