"use client";

import { useState, useEffect, useRef } from "react";
import Scene from "./components/scene/Scene";

function useKeyboardHandler() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const html = document.documentElement;

    function onFocus() {
      setKeyboardOpen(true);
      html.classList.add("ios-keyboard-open");
    }

    function onBlur() {
      setKeyboardOpen(false);
      setKeyboardHeight(0);
      html.classList.remove("ios-keyboard-open");
    }

    function onResize() {
      if (isKeyboardOpen) {
        // Estimate keyboard height from viewport resize on iOS
        const heightDiff = window.innerHeight - document.documentElement.clientHeight;
        setKeyboardHeight(heightDiff > 0 ? heightDiff : 0);
      }
    }

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [isKeyboardOpen]);

  return {
    keyboardHeight,
    isKeyboardOpen,
    onInputFocus: () => {
      setKeyboardOpen(true);
      document.documentElement.classList.add("ios-keyboard-open");
    },
    onInputBlur: () => {
      setKeyboardOpen(false);
      setKeyboardHeight(0);
      document.documentElement.classList.remove("ios-keyboard-open");
    },
  };
}

export default function Page() {
  const { keyboardHeight, isKeyboardOpen, onInputFocus, onInputBlur } = useKeyboardHandler();

  const [messages, setMessages] = useState<
    { id: number; text: string; from: "user" | "bot" }[]
  >([]);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom on new messages or keyboard open
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isKeyboardOpen]);

  // Send message handler
  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = { id: Date.now(), text: inputValue.trim(), from: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: `Echo: ${userMessage.text}`, from: "bot" },
      ]);
    }, 1000);
  };

  // Handle Enter key to send message
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
        className="messages-panel"
        style={{
          bottom: keyboardHeight,
          top: 0,
          left: 0,
          right: 0,
          overflowY: "auto",
          padding: "1rem",
          background: "rgba(0,0,0,0.5)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          WebkitOverflowScrolling: "touch",
          zIndex: 1000,
          position: "fixed",
        }}
      >
        {messages.map(({ id, text, from }) => (
          <div
            key={id}
            className={`max-w-xs px-3 py-2 rounded-lg ${
              from === "user" ? "bg-blue-600 self-end ml-auto" : "bg-gray-700"
            }`}
          >
            {text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div
        className="input-container safe-area-inset"
        style={{
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(0,0,0,0.8)",
          padding: "0.5rem 1rem",
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          position: "fixed",
          zIndex: 1000,
        }}
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          onKeyDown={onKeyDown}
          placeholder="Type your message..."
          style={{
            flexGrow: 1,
            resize: "none",
            borderRadius: 6,
            border: "none",
            padding: "0.5rem",
            fontSize: "1rem",
            lineHeight: 1.3,
            color: "white",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="sentences"
        />
        <button
          onClick={() => {
            sendMessage();
            inputRef.current?.blur();
          }}
          style={{
            backgroundColor: "#2563eb",
            border: "none",
            color: "white",
            borderRadius: 6,
            padding: "0.5rem 1rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Send
        </button>
      </div>
    </>
  );
}
