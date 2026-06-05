export function Footer() {
  return (
    <footer className="mt-8 border-t border-[#d9d7cd] py-5 text-sm text-[#626158]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>Empty Room Studio keeps API keys in the Worker, never the browser.</p>
        <p className="font-medium text-[#24505c]">Static Vite app + Cloudflare Worker</p>
      </div>
    </footer>
  );
}
