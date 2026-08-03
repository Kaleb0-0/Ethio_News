import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchArticles } from "../services/api";
import { useEffect } from "react";

export const useArticles = (category?: string, lang?: "eng" | "amh") => {
  const queryClient = useQueryClient();
  const queryKey = ["articles", category, lang] as const;

  const getMsUntilNextRefetch = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const minutesUntilNext = minutes < 10 ? 10 - minutes : 70 - minutes;
    return (minutesUntilNext * 60 - seconds) * 1000;
  };

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey, exact: true });
  }, [category, lang]);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      fetchArticles({
        category,
        lang,
      }),
    staleTime: 60_000, //this would need to change for the since function
    refetchOnWindowFocus: false,
    refetchInterval: getMsUntilNextRefetch,
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey, exact: true });
  };

  return {
    ...query,
    refresh,
  };
};
