import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#20201d]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <Navbar />
        <main className="flex-1 py-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
