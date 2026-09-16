"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/mock/store";
import { formatPrice } from "@/lib/catalog/types";
import { ORDER_STATUSES } from "@/lib/mock/types";
import { SignIn } from "./sign-in";
import type { Order, OrderStatus } from "@/lib/mock/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Orders belonging to the signed-in visitor, newest first. */
function useMyOrders(): Order[] {
  const { state } = useStore();
  if (!state.session) return [];
  return state.orders.filter((order) => order.customerEmail === state.session?.email);
}

export function AccountOverview() {
  const { state } = useStore();
  const orders = useMyOrders();

  if (!state.session) return <SignIn />;

  const spent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="mt-12">
      <h2 className="font-display text-(length:--text-display-md)">
        Hello, {state.session.name.split(" ")[0]}.
      </h2>
      <p className="mt-3 text-ink-muted">{state.session.email}</p>

      <dl className="mt-12 grid gap-10 border-t border-line pt-10 sm:grid-cols-3">
        <div>
          <dt className="eyebrow">Orders</dt>
          <dd className="mt-3 font-display text-(length:--text-display-sm)">{orders.length}</dd>
        </div>
        <div>
          <dt className="eyebrow">Spent</dt>
          <dd className="mt-3 font-display text-(length:--text-display-sm)">{formatPrice(spent)}</dd>
        </div>
        <div>
          <dt className="eyebrow">Saved items</dt>
          <dd className="mt-3 font-display text-(length:--text-display-sm)">{state.wishlist.length}</dd>
        </div>
      </dl>

      {orders.length > 0 && (
        <div className="mt-14">
          <div className="flex items-baseline justify-between">
            <h3 className="eyebrow">Recent orders</h3>
            <Link href="/account/orders" className="text-[0.8125rem] text-ink-muted transition-colors hover:text-ink">
              All orders
            </Link>
          </div>
          <OrderTable orders={orders.slice(0, 5)} />
        </div>
      )}
    </div>
  );
}

export function OrderTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="mt-8 border-t border-line pt-12">
        <p className="font-display text-(length:--text-display-sm)">No orders yet.</p>
        <Link href="/shop" className="mt-6 inline-block border-b border-ink pb-1 transition-colors hover:border-moss hover:text-moss">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-line-soft border-y border-line-soft">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/account/order?id=${order.id}`}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5 transition-colors hover:text-moss"
          >
            <span className="flex items-baseline gap-4">
              <span className="text-[0.9375rem]">{order.id}</span>
              <span className="text-[0.8125rem] text-ink-muted">{formatDate(order.placedAt)}</span>
            </span>
            <span className="flex items-baseline gap-5">
              <span className="text-[0.8125rem] text-ink-muted">{STATUS_LABEL[order.status]}</span>
              <span className="text-[0.9375rem]">{formatPrice(order.total)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function OrderList() {
  const { state } = useStore();
  const orders = useMyOrders();
  if (!state.session) return <SignIn />;
  return (
    <div className="mt-12">
      <h2 className="font-display text-(length:--text-display-md)">Your orders</h2>
      <OrderTable orders={orders} />
    </div>
  );
}

/** Progress through the fulfilment stages, cancelled handled separately. */
const TRACK: OrderStatus[] = ["pending", "confirmed", "packed", "shipped", "delivered"];

export function OrderDetail() {
  const params = useSearchParams();
  const id = params.get("id");
  const { state } = useStore();
  const order = state.orders.find((candidate) => candidate.id === id);

  if (!order) {
    return (
      <div className="mt-12 border-t border-line pt-14">
        <p className="font-display text-(length:--text-display-sm)">Order not found.</p>
        <p className="mt-4 max-w-sm text-ink-muted">
          {id ? `Nothing here matches ${id}.` : "No order was specified."}
        </p>
        <Link href="/account/orders" className="mt-8 inline-block border-b border-ink pb-1 transition-colors hover:border-moss hover:text-moss">
          Back to orders
        </Link>
      </div>
    );
  }

  const stageIndex = TRACK.indexOf(order.status);

  return (
    <div className="mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="font-display text-(length:--text-display-md)">{order.id}</h2>
        <p className="text-ink-muted">Placed {formatDate(order.placedAt)}</p>
      </div>

      {order.status === "cancelled" ? (
        <p className="mt-10 border-y border-line py-5 text-clay">This order was cancelled.</p>
      ) : (
        <ol className="mt-10 grid gap-3 border-y border-line py-6 sm:grid-cols-5">
          {TRACK.map((stage, index) => {
            const reached = index <= stageIndex;
            return (
              <li key={stage} className="flex items-center gap-3 sm:flex-col sm:items-start">
                <span aria-hidden className={`h-0.5 w-8 sm:w-full ${reached ? "bg-moss" : "bg-line"}`} />
                <span className={`text-[0.8125rem] ${reached ? "text-ink" : "text-ink-faint"}`}>
                  {STATUS_LABEL[stage]}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
        <ul className="divide-y divide-line-soft border-y border-line-soft">
          {order.lines.map((line) => (
            <li key={line.id} className="flex items-center gap-5 py-5">
              <div className="relative aspect-square w-16 shrink-0 overflow-hidden bg-panel">
                {line.image && <Image src={line.image} alt="" fill sizes="64px" className="object-contain p-1.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/p/${line.slug}`} className="text-[0.9375rem] transition-colors hover:text-moss">
                  {line.name}
                </Link>
                <p className="text-[0.8125rem] text-ink-muted">Qty {line.quantity}</p>
              </div>
              <p className="text-[0.9375rem]">{formatPrice(line.price * line.quantity)}</p>
            </li>
          ))}
        </ul>

        <aside>
          <h3 className="eyebrow">Delivering to</h3>
          <address className="mt-4 not-italic text-ink-muted">
            {order.address.fullName}
            <br />
            {order.address.line1}
            <br />
            {order.address.city}, {order.address.state} {order.address.pincode}
            <br />
            {order.address.phone}
          </address>

          <dl className="mt-10 flex flex-col gap-2.5 border-t border-line pt-6 text-[0.9375rem]">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Delivery</dt>
              <dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Payment</dt>
              <dd className="uppercase">{order.paymentMethod}</dd>
            </div>
            <div className="mt-3 flex justify-between border-t border-line pt-4">
              <dt>Total</dt>
              <dd className="font-display text-(length:--text-display-sm)">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

export function AddressBook() {
  const { state } = useStore();
  if (!state.session) return <SignIn />;

  return (
    <div className="mt-12">
      <h2 className="font-display text-(length:--text-display-md)">Addresses</h2>
      {state.addresses.length === 0 ? (
        <p className="mt-6 max-w-sm text-ink-muted">
          No addresses saved yet. One is kept automatically the first time you check out.
        </p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {state.addresses.map((address) => (
            <li key={address.id} className="border border-line p-6">
              <p className="text-[0.9375rem]">{address.fullName}</p>
              <address className="mt-2 not-italic text-[0.875rem] text-ink-muted">
                {address.line1}
                <br />
                {address.city}, {address.state} {address.pincode}
                <br />
                {address.phone}
              </address>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { ORDER_STATUSES, STATUS_LABEL };
