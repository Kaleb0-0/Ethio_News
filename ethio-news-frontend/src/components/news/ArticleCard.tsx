import { type Article } from "../../types/articles";

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
}

const ArticleCard = ({ article, onClick }: ArticleCardProps) => {
  return (
    <div onClick={() => onClick(article)} className="bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-700 hover:border-[#38bdf8] transition cursor-pointer group">
      {/* Image */}
      <div className="w-full h-48 bg-[#0f172a] overflow-hidden">
        {article.imageUrl ? (
          <img src={article.imageUrl} alt={article.headline} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-slate-600 text-sm">No image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        {/* Categories */}
        <div className="flex gap-2 flex-wrap">
          {article.category?.map((cat: string) => (
            <span key={cat} className="text-xs bg-[#0f172a] text-[#38bdf8] px-2 py-0.5 rounded-full border border-slate-700">
              {cat}
            </span>
          ))}
        </div>

        {/* Headline */}
        <h3 className="text-white font-semibold text-base leading-snug group-hover:text-[#38bdf8] transition line-clamp-2">{article.headline || article.title}</h3>

        {/* Summary bullets */}
        <ul className="text-slate-400 text-sm space-y-1">
          {article.summary?.slice(0, 2).map((point: string, i: number) => (
            <li key={i} className="flex gap-2">
              <span className="text-[#38bdf8] mt-0.5">•</span>
              <span className="line-clamp-1">{point}</span>
            </li>
          ))}
        </ul>

        {/* Date */}
        <p className="text-slate-600 text-xs mt-1">
          {new Date(article.pubDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

export default ArticleCard;
