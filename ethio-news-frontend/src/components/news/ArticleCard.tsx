import { type Article } from "../../types/articles";

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
  featured?: boolean;
  lang?: "eng" | "amh";
}

const ArticleCard = ({ article, onClick, featured = false, lang = "eng" }: ArticleCardProps) => {
  const time = new Date(article.pubDate).toLocaleTimeString(lang === "eng" ? "en-US" : "am-ET", { hour: "2-digit", minute: "2-digit" });

  if (featured) {
    return (
      <div onClick={() => onClick(article)} className="cursor-pointer group border-b border-slate-700 pb-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {article.imageUrl && (
            <div className="w-full md:w-1/2 h-64 overflow-hidden">
              <img src={article.imageUrl} alt={article.headline} className="w-full h-full object-cover group-hover:opacity-90 transition" />
            </div>
          )}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex gap-2 mb-2">
              {article.category?.map((cat: string) => (
                <span key={cat} className="text-xs text-[#38bdf8] uppercase font-semibold tracking-wide">
                  {cat}
                </span>
              ))}
            </div>
            <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight group-hover:text-[#38bdf8] transition mb-3">{article.headline || article.title}</h2>
            <ul className="space-y-1 mb-3">
              {article.summary?.slice(0, 3).map((point: string, i: number) => (
                <li key={i} className="text-slate-400 text-sm flex gap-2">
                  <span className="text-[#38bdf8]">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <span className="text-slate-600 text-xs">{time}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => onClick(article)} className="cursor-pointer group flex gap-4 border-b border-slate-800 py-4 hover:bg-slate-800/30 px-2 transition">
      {/* Text */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex gap-2 mb-1">
            {article.category?.map((cat: string) => (
              <span key={cat} className="text-xs text-[#38bdf8] uppercase font-semibold tracking-wide">
                {cat}
              </span>
            ))}
          </div>
          <h3 className="text-white font-semibold text-base leading-snug group-hover:text-[#38bdf8] transition line-clamp-2">{article.headline || article.title}</h3>
          <p className="text-slate-500 text-sm mt-1 line-clamp-1">{article.summary?.[0]}</p>
        </div>
        <span className="text-slate-600 text-xs mt-2">{time}</span>
      </div>

      {/* Thumbnail */}
      {article.imageUrl && (
        <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
          <img src={article.imageUrl} alt={article.headline} className="w-full h-full object-cover group-hover:opacity-90 transition" />
        </div>
      )}
    </div>
  );
};

export default ArticleCard;
