"use client";

import { Suspense } from "react";


import { useParams } from "next/navigation";
import { MenuManager } from "@/app/admin/restaurants/[id]/menu/page";
import OwnerGate from "../../OwnerGate";

function OwnerMenuInner() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <OwnerGate slug={slug}>
      {(auth) => (
        <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
          <MenuManager restaurantId={auth.id} backHref={`/owner/${slug}`} backLabel="← Portal Pemilik" />
        </main>
      )}
    </OwnerGate>
  );
}

export default function OwnerMenuPage() {
  return (
    <Suspense>
      <OwnerMenuInner />
    </Suspense>
  );
}
