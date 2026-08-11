import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchArticles } from "../services/api";

export const useArticles = (category?: string, lang?: "eng" | "amh") => {
  const queryClient = useQueryClient();
  const queryKey = ["articles", category, lang] as const;
  const isLangReady = lang === "eng" || lang === "amh";

  useEffect(() => {
    if (!isLangReady) return;

    queryClient.invalidateQueries({ queryKey: ["articles"], exact: false });
  }, [category, lang, isLangReady, queryClient]);

  const getMsUntilNextRefetch = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const minutesUntilNext = minutes < 10 ? 10 - minutes : 70 - minutes;
    return (minutesUntilNext * 60 - seconds) * 1000;
  };

  const query = useQuery({
    queryKey,
    queryFn: () =>
      fetchArticles({
        category,
        lang,
      }),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchInterval: getMsUntilNextRefetch,
    enabled: isLangReady,
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey, exact: true });
  };

  return {
    ...query,
    refresh,
  };
};
