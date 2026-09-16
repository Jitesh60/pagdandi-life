"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/mock/store";
import { PrototypeNote } from "./prototype-note";
import type { RentalBooking } from "@/lib/mock/types";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/**
 * The rental basket: chosen gear and dates, submitted as a request for the
 * shop to quote. Rentals are never priced automatically.
 */
export function RentalRequestView() {
  const { state, dispatch } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  const lines = state.rentalCart;

  if (submitted) {
    return (
      <div className="mt-12 border-t border-line pt-14">
        <p className="eyebrow">Request {submitted}</p>
        <h2 className="mt-5 font-display text-(length:--text-display-md)">
          We&apos;ll confirm shortly.
        </h2>
        <p className="mt-5 max-w-md text-ink-muted">
          Your request is with the shop. We check the gear is free on those dates, then
          come back with a rate on WhatsApp.
        </p>
        <div className="mt-9 max-w-md">
          <PrototypeNote>
            Nothing was actually sent — the request was recorded in your browser and now
            appears under Rentals in the admin dashboard.
          </PrototypeNote>
        </div>
        <Link href="/rent" className="mt-9 inline-block border-b border-ink pb-1 transition-colors hover:border-moss hover:text-moss">
          Back to the rental catalogue
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mt-12 border-t border-line pt-14">
        <p className="font-display text-(length:--text-display-sm)">No gear requested yet.</p>
        <p className="mt-4 max-w-sm text-ink-muted">
          Pick something from the rental catalogue and choose your dates.
        </p>
        <Link href="/rent" className="mt-8 inline-block border-b border-ink pb-1 transition-colors hover:border-moss hover:text-moss">
          Browse rentals
        </Link>
      </div>
    );
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !/^[\d +-]{10,}$/.test(phone.trim())) {
      setError("Add your name and a phone number we can reach you on.");
      return;
    }
    const id = `RB-${500 + state.bookings.length}`;
    const booking: RentalBooking = {
      id,
      requestedAt: new Date().toISOString(),
      status: "requested",
      customerName: name.trim(),
      customerPhone: phone.trim(),
      lines,
      from: lines.reduce((min, line) => (line.from < min ? line.from : min), lines[0].from),
      to: lines.reduce((max, line) => (line.to > max ? line.to : max), lines[0].to),
      quote: null,
    };
    dispatch({ type: "booking/place", booking });
    setSubmitted(id);
  };

  return (
    <div className="mt-12 grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
      <ul className="divide-y divide-line-soft border-y border-line-soft">
        {lines.map((line) => (
          <li key={line.id} className="flex items-center gap-5 py-5">
            <div className="relative aspect-square w-20 shrink-0 overflow-hidden bg-panel">
              {line.image && <Image src={line.image} alt="" fill sizes="80px" className="object-contain p-2" />}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/rent/${line.slug}`} className="text-[0.9375rem] transition-colors hover:text-moss">
                {line.name}
              </Link>
              <p className="mt-1 text-[0.8125rem] text-ink-muted">
                {formatDate(line.from)} – {formatDate(line.to)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: "rental/remove", id: line.id })}
              className="text-[0.8125rem] text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <aside>
        <h2 className="eyebrow">Your details</h2>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-5">
          <div>
            <label htmlFor="rent-name" className="eyebrow">Name</label>
            <input
              id="rent-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full border-b border-line bg-transparent pb-2.5 outline-none transition-colors focus:border-ink"
            />
          </div>
          <div>
            <label htmlFor="rent-phone" className="eyebrow">Phone</label>
            <input
              id="rent-phone"
              value={phone}
              inputMode="tel"
              onChange={(event) => setPhone(event.target.value)}
              className="mt-2 w-full border-b border-line bg-transparent pb-2.5 outline-none transition-colors focus:border-ink"
            />
          </div>
          {error && <p role="alert" className="text-[0.875rem] text-clay">{error}</p>}
          <button type="submit" className="mt-2 bg-ink px-8 py-4 text-paper transition-colors duration-500 hover:bg-moss">
            Send request
          </button>
        </form>

        <div className="mt-8">
          <PrototypeNote>
            Rental rates are quoted by the shop, so nothing is priced here.
          </PrototypeNote>
        </div>
      </aside>
    </div>
  );
}
