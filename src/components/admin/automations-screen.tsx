"use client";

import { useState } from "react";
import { useStore } from "@/lib/mock/store";
import { effectiveStock, LOW_STOCK_THRESHOLD } from "@/lib/mock/stock";
import { AdminHeading, StatusPill } from "./admin-ui";
import { StatTile } from "./stat-tile";
import { RuleForm } from "./rule-form";
import type { AutomationRule } from "@/lib/mock/types";
import type { AdminProduct } from "./products-screen";

/** Built outside the component so the clock is never read during render. */
function makeEntry(rule: AutomationRule, detail: string) {
  const now = new Date();
  return {
    id: `act-${now.getTime()}`,
    at: now.toISOString(),
    ruleId: rule.id,
    ruleName: rule.name,
    detail,
  };
}

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/**
 * Automation rules.
 *
 * "Run now" is not a canned message: each trigger evaluates the actual
 * prototype data — real low-stock items, real overdue rentals — so the log
 * reflects the state of the shop rather than placeholder text.
 */
export function AutomationsScreen({ products }: { products: AdminProduct[] }) {
  const { state, dispatch } = useStore();
  const [creating, setCreating] = useState(false);

  const enabled = state.automations.filter((rule) => rule.enabled);

  /** Evaluates a rule against current data and returns what it would report. */
  const evaluate = (rule: AutomationRule): string => {
    switch (rule.trigger) {
      case "low-stock": {
        const hits = products.filter((product) => {
          const stock = effectiveStock(product.slug, product.inStock, state.overrides[product.slug]);
          return stock < LOW_STOCK_THRESHOLD;
        });
        return hits.length === 0
          ? "No items below the threshold"
          : `${hits.length} items below ${LOW_STOCK_THRESHOLD} units, starting with ${hits[0].name}`;
      }
      case "rental-due": {
        const due = state.bookings.filter(
          (booking) => booking.status === "out" || booking.status === "overdue",
        );
        return due.length === 0
          ? "No rentals currently out"
          : `${due.length} rentals out, ${due.filter((b) => b.status === "overdue").length} overdue`;
      }
      case "abandoned-cart": {
        const lines = state.cart.length;
        return lines === 0
          ? "No active cart to remind about"
          : `Would remind about a cart holding ${lines} item${lines === 1 ? "" : "s"}`;
      }
      case "new-order": {
        const pending = state.orders.filter((order) => order.status === "pending").length;
        return `${pending} orders awaiting confirmation`;
      }
      default: {
        const onSale = products.filter((p) => state.overrides[p.slug]?.price !== undefined).length;
        return onSale === 0 ? "No scheduled price changes" : `${onSale} products have edited prices`;
      }
    }
  };

  const run = (rule: AutomationRule) => {
    dispatch({ type: "automation/run", id: rule.id, entry: makeEntry(rule, evaluate(rule)) });
  };

  return (
    <div>
      <AdminHeading
        title="Automations"
        detail="Rules that watch the shop and act without anyone opening the dashboard."
        action={
          <button
            type="button"
            onClick={() => setCreating((open) => !open)}
            className="bg-ink px-5 py-2.5 text-[0.875rem] text-paper transition-colors hover:bg-moss"
          >
            {creating ? "Cancel" : "New rule"}
          </button>
        }
      />

      <RuleForm open={creating} onClose={() => setCreating(false)} />

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <StatTile label="Active rules" value={String(enabled.length)} detail={`of ${state.automations.length}`} />
        <StatTile
          label="Actions taken"
          value={String(state.automations.reduce((sum, rule) => sum + rule.runCount, 0))}
          detail="Across all rules"
        />
        <StatTile label="Log entries" value={String(state.activity.length)} />
      </div>

      <ul className="mt-8 flex flex-col gap-4">
        {state.automations.map((rule) => (
          <li key={rule.id} className="border border-line bg-paper p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-[0.9375rem]">{rule.name}</h3>
                  <StatusPill status={rule.enabled ? "active" : "paused"} />
                </div>
                <p className="mt-2 text-[0.875rem] text-ink-muted">
                  <span className="text-ink">When</span> {rule.condition.toLowerCase()} ·{" "}
                  <span className="text-ink">then</span> {rule.action.toLowerCase()}
                </p>
                <p className="mt-2 text-[0.8125rem] text-ink-faint">
                  Run {rule.runCount} times · last {timeAgo(rule.lastRunAt)}
                </p>
              </div>

              <div className="flex shrink-0 gap-2.5">
                <button
                  type="button"
                  onClick={() => run(rule)}
                  disabled={!rule.enabled}
                  className="border border-line px-4 py-2 text-[0.8125rem] transition-colors hover:border-ink disabled:cursor-not-allowed disabled:text-ink-faint"
                >
                  Run now
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "automation/toggle", id: rule.id })}
                  aria-pressed={rule.enabled}
                  className={`px-4 py-2 text-[0.8125rem] transition-colors ${
                    rule.enabled
                      ? "bg-ink text-paper hover:bg-moss"
                      : "border border-line hover:border-ink"
                  }`}
                >
                  {rule.enabled ? "On" : "Off"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-12">
        <h2 className="text-[0.9375rem]">Activity</h2>
        <p className="mt-1.5 text-[0.8125rem] text-ink-muted">
          What the rules have done, newest first.
        </p>
        <ul className="mt-5 divide-y divide-line-soft border-y border-line-soft">
          {state.activity.slice(0, 20).map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5">
              <span className="text-[0.875rem]">
                <span className="text-ink-muted">{entry.ruleName}</span> — {entry.detail}
              </span>
              <span className="text-[0.8125rem] text-ink-faint">{timeAgo(entry.at)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
