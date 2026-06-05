import { RoomImageCard } from "./RoomImageCard";
import type { RoomImage } from "./types";

type Props = {
  items: RoomImage[];
  onRemoveItem: (id: string) => void;
  onRequeueItem: (id: string) => void;
};

export function QueueGallery({ items, onRemoveItem, onRequeueItem }: Props) {
  return (
    <section className="min-h-[520px] rounded-lg border border-[#d9d7cd] bg-[#ededdf] p-3 sm:p-4">
      {items.length === 0 ? (
        <div className="flex h-full min-h-[480px] items-center justify-center rounded-md border border-dashed border-[#bbb7a8] bg-[#f7f7f3] p-8 text-center text-[#626158]">
          <p className="max-w-sm text-base leading-7">Upload a furnished room photo to start the before and after queue.</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <RoomImageCard key={item.id} item={item} onRemove={onRemoveItem} onRequeue={onRequeueItem} />
          ))}
        </div>
      )}
    </section>
  );
}
