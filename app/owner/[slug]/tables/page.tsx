"use client";

import { useParams } from "next/navigation";
import { TablesManager } from "@/app/admin/restaurants/[id]/tables/page";
import OwnerGate from "../../OwnerGate";

export default function OwnerTablesPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <OwnerGate slug={slug}>
      {(auth) => (
        <main className="mx-auto w-full max-w-4xl px-4 py-8">
          <TablesManager restaurantId={auth.id} backHref={`/owner/${slug}`} backLabel="← Portal Owner" />
        </main>
      )}
    </OwnerGate>
  );
}
