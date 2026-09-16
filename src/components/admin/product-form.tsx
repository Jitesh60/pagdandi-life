"use client";

import { useState } from "react";
import { CURATED_CATEGORIES } from "@/lib/catalog/categories";
import { useStore } from "@/lib/mock/store";
import { slugify } from "@/lib/mock/custom-products";
import { Modal } from "@/components/ui/modal";
import { FormErrors, SelectField, TextArea, TextField } from "@/components/ui/form-field";
import type { CustomProduct } from "@/lib/mock/types";

const FORM_ID = "new-product-form";

const EMPTY = {
  name: "",
  price: "",
  compareAtPrice: "",
  categoryId: CURATED_CATEGORIES[0].id,
  stock: "10",
  imageUrl: "",
  description: "",
};

/**
 * Creates a product from the dashboard.
 *
 * Prices are entered in rupees and stored as paise, matching the rest of the
 * catalogue. The new product appears in the storefront listings immediately —
 * it is merged in on the client, since the committed snapshot is read-only.
 */
export function ProductForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useStore();
  const [draft, setDraft] = useState(EMPTY);
  const [errors, setErrors] = useState<string[]>([]);

  const set = (key: keyof typeof EMPTY) => (value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const close = () => {
    setDraft(EMPTY);
    setErrors([]);
    onClose();
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const problems: string[] = [];
    const price = Number(draft.price);
    const compare = draft.compareAtPrice ? Number(draft.compareAtPrice) : null;
    const stock = Number(draft.stock);

    if (!draft.name.trim()) problems.push("a name");
    if (!Number.isFinite(price) || price <= 0) problems.push("a price above zero");
    if (compare !== null && (!Number.isFinite(compare) || compare <= price)) {
      problems.push("a compare-at price higher than the price");
    }
    if (!Number.isFinite(stock) || stock < 0) problems.push("a stock figure");
    if (draft.imageUrl && !/^https?:\/\//i.test(draft.imageUrl.trim())) {
      problems.push("an image URL starting with http");
    }

    setErrors(problems);
    if (problems.length > 0) return;

    const product: CustomProduct = {
      slug: slugify(draft.name),
      name: draft.name.trim(),
      price: Math.round(price * 100),
      compareAtPrice: compare === null ? null : Math.round(compare * 100),
      imageUrl: draft.imageUrl.trim() || null,
      categoryId: draft.categoryId,
      stock: Math.round(stock),
      description: draft.description.trim(),
      createdAt: new Date().toISOString(),
      hidden: false,
    };

    dispatch({ type: "product/create", product });
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title="New product"
      description="Added products appear in the shop and their category straight away."
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
            Add product
          </button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={submit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="pf-name"
            label="Name"
            value={draft.name}
            onChange={set("name")}
            placeholder="Kumaon Trail Flask 1L"
            className="sm:col-span-2"
          />
          <TextField
            id="pf-price"
            label="Price"
            prefix="₹"
            inputMode="numeric"
            value={draft.price}
            onChange={set("price")}
            placeholder="899"
          />
          <TextField
            id="pf-compare-at-price"
            label="Compare-at price"
            hint="optional"
            prefix="₹"
            inputMode="numeric"
            value={draft.compareAtPrice}
            onChange={set("compareAtPrice")}
            placeholder="1299"
          />
          <SelectField
            id="pf-category"
            label="Category"
            value={draft.categoryId}
            onChange={set("categoryId")}
            options={CURATED_CATEGORIES.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
          />
          <TextField
            id="pf-stock"
            label="Stock"
            inputMode="numeric"
            value={draft.stock}
            onChange={set("stock")}
          />
          <TextField
            id="pf-image-url"
            label="Image URL"
            hint="optional"
            value={draft.imageUrl}
            onChange={set("imageUrl")}
            placeholder="https://…"
            className="sm:col-span-2"
          />
          <TextArea
            id="pf-description"
            label="Description"
            hint="optional"
            value={draft.description}
            onChange={set("description")}
            className="sm:col-span-2"
          />
        </div>

        <FormErrors errors={errors} />
      </form>
    </Modal>
  );
}
