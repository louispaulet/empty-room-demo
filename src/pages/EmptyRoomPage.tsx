import { EmptyRoomStudio } from "../features/empty-room/EmptyRoomStudio";

export function EmptyRoomPage() {
  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#7a3f2a]">Empty Room Studio</p>
        <h1 className="mt-2 max-w-4xl text-3xl font-semibold tracking-normal text-[#1d1d1b] sm:text-4xl">
          Clear room photos down to walls, floors, and windows.
        </h1>
      </div>
      <EmptyRoomStudio />
    </section>
  );
}
