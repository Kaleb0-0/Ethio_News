import { useState } from "react";

const categoriesEng = ["All", "Politics", "Business", "Sports", "Health", "Technology", "Culture"];
const categoriesAmh = ["ሁሉም", "ፖለቲካ", "ቢዝነስ", "ስፖርት", "ጤና", "ቴክኖሎጂ", "ባህል"];

const categoryValues = [undefined, "Politics", "Business", "Sports", "Health", "Technology", "Culture"];

interface CategoryTabsProps {
  onCategoryChange: (category: string | undefined) => void;
  lang: "eng" | "amh";
}

const CategoryTabs = ({ onCategoryChange, lang }: CategoryTabsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const categories = lang === "eng" ? categoriesEng : categoriesAmh;

  const handleClick = (index: number) => {
    setActiveIndex(index);
    onCategoryChange(categoryValues[index]);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat, index) => (
        <button
          key={index}
          onClick={() => handleClick(index)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition
            ${activeIndex === index ? "bg-[#38bdf8] text-[#0f172a]" : "bg-[#1e293b] text-slate-400 hover:text-white hover:bg-slate-700"}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
