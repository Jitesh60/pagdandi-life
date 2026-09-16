import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { PrototypeNote } from "@/components/commerce/prototype-note";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · PagdandiLife Admin" },
  robots: { index: false, follow: false },
};

/**
 * Dashboard chrome: a fixed sidebar and a working column.
 *
 * Deliberately separate from the storefront layout — no smooth scroll, no
 * editorial header, and a denser type scale, because this is a tool rather
 * than a shop window.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="shrink-0 border-b border-line bg-paper-alt px-6 py-7 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
        <AdminNav />
      </aside>

      <main className="min-w-0 flex-1 px-6 py-8 lg:px-10 lg:py-10">
        <div className="mb-8 max-w-3xl">
          <PrototypeNote>
            Every figure below is sample data generated in your browser. Edits persist
            locally and never reach a server.
          </PrototypeNote>
        </div>
        {children}
      </main>
    </div>
  );
}
