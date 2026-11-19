"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { WaveIcon, WaveText } from "./WaveText";
import { PlatformLogo } from "./PlatformLogo";
import { activeSocials, contact, person } from "@/lib/content";

export function Contact() {
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");
  const [draft, setDraft] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function copyEmail() {
    try { await navigator.clipboard.writeText(person.email); setCopy("copied"); }
    catch { setCopy("failed"); }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopy("idle"), 3000);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form?.reportValidity()) return;
    const data = new FormData(form);
    const body = `Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("project")}`;
    setDraft(`mailto:${person.email}?subject=${encodeURIComponent("Portfolio inquiry")}&body=${encodeURIComponent(body)}`);
  }

  return (
    <section id="contact" className="contact-section section-pad">
      <div className="wrap">
        <div className="contact-layout">
          <div className="contact-opening">
            <h2>Let&apos;s talk.</h2>
            <p>{contact.blurb}</p>
            <div className="contact-details">
              <div className="email-block">
                <a className="email-link wave-target" href={`mailto:${person.email}`}>
                  <WaveText>{person.email}</WaveText>
                  <ArrowUpRight size={20} aria-hidden="true" />
                </a>
                <button
                  type="button"
                  className="wave-target icon-button copy-email"
                  onClick={copyEmail}
                  aria-label={copy === "copied" ? "Email copied" : "Copy email address"}
                >
                  <WaveIcon size={20}>{copy === "copied" ? <Check size={18} /> : <Copy size={18} />}</WaveIcon>
                </button>
              </div>
              <span className="copy-status" role="status">
                {copy === "copied" ? "Email copied" : copy === "failed" ? "Please use the email link" : ""}
              </span>
            </div>
            <div className="social-links">
              {activeSocials.map((s) => (
                <a key={s.name} className="wave-target" href={s.url} target="_blank" rel="noopener noreferrer">
                  <PlatformLogo platform={s.name} />
                  <WaveText>{s.name}</WaveText>
                </a>
              ))}
            </div>
          </div>

          <form
            ref={formRef}
            className="contact-form"
            action={`mailto:${person.email}`}
            method="post"
            encType="text/plain"
            onSubmit={onSubmit}
            onChange={() => setDraft("")}
          >
            <div className="contact-field">
              <label htmlFor="inquiry-name">Your name</label>
              <input id="inquiry-name" name="name" placeholder="What should I call you?" autoComplete="name" required />
            </div>
            <div className="contact-field">
              <label htmlFor="inquiry-email">Email address</label>
              <input id="inquiry-email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
            </div>
            <div className="contact-field contact-message">
              <label htmlFor="inquiry-project">What do you have in mind?</label>
              <textarea id="inquiry-project" name="project" rows={4} placeholder={contact.messagePlaceholder} required />
            </div>
            <div className="contact-submit">
              <button type="submit" className="button draft-button wave-target">
                <WaveText>Create email draft</WaveText>
                <ArrowUpRight size={22} aria-hidden="true" />
              </button>
            </div>
            {draft && (
              <div className="draft-ready">
                <p>Your draft is ready.</p>
                <a className="draft-link wave-target" href={draft}>
                  <WaveText>Open in email app</WaveText>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </a>
              </div>
            )}
            <noscript><a href={`mailto:${person.email}`}>Email {person.firstName} directly</a></noscript>
          </form>
        </div>
      </div>
    </section>
  );
}
