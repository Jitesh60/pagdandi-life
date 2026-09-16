"use client";

import { useState } from "react";
import { useStore } from "@/lib/mock/store";
import { formatPrice } from "@/lib/catalog/types";
import { AdminHeading, FilterChips, InlineNumber, StatusPill, TableWrap, Td, Th } from "./admin-ui";
import type { BookingStatus } from "@/lib/mock/types";

const STATUSES: BookingStatus[] = ["requested", "confirmed", "out", "returned", "overdue"];

function formatDay(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** Days until return; negative means the item is late back. */
function daysLeft(to: string): number {
  return Math.round((new Date(to).getTime() - Date.now()) / 86_400_000);
}

export function RentalsScreen() {
  const { state, dispatch } = useStore();
  const [filter, setFilter] = useState("all");

  const visible =
    filter === "all" ? state.bookings : state.bookings.filter((b) => b.status === filter);

  return (
    <div>
      <AdminHeading
        title="Rentals"
        detail={`${state.bookings.length} bookings · ${state.bookings.filter((b) => b.status === "requested").length} awaiting a quote`}
      />

      <div className="mt-6">
        <FilterChips options={["all", ...STATUSES]} value={filter} onChange={setFilter} />
      </div>

      <TableWrap>
        <thead>
          <tr>
            <Th>Booking</Th>
            <Th>Customer</Th>
            <Th>Gear</Th>
            <Th>Dates</Th>
            <Th>Status</Th>
            <Th align="right">Quote</Th>
            <Th>Move to</Th>
          </tr>
        </thead>
        <tbody>
          {visible.map((booking) => {
            const left = daysLeft(booking.to);
            return (
              <tr key={booking.id} className="transition-colors hover:bg-paper-alt">
                <Td>{booking.id}</Td>
                <Td>
                  {booking.customerName}
                  <span className="block text-[0.8125rem] text-ink-muted">{booking.customerPhone}</span>
                </Td>
                <Td>
                  {booking.lines.map((line) => (
                    <span key={line.id} className="block truncate">
                      {line.name}
                    </span>
                  ))}
                </Td>
                <Td>
                  {formatDay(booking.from)} – {formatDay(booking.to)}
                  {booking.status === "out" && (
                    <span className={`block text-[0.8125rem] ${left < 0 ? "text-clay" : "text-ink-muted"}`}>
                      {left < 0 ? `${Math.abs(left)} days overdue` : `${left} days left`}
                    </span>
                  )}
                </Td>
                <Td><StatusPill status={booking.status} /></Td>
                <Td align="right">
                  {booking.quote === null ? (
                    <span className="text-ink-muted">Not quoted</span>
                  ) : (
                    <InlineNumber
                      value={Math.round(booking.quote / 100)}
                      prefix="₹"
                      onCommit={() => {
                        /* Quotes are illustrative in the prototype. */
                      }}
                    />
                  )}
                </Td>
                <Td>
                  <select
                    value={booking.status}
                    onChange={(event) =>
                      dispatch({
                        type: "booking/status",
                        id: booking.id,
                        status: event.target.value as BookingStatus,
                      })
                    }
                    aria-label={`Change status of ${booking.id}`}
                    className="border-b border-line bg-transparent py-1 text-[0.8125rem] capitalize outline-none transition-colors focus:border-ink"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>

      <p className="mt-6 text-[0.8125rem] text-ink-muted">
        Rental rates are quoted by the shop, so totals here are illustrative —{" "}
        {formatPrice(
          state.bookings.reduce((sum, booking) => sum + (booking.quote ?? 0), 0),
        )}{" "}
        across all quoted bookings.
      </p>
    </div>
  );
}
