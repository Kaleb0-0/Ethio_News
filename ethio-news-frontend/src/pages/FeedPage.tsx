import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import CategoryTabs from "../components/news/CategoryTabs";
import ArticleCard from "../components/news/ArticleCard";
import { useArticles } from "../hooks/useArticles";
import { type Article } from "../types/articles";

const FeedPage = () => {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // check if user is logged in
  const isLoggedIn = !!localStorage.getItem("token");
  const [lang, setLang] = useState<"eng" | "amh">("eng");

  const { data: articles, isLoading, error, refresh } = useArticles(category, lang);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Navbar */}
      <Navbar isLoggedIn={isLoggedIn} onSignInClick={() => (window.location.href = "/signin")} lang={lang} onLangChange={setLang} />

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Header row */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-white">
            Today's News
            <span className="text-slate-500 text-sm font-normal ml-2">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          </h1>
        </div>

        {/* Category tabs */}
        <div className="mb-6">
          <CategoryTabs onCategoryChange={setCategory} />
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#38bdf8]" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-20 text-red-400">
            Failed to load articles.{" "}
            <button onClick={refresh} className="underline">
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && articles?.length === 0 && <div className="text-center py-20 text-slate-500">No articles found for today yet. Check back soon.</div>}

        {/* Articles grid */}
        {!isLoading && articles && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article: Article) => (
              <ArticleCard key={article.id} article={article} onClick={setSelectedArticle} />
            ))}
          </div>
        )}
      </main>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedArticle(null)}>
          <div className="bg-[#1e293b] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 border border-slate-700" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button onClick={() => setSelectedArticle(null)} className="float-right text-slate-400 hover:text-white text-xl">
              ✕
            </button>

            {/* Categories */}
            <div className="flex gap-2 flex-wrap mb-3">
              {selectedArticle.category?.map((cat: string) => (
                <span key={cat} className="text-xs bg-[#0f172a] text-[#38bdf8] px-2 py-0.5 rounded-full border border-slate-700">
                  {cat}
                </span>
              ))}
            </div>

            {/* Headline */}
            <h2 className="text-white text-xl font-bold mb-4">{selectedArticle.headline || selectedArticle.title}</h2>

            {/* Image */}
            {selectedArticle.imageUrl && <img src={selectedArticle.imageUrl} alt={selectedArticle.headline} className="w-full h-52 object-cover rounded-xl mb-4" />}

            {/* Summary */}
            <div className="mb-6">
              <h3 className="text-[#38bdf8] text-sm font-semibold mb-2">Summary</h3>
              <ul className="space-y-2">
                {selectedArticle.summary?.map((point: string, i: number) => (
                  <li key={i} className="flex gap-2 text-slate-300 text-sm">
                    <span className="text-[#38bdf8] mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Raw content */}
            <details className="mb-6">
              <summary className="text-slate-500 text-sm cursor-pointer hover:text-slate-300 transition">Show original content</summary>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed border-t border-slate-700 pt-3">{selectedArticle.raw}</p>
            </details>

            {/* Read original button */}
            <a
              href={selectedArticle.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-[#38bdf8] text-[#0f172a] py-2.5 rounded-full font-semibold hover:bg-sky-400 transition"
            >
              Read Original Article →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
