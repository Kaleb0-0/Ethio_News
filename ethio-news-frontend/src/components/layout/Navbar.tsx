import { Bell, User } from "lucide-react";
import { useState } from "react";
import UserDropdown from "../ui/UserDropdown";
import { Link } from "react-router-dom";

interface NavbarProps {
  isLoggedIn: boolean;
  onSignInClick: () => void;
  lang: "eng" | "amh";
  onLangChange: (lang: "eng" | "amh") => void;
}

const Navbar = ({ isLoggedIn, onSignInClick, lang, onLangChange }: NavbarProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 bg-[#0f172a] border-b border-slate-700 px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <span className="text-[#38bdf8] font-bold text-xl">Ethio</span>
        <span className="text-white font-bold text-xl">News</span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Language toggle — always visible */}
        <button
          onClick={() => onLangChange(lang === "eng" ? "amh" : "eng")}
          className="text-sm px-3 py-1 rounded-full border border-slate-600 text-slate-300 hover:border-[#38bdf8] hover:text-[#38bdf8] transition"
        >
          {lang === "eng" ? "🇪🇹 አማርኛ" : "🇬🇧 English"}
        </button>

        {isLoggedIn ? (
          <>
            <button className="text-slate-300 hover:text-[#38bdf8] transition">
              <Bell size={20} />
            </button>
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="text-slate-300 hover:text-[#38bdf8] transition">
                <User size={20} />
              </button>
              {dropdownOpen && <UserDropdown onClose={() => setDropdownOpen(false)} lang={lang} onLangChange={onLangChange} />}
            </div>
          </>
        ) : (
          <button onClick={onSignInClick} className="bg-[#38bdf8] text-[#0f172a] px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-sky-400 transition">
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
