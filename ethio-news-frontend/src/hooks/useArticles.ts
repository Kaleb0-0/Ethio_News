import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchArticles } from "../services/api";
import { useRef } from "react";

export const useArticles = (category?: string, lang?: "eng" | "amh") => {
  const lastFetchedAt = useRef<string | undefined>(undefined);
  const queryClient = useQueryClient();

  const getMsUntilNextRefetch = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const minutesUntilNext = minutes < 10 ? 10 - minutes : 70 - minutes;
    return (minutesUntilNext * 60 - seconds) * 1000;
  };

  const query = useQuery({
    queryKey: ["articles", category, lang],
    queryFn: async () => {
      const data = await fetchArticles({
        category,
        lang,
        since: lastFetchedAt.current,
      });
      lastFetchedAt.current = new Date().toISOString();
      return data;
    },
    refetchInterval: getMsUntilNextRefetch,
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false, // don't refetch just from switching tabs
  });

  // manual refresh — resets since so it fetches everything fresh
  const refresh = async () => {
    lastFetchedAt.current = undefined; // reset so we get all today's articles
    await queryClient.invalidateQueries({ queryKey: ["articles", category, lang] });
  };

  return {
    ...query,
    refresh, // expose this to the UI for pull-to-refresh or refresh button
  };
};
