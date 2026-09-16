"use client";

import { useState } from "react";
import { useStore } from "@/lib/mock/store";
import { formatPrice } from "@/lib/catalog/types";
import { AdminHeading, TableWrap, Td, Th } from "./admin-ui";

export function CustomersScreen() {
  const { state } = useStore();
  const [query, setQuery] = useState("");

  const term = query.trim().toLowerCase();
  const visible = term
    ? state.customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(term) ||
          customer.email.toLowerCase().includes(term),
      )
    : state.customers;

  const sorted = [...visible].sort((a, b) => b.lifetimeValue - a.lifetimeValue);

  return (
    <div>
      <AdminHeading title="Customers" detail={`${state.customers.length} on file`} />

      <label htmlFor="customer-search" className="sr-only">
        Search customers
      </label>
      <input
        id="customer-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name or email"
        className="mt-6 w-full max-w-sm border-b border-line bg-transparent pb-2.5 outline-none transition-colors placeholder:text-ink-faint focus:border-ink"
      />

      <TableWrap>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Phone</Th>
            <Th align="right">Orders</Th>
            <Th align="right">Lifetime value</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((customer) => (
            <tr key={customer.id} className="transition-colors hover:bg-paper-alt">
              <Td>{customer.name}</Td>
              <Td className="text-ink-muted">{customer.email}</Td>
              <Td className="text-ink-muted">{customer.phone}</Td>
              <Td align="right">{customer.orderCount}</Td>
              <Td align="right">{formatPrice(customer.lifetimeValue)}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      {sorted.length === 0 && (
        <p className="mt-8 text-ink-muted">No customer matches “{query}”.</p>
      )}
    </div>
  );
}
