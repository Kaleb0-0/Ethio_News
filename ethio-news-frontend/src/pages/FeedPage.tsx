// FeedPage.tsx - just handles lang loading

import { useEffect, useRef, useState } from "react";
import type { Article } from "../types/articles";
import { useArticles } from "../hooks/useArticles";
import Navbar from "../components/layout/Navbar";
import CategoryTabs from "../components/news/CategoryTabs";
import ArticleCard from "../components/news/ArticleCard";
import { getMe } from "../services/api";

const FeedPage = () => {
  const [lang, setLang] = useState<"eng" | "amh" | null>(null);
  const langLoadedRef = useRef(false);
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (langLoadedRef.current) return;
    langLoadedRef.current = true;

    const token = localStorage.getItem("token");
    if (token) {
      getMe()
        .then((user) => setLang(user.preferedLanguage || "eng"))
        .catch(() => setLang("eng"));
    } else {
      setLang("eng");
    }
  }, []);

  if (lang === null) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#38bdf8]" />
      </div>
    );
  }

  return <FeedContent lang={lang} setLang={setLang} isLoggedIn={isLoggedIn} />;
};

// FeedContent — only renders after lang is known
const FeedContent = ({ lang, setLang, isLoggedIn }: { lang: "eng" | "amh"; setLang: (lang: "eng" | "amh") => void; isLoggedIn: boolean }) => {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const { data: articles, isLoading, hasMore, loadMore, error, refresh } = useArticles(category, lang);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar isLoggedIn={isLoggedIn} onSignInClick={() => (window.location.href = "/signin")} lang={lang} onLangChange={setLang} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-white">{lang === "eng" ? "Latest News" : "የቅርብ ዜናዎች"}</h1>
        </div>

        <div className="mb-6">
          <CategoryTabs onCategoryChange={setCategory} lang={lang} />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#38bdf8]" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-400">
            Failed to load articles.{" "}
            <button onClick={refresh} className="underline">
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && articles?.length === 0 && <div className="text-center py-20 text-slate-500">No articles found for today yet. Check back soon.</div>}

        {!isLoading && articles && articles.length > 0 && (
          <div className="max-w-4xl">
            <ArticleCard key={articles[0].id} article={articles[0]} onClick={setSelectedArticle} featured={true} lang={lang} />
            <div className="divide-y divide-slate-800">
              {articles.slice(1).map((article: Article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={setSelectedArticle}
                  lang={lang} // ← was missing before
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedArticle(null)}>
          <div className="bg-[#1e293b] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedArticle(null)} className="float-right text-slate-400 hover:text-white text-xl">
              ✕
            </button>

            <div className="flex gap-2 flex-wrap mb-3">
              {selectedArticle.category?.map((cat: string) => (
                <span key={cat} className="text-xs bg-[#0f172a] text-[#38bdf8] px-2 py-0.5 rounded-full border border-slate-700">
                  {cat}
                </span>
              ))}
            </div>

            <h2 className="text-white text-xl font-bold mb-4">{selectedArticle.headline || selectedArticle.title}</h2>

            {selectedArticle.imageUrl && <img src={selectedArticle.imageUrl} alt={selectedArticle.headline} className="w-full h-52 object-cover rounded-xl mb-4" />}

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

            <details className="mb-6">
              <summary className="text-slate-500 text-sm cursor-pointer hover:text-slate-300 transition">Show original content</summary>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed border-t border-slate-700 pt-3">{selectedArticle.raw}</p>
            </details>

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
      {hasMore && (
        <div className="flex justify-center mt-8 mb-4">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-8 py-2.5 border border-slate-600 text-slate-300 rounded-full hover:border-[#38bdf8] hover:text-[#38bdf8] transition disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {!hasMore && articles.length > 0 && <p className="text-center text-slate-600 text-sm mt-8 mb-4">You've reached the end</p>}
    </div>
  );
};

export default FeedPage;
