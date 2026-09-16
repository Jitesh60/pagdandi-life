"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart, useStore } from "@/lib/mock/store";
import { formatPrice } from "@/lib/catalog/types";
import { PrototypeNote } from "./prototype-note";
import type { Address, Order } from "@/lib/mock/types";

type Step = "address" | "delivery" | "payment";

const STEPS: { id: Step; label: string }[] = [
  { id: "address", label: "Address" },
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
];

const EMPTY: Omit<Address, "id"> = {
  fullName: "",
  line1: "",
  city: "",
  state: "Uttarakhand",
  pincode: "",
  phone: "",
};

/**
 * A simulated three-step checkout.
 *
 * Nothing is transmitted: submitting writes an order into browser storage so
 * the rest of the prototype — order history, tracking, the admin order list —
 * has something real to show.
 */
export function CheckoutView() {
  const router = useRouter();
  const { lines, subtotal, shipping, hydrated } = useCart();
  const { state, dispatch } = useStore();

  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState(EMPTY);
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<Order["paymentMethod"]>("cod");
  const [errors, setErrors] = useState<string[]>([]);

  if (hydrated && lines.length === 0) {
    return (
      <div className="mt-12 border-t border-line pt-14">
        <p className="font-display text-(length:--text-display-sm)">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-8 inline-block border-b border-ink pb-1 transition-colors hover:border-moss hover:text-moss"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  const deliveryFee = delivery === "express" ? 14900 : shipping;
  const grandTotal = subtotal + deliveryFee;

  const validate = (): boolean => {
    const missing: string[] = [];
    if (!address.fullName.trim()) missing.push("full name");
    if (!address.line1.trim()) missing.push("address");
    if (!address.city.trim()) missing.push("city");
    if (!/^\d{6}$/.test(address.pincode.trim())) missing.push("a six-digit pincode");
    if (!/^[\d +-]{10,}$/.test(address.phone.trim())) missing.push("a phone number");
    setErrors(missing);
    return missing.length === 0;
  };

  const placeOrder = () => {
    const id = `PL-${2700 + state.orders.length}`;
    const order: Order = {
      id,
      placedAt: new Date().toISOString(),
      status: "pending",
      customerName: address.fullName,
      customerEmail: state.session?.email ?? `${address.fullName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      lines,
      subtotal,
      shipping: deliveryFee,
      total: grandTotal,
      paymentMethod: payment,
      address: { ...address, id: `addr-${id}` },
    };
    dispatch({ type: "order/place", order });
    dispatch({ type: "address/add", address: order.address });
    router.push(`/account/order?id=${id}`);
  };

  return (
    <div className="mt-12 grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
      <div>
        <ol className="flex flex-wrap gap-x-8 gap-y-2 border-b border-line-soft pb-5">
          {STEPS.map((entry, index) => {
            const activeIndex = STEPS.findIndex((s) => s.id === step);
            const state_ = index === activeIndex ? "current" : index < activeIndex ? "done" : "todo";
            return (
              <li key={entry.id} className="flex items-baseline gap-2 text-[0.875rem]">
                <span className="eyebrow">{index + 1}</span>
                <span className={state_ === "todo" ? "text-ink-faint" : state_ === "current" ? "text-ink" : "text-ink-muted"}>
                  {entry.label}
                </span>
              </li>
            );
          })}
        </ol>

        {step === "address" && (
          <div className="mt-10">
            <h2 className="font-display text-(length:--text-display-sm)">Where should it go?</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <Field label="Full name" value={address.fullName} onChange={(v) => setAddress({ ...address, fullName: v })} className="sm:col-span-2" />
              <Field label="Address" value={address.line1} onChange={(v) => setAddress({ ...address, line1: v })} className="sm:col-span-2" />
              <Field label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
              <Field label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} />
              <Field label="Pincode" value={address.pincode} onChange={(v) => setAddress({ ...address, pincode: v })} inputMode="numeric" />
              <Field label="Phone" value={address.phone} onChange={(v) => setAddress({ ...address, phone: v })} inputMode="tel" />
            </div>

            {errors.length > 0 && (
              <p role="alert" className="mt-6 text-[0.875rem] text-clay">
                Please add {errors.join(", ")}.
              </p>
            )}

            <button
              type="button"
              onClick={() => validate() && setStep("delivery")}
              className="mt-9 bg-ink px-8 py-4 text-paper transition-colors duration-500 hover:bg-moss"
            >
              Continue to delivery
            </button>
          </div>
        )}

        {step === "delivery" && (
          <div className="mt-10">
            <h2 className="font-display text-(length:--text-display-sm)">How soon?</h2>
            <div className="mt-8 flex flex-col gap-3">
              <Choice
                name="delivery"
                checked={delivery === "standard"}
                onChange={() => setDelivery("standard")}
                title="Standard · 3–6 days"
                detail={shipping === 0 ? "Free on this order" : formatPrice(shipping)}
              />
              <Choice
                name="delivery"
                checked={delivery === "express"}
                onChange={() => setDelivery("express")}
                title="Express · 1–2 days"
                detail={formatPrice(14900)}
              />
            </div>
            <div className="mt-9 flex gap-4">
              <button type="button" onClick={() => setStep("address")} className="border border-line px-7 py-4 transition-colors hover:border-ink">
                Back
              </button>
              <button type="button" onClick={() => setStep("payment")} className="bg-ink px-8 py-4 text-paper transition-colors duration-500 hover:bg-moss">
                Continue to payment
              </button>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="mt-10">
            <h2 className="font-display text-(length:--text-display-sm)">How would you like to pay?</h2>
            <div className="mt-8 flex flex-col gap-3">
              <Choice name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} title="Cash on delivery" detail="Pay when it arrives" />
              <Choice name="payment" checked={payment === "upi"} onChange={() => setPayment("upi")} title="UPI" detail="Simulated — no request is sent" />
              <Choice name="payment" checked={payment === "card"} onChange={() => setPayment("card")} title="Card" detail="Simulated — no card details are collected" />
            </div>

            <div className="mt-8">
              <PrototypeNote>
                Placing this order records it in your browser so you can follow it through
                order tracking and the admin dashboard. No payment is taken.
              </PrototypeNote>
            </div>

            <div className="mt-9 flex gap-4">
              <button type="button" onClick={() => setStep("delivery")} className="border border-line px-7 py-4 transition-colors hover:border-ink">
                Back
              </button>
              <button type="button" onClick={placeOrder} className="bg-ink px-8 py-4 text-paper transition-colors duration-500 hover:bg-moss">
                Place order · {formatPrice(grandTotal)}
              </button>
            </div>
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <h2 className="eyebrow">{lines.length} items</h2>
        <ul className="mt-6 flex flex-col gap-4 border-b border-line pb-6">
          {lines.map((line) => (
            <li key={line.id} className="flex items-center gap-4">
              <div className="relative aspect-square w-14 shrink-0 overflow-hidden bg-panel">
                {line.image && <Image src={line.image} alt="" fill sizes="56px" className="object-contain p-1.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.875rem]">{line.name}</p>
                <p className="text-[0.8125rem] text-ink-muted">Qty {line.quantity}</p>
              </div>
              <p className="text-[0.875rem]">{formatPrice(line.price * line.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-6 flex flex-col gap-2.5 text-[0.9375rem]">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Delivery</dt>
            <dd>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</dd>
          </div>
          <div className="mt-3 flex justify-between border-t border-line pt-4">
            <dt>Total</dt>
            <dd className="font-display text-(length:--text-display-sm)">{formatPrice(grandTotal)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  inputMode?: "numeric" | "tel";
}) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="eyebrow">
        {label}
      </label>
      <input
        id={id}
        value={value}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border-b border-line bg-transparent pb-2.5 outline-none transition-colors focus:border-ink"
      />
    </div>
  );
}

function Choice({
  name,
  checked,
  onChange,
  title,
  detail,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  detail: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-4 border px-5 py-4 transition-colors ${
        checked ? "border-ink" : "border-line hover:border-ink-faint"
      }`}
    >
      <span>
        <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
        <span className="block text-[0.9375rem]">{title}</span>
        <span className="mt-0.5 block text-[0.8125rem] text-ink-muted">{detail}</span>
      </span>
      <span aria-hidden className={`size-3 rounded-full border ${checked ? "border-ink bg-ink" : "border-line"}`} />
    </label>
  );
}
