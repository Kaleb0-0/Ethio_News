import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchArticles } from "../services/api";
import { type Article } from "../types/articles";

const TAKE = 15;

export const useArticles = (category?: string, lang?: "eng" | "amh") => {
  const queryClient = useQueryClient();
  const isLangReady = lang === "eng" || lang === "amh";

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);

  const getMsUntilNextRefetch = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const minutesUntilNext = minutes < 10 ? 10 - minutes : 70 - minutes;
    return (minutesUntilNext * 60 - seconds) * 1000;
  };

  const fetch = useCallback(
    async (reset = false) => {
      if (!isLangReady) return;
      setIsLoading(true);
      setError(null);

      const currentSkip = reset ? 0 : skip;

      try {
        const data = await fetchArticles({
          category,
          lang,
          take: TAKE,
          skip: currentSkip,
        });

        if (reset) {
          setArticles(data);
          setSkip(TAKE);
        } else {
          setArticles((prev) => [...prev, ...data]);
          setSkip(currentSkip + TAKE);
        }

        setHasMore(data.length === TAKE);
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [category, lang, skip, isLangReady],
  );

  // refetch when category or lang changes
  useEffect(() => {
    if (!isLangReady) return;
    fetch(true); // reset articles list
  }, [category, lang, isLangReady]);

  // auto refetch at :10 every hour
  useEffect(() => {
    if (!isLangReady) return;
    const ms = getMsUntilNextRefetch();
    const timer = setTimeout(() => {
      fetch(true); // reset and refetch fresh
    }, ms);
    return () => clearTimeout(timer);
  }, [isLangReady, articles]);

  const loadMore = () => fetch(false);

  const refresh = async () => {
    queryClient.removeQueries({ queryKey: ["articles"] });
    await fetch(true);
  };

  return {
    data: articles,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
};
