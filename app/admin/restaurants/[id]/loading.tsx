export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-3 px-4 py-10" aria-busy="true" aria-label="Memuat">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton h-40 w-full" />
      <div className="skeleton h-14 w-full" />
      <div className="skeleton h-14 w-full" />
    </main>
  );
}
