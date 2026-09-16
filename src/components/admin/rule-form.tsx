"use client";

import { useState } from "react";
import { useStore } from "@/lib/mock/store";
import { Modal } from "@/components/ui/modal";
import { FormErrors, SelectField, TextField } from "@/components/ui/form-field";
import type { AutomationTrigger } from "@/lib/mock/types";

const FORM_ID = "new-rule-form";

export const TRIGGER_LABEL: Record<AutomationTrigger, string> = {
  "low-stock": "Stock level changes",
  "abandoned-cart": "A cart goes quiet",
  "rental-due": "A rental is due back",
  "price-drop": "A sale window opens",
  "new-order": "An order is placed",
};

const ACTIONS = [
  "Notify the shop on WhatsApp",
  "Flag it in the dashboard",
  "Message the customer",
  "Draft a supplier reorder",
];

/** Creates an automation rule. Mirrors the shape the seeded rules use. */
export function RuleForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useStore();
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<AutomationTrigger>("low-stock");
  const [action, setAction] = useState(ACTIONS[0]);
  const [errors, setErrors] = useState<string[]>([]);

  const close = () => {
    setName("");
    setTrigger("low-stock");
    setAction(ACTIONS[0]);
    setErrors([]);
    onClose();
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setErrors(["a name for the rule"]);
      return;
    }
    dispatch({
      type: "automation/add",
      rule: {
        id: `auto-${Date.now()}`,
        name: name.trim(),
        trigger,
        condition: TRIGGER_LABEL[trigger],
        action,
        enabled: true,
        runCount: 0,
        lastRunAt: null,
      },
    });
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="New rule"
      description="Rules watch the shop and act without anyone opening the dashboard."
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="border border-line px-6 py-2.5 text-[0.875rem] transition-colors hover:border-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={FORM_ID}
            className="bg-ink px-6 py-2.5 text-[0.875rem] text-paper transition-colors hover:bg-moss"
          >
            Create rule
          </button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={submit} className="flex flex-col gap-5">
        <TextField
          id="rf-name"
          label="Rule name"
          value={name}
          onChange={setName}
          placeholder="Tell me about big orders"
        />
        <SelectField
          id="rf-trigger"
          label="When"
          value={trigger}
          onChange={(value) => setTrigger(value as AutomationTrigger)}
          options={Object.entries(TRIGGER_LABEL).map(([value, label]) => ({ value, label }))}
        />
        <SelectField
          id="rf-action"
          label="Then"
          value={action}
          onChange={setAction}
          options={ACTIONS.map((value) => ({ value, label: value }))}
        />
        <FormErrors errors={errors} />
      </form>
    </Modal>
  );
}
