import { Camera, Info } from "lucide-react";
import { NavLink } from "react-router-dom";

const navLinkBase =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition";
const logoUrl = `${import.meta.env.BASE_URL}empty-room-logo.webp`;

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
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d9d7cd] bg-white shadow-sm transition group-hover:border-[#24505c]">
            <img alt="" aria-hidden="true" className="h-full w-full object-cover" src={logoUrl} />
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
