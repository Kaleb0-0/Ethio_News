import { ChevronRight, Globe, LogOut, Bell, BellOff } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface UserDropdownProps {
  onClose: () => void;
  lang: "eng" | "amh";
  onLangChange: (lang: "eng" | "amh") => void;
}

const UserDropdown = ({ onClose, lang, onLangChange }: UserDropdownProps) => {
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 mt-2 w-52 bg-[#1e293b] border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
      {/* Email */}
      <div className="px-4 py-3 border-b border-slate-700">
        <p className="text-slate-400 text-xs">Signed in as</p>
        <p className="text-white text-sm font-medium truncate">user@email.com</p>
      </div>

      {/* Language submenu */}
      <div className="relative">
        <button
          onClick={() => {
            setLangOpen(!langOpen);
            setNotifOpen(false);
          }}
          className="w-full flex items-center justify-between px-4 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white transition text-sm"
        >
          <span className="flex items-center gap-2">
            <Globe size={15} />
            Language
          </span>
          <ChevronRight size={15} className={`transition ${langOpen ? "rotate-90" : ""}`} />
        </button>

        {langOpen && (
          <div className="bg-[#0f172a] border-t border-slate-700">
            <button
              onClick={() => {
                onLangChange("eng");
                onClose();
              }}
              className={`w-full text-left px-8 py-2 text-sm hover:bg-slate-700 transition
    ${lang === "eng" ? "text-[#38bdf8]" : "text-slate-300 hover:text-white"}`}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => {
                onLangChange("amh");
                onClose();
              }}
              className={`w-full text-left px-8 py-2 text-sm hover:bg-slate-700 transition
    ${lang === "amh" ? "text-[#38bdf8]" : "text-slate-300 hover:text-white"}`}
            >
              🇪🇹 አማርኛ
            </button>
          </div>
        )}
      </div>

      {/* Notifications submenu */}
      <div className="relative">
        <button
          onClick={() => {
            setNotifOpen(!notifOpen);
            setLangOpen(false);
          }}
          className="w-full flex items-center justify-between px-4 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white transition text-sm"
        >
          <span className="flex items-center gap-2">
            <Bell size={15} />
            Notifications
          </span>
          <ChevronRight size={15} className={`transition ${notifOpen ? "rotate-90" : ""}`} />
        </button>

        {notifOpen && (
          <div className="bg-[#0f172a] border-t border-slate-700">
            <button className="w-full text-left px-8 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition flex items-center gap-2">
              <Bell size={13} /> Enable
            </button>
            <button className="w-full text-left px-8 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition flex items-center gap-2">
              <BellOff size={13} /> Disable
            </button>
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="border-t border-slate-700">
        <button className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-slate-700 hover:text-red-300 transition text-sm">
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;
