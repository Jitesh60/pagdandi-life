"use client";

import { useState } from "react";
import { useStore } from "@/lib/mock/store";
import { PrototypeNote } from "./prototype-note";

/**
 * Simulated sign-in. Any name and email are accepted — there is no account
 * system behind this, it simply records who the prototype thinks you are.
 */
export function SignIn() {
  const { dispatch } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.includes("@")) {
      setError("Enter a name and a valid email address.");
      return;
    }
    dispatch({ type: "session/set", session: { name: name.trim(), email: email.trim() } });
  };

  return (
    <div className="mt-12 max-w-md">
      <h2 className="font-display text-(length:--text-display-sm)">Sign in</h2>
      <p className="mt-4 text-ink-muted">
        Sign in to follow your orders and keep your saved items together.
      </p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
        <div>
          <label htmlFor="name" className="eyebrow">Name</label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full border-b border-line bg-transparent pb-2.5 outline-none transition-colors focus:border-ink"
          />
        </div>
        <div>
          <label htmlFor="email" className="eyebrow">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full border-b border-line bg-transparent pb-2.5 outline-none transition-colors focus:border-ink"
          />
        </div>
        {error && <p role="alert" className="text-[0.875rem] text-clay">{error}</p>}
        <button type="submit" className="mt-2 self-start bg-ink px-8 py-4 text-paper transition-colors duration-500 hover:bg-moss">
          Sign in
        </button>
      </form>

      <div className="mt-10">
        <PrototypeNote>
          No password, no account is created, and nothing leaves your browser. Any details
          are accepted.
        </PrototypeNote>
      </div>
    </div>
  );
}
