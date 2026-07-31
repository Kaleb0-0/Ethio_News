import { useState } from "react";

const categories = ["All", "Politics", "Business", "Sports", "Health", "Technology", "Culture"];

interface CategoryTabsProps {
  onCategoryChange: (category: string | undefined) => void;
}

const CategoryTabs = ({ onCategoryChange }: CategoryTabsProps) => {
  const [active, setActive] = useState("All");

  const handleClick = (cat: string) => {
    setActive(cat);
    onCategoryChange(cat === "All" ? undefined : cat);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleClick(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition
            ${active === cat ? "bg-[#38bdf8] text-[#0f172a]" : "bg-[#1e293b] text-slate-400 hover:text-white hover:bg-slate-700"}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
