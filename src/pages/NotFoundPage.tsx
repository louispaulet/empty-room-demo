import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="rounded-2xl border border-[#d9d7cd] bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#7a3f2a]">Nothing here</p>
      <h1 className="mt-3 text-3xl font-semibold text-[#1d1d1b]">This room is already empty.</h1>
      <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[#626158]">
        The page you requested does not exist in this demo.
      </p>
      <Link
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[#24505c] px-5 font-semibold text-white shadow-sm"
        to="/"
      >
        Back to the studio
      </Link>
    </section>
  );
}
