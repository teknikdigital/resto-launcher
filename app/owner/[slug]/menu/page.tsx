"use client";

import { useParams } from "next/navigation";
import { MenuManager } from "@/app/admin/restaurants/[id]/menu/page";
import OwnerGate from "../../OwnerGate";

export default function OwnerMenuPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <OwnerGate slug={slug}>
      {(auth) => (
        <main className="mx-auto w-full max-w-4xl px-4 py-8">
          <MenuManager restaurantId={auth.id} backHref={`/owner/${slug}`} backLabel="← Portal Owner" />
        </main>
      )}
    </OwnerGate>
  );
}
