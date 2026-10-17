import { Suspense } from "react";
import RestaurantView, { PageStatus } from "../RestaurantView";

export default function RestaurantMenuPage() {
  return (
    <Suspense fallback={<PageStatus loading />}>
      <RestaurantView mode="menu" />
    </Suspense>
  );
}
