export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-10" aria-busy="true" aria-label="Memuat">
      <div className="skeleton mx-auto h-20 w-20 !rounded-full" />
      <div className="skeleton mx-auto h-7 w-2/3" />
      <div className="skeleton h-24 w-full" />
      <div className="skeleton h-24 w-full" />
      <div className="skeleton h-24 w-full" />
    </main>
  );
}
