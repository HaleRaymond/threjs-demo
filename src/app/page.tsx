"use client";

import { useEffect, useState } from "react";

type Message = {
  id: number;
  text: string;
  from: "user" | "bot";
};

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        setIsKeyboardOpen(true);
        setKeyboardHeight(
          window.visualViewport?.height
            ? window.innerHeight - window.visualViewport.height
            : 300
        );
        document.documentElement.classList.add("ios-keyboard-open");
      }
    };

    const onFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
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

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue.trim(),
      from: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot reply
    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now() + 1,
        text: "This is a bot response",
        from: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <main>
      <div
        className="messages-panel"
        style={{
          transform: isKeyboardOpen
            ? `translateY(-${keyboardHeight}px)`
            : "translateY(0)",
        }}
      >
        <div className="messages-container">
          {messages.map(({ id, text, from }) => (
            <div key={id} className={`message ${from}`}>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
      <div
        className="input-container"
        style={{
          transform: isKeyboardOpen
            ? `translateY(-${keyboardHeight}px)`
            : "translateY(0)",
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type your message"
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </main>
  );
}
