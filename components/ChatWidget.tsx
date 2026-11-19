"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown, { type Components } from "react-markdown";
import { ArrowUp, MessageCircle, Square, X } from "lucide-react";
import { WaveText } from "./WaveText";
import { person } from "@/lib/content";

const textOf = (m: UIMessage) =>
  m.parts.filter((p): p is { type: "text"; text: string } => p.type === "text").map((p) => p.text).join("");

const transport = new DefaultChatTransport({
  api: "/api/chat",
  prepareSendMessagesRequest: ({ messages }) => ({
    body: {
      messages: messages
        .map((m) => ({ role: m.role, content: textOf(m).slice(0, 2000) }))
        .filter((m) => m.content.trim())
        .slice(-20),
    },
  }),
});

const md: Components = {
  a: ({ children, href }) => <a className="chat-link" href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
  p: ({ children }) => <p className="chat-p">{children}</p>,
  ul: ({ children }) => <ul className="chat-list">{children}</ul>,
  ol: ({ children }) => <ol className="chat-list chat-list-ordered">{children}</ol>,
  strong: ({ children }) => <strong className="chat-strong">{children}</strong>,
};

function errorText(message: string) {
  const m = message.toLowerCase();
  if (m.includes("daily limit")) return "You've hit the daily message limit. Please come back tomorrow.";
  if (m.includes("rate limit")) return "Too many messages. Please wait a moment and try again.";
  if (m.includes("not configured")) return `The assistant is offline right now. Please email ${person.firstName} directly.`;
  if (m.includes("fetch") || m.includes("network")) return "Connection issue. Please check your internet and try again.";
  return `The assistant couldn't respond. Please try again, or contact ${person.firstName} by email.`;
}

export default function ChatWidget({ isOpen, onOpen, onClose, mountDelay = 0 }: {
  isOpen: boolean; onOpen: () => void; onClose: () => void; mountDelay?: number;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [cooldown, setCooldown] = useState(0);
  const [pastHero, setPastHero] = useState(false);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error, regenerate, stop } = useChat({
    transport,
    onError: (e) => {
      const m = e.message.match(/try again in (\d+) seconds?/i);
      if (m) setCooldown(Number(m[1]));
    },
  });
  const busy = status === "submitted" || status === "streaming";

  const close = () => { stop(); onClose(); };

  useEffect(() => {
    const d = dialogRef.current;
    if (isOpen && !d?.open) d?.showModal();
    else if (!isOpen && d?.open) d.close();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: "instant", block: "nearest" });
  }, [messages, isOpen]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // the button only appears once the hero has scrolled away
  useEffect(() => {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting && e.boundingClientRect.bottom <= 0));
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <>
      {!isOpen && pastHero && (
        <button type="button" onClick={onOpen} className="chat-fab wave-target" aria-label="Open AI chat assistant" style={{ animationDelay: `${mountDelay}s` }}>
          <MessageCircle size={20} strokeWidth={1.6} aria-hidden="true" />
          <span><WaveText>Ask AI</WaveText></span>
        </button>
      )}
      <dialog
        ref={dialogRef}
        className="chat-panel"
        aria-labelledby="assistant-title"
        onCancel={(e) => { e.preventDefault(); close(); }}
        onClose={() => { if (isOpen) close(); }}
      >
        <div className="chat-toolbar">
          <div className="chat-toolbar-title">
            <span className="chat-avatar" aria-hidden="true">{person.initial}</span>
            <div>
              <h2 id="assistant-title">{person.firstName}&apos;s AI Assistant</h2>
              <p>Projects, skills &amp; experience</p>
            </div>
          </div>
          <button type="button" className="chat-close" onClick={close} aria-label="Close chat"><X size={20} aria-hidden="true" /></button>
        </div>

        <div className="chat-messages" aria-live="polite" aria-atomic="false" aria-label="Chat messages">
          {messages.length === 0 && (
            <div className="chat-welcome"><h3>Get to know<br />{person.firstName}&apos;s work.</h3></div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`chat-message ${m.role === "user" ? "is-user" : ""}`}>
              <div className={m.role === "user" ? "chat-user" : "chat-assistant"}>
                {m.role === "user" ? (
                  <><span className="sr-only">You: </span>{textOf(m)}</>
                ) : (
                  <>
                    <span className="chat-speaker">{person.firstName}&apos;s assistant</span>
                    <ReactMarkdown components={md}>{textOf(m)}</ReactMarkdown>
                  </>
                )}
              </div>
            </div>
          ))}
          {busy && messages.at(-1)?.role === "user" && (
            <p className="chat-thinking chat-muted" role="status">Thinking<span aria-hidden="true">...</span></p>
          )}
          {status === "error" && error && (
            <div className="chat-error" role="alert">
              <p>{errorText(error.message)}</p>
              {!error.message.toLowerCase().includes("daily limit") && (
                <button type="button" disabled={cooldown > 0} onClick={() => regenerate()}>
                  {cooldown ? `Retry in ${cooldown}s` : "Try again"}
                </button>
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form className="chat-form" onSubmit={submit}>
          <label className="sr-only" htmlFor="chat-input">Message {person.firstName}&apos;s AI</label>
          <div className="chat-input-row">
            <textarea
              ref={inputRef}
              rows={1}
              className="chat-input"
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  if (input.trim() && !busy) e.currentTarget.form?.requestSubmit();
                }
              }}
              maxLength={2000}
              placeholder={`Ask about ${person.firstName}…`}
              autoComplete="off"
              enterKeyHint="send"
              disabled={busy}
            />
            {busy ? (
              <button className="chat-send" type="button" onClick={stop} aria-label="Stop response"><Square size={14} fill="currentColor" /></button>
            ) : (
              <button className="chat-send" type="submit" disabled={!input.trim()} aria-label="Send message"><ArrowUp size={20} /></button>
            )}
          </div>
          <div className="chat-input-note">
            <span className="chat-muted">AI can make mistakes. Confirm details with {person.firstName}.</span>
            {input.length > 1500 && <span className="chat-muted">{input.length}/2000</span>}
          </div>
        </form>
      </dialog>
    </>
  );
}
