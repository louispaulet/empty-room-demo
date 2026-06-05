import { Camera, Info } from "lucide-react";
import { NavLink } from "react-router-dom";

const navLinkBase =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition";

function linkClassName({ isActive }: { isActive: boolean }) {
  return isActive
    ? `${navLinkBase} bg-[#24505c] text-white shadow-sm`
    : `${navLinkBase} text-[#393832] hover:bg-white hover:text-[#24505c]`;
}

export function Navbar() {
  return (
    <header className="border-b border-[#d9d7cd] pb-5">
      <nav className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <NavLink className="group inline-flex items-center gap-3" to="/">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dde8ea] text-[#24505c] transition group-hover:bg-[#24505c] group-hover:text-white">
            <Camera aria-hidden="true" size={22} />
          </span>
          <span>
            <span className="block text-sm font-medium uppercase tracking-[0.18em] text-[#7a3f2a]">
              Empty Room Studio
            </span>
            <span className="block text-lg font-semibold text-[#1d1d1b]">Room clearing demo</span>
          </span>
        </NavLink>

        <div className="flex flex-wrap gap-2">
          <NavLink className={linkClassName} end to="/">
            <Camera aria-hidden="true" size={16} />
            Studio
          </NavLink>
          <NavLink className={linkClassName} to="/about">
            <Info aria-hidden="true" size={16} />
            About
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
