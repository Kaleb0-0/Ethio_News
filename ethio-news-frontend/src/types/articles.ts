export interface Article {
  id: string;
  title: string;
  sourceUrl: string;
  pubDate: string;
  summarizedAt: string;
  imageUrl: string | null;
  category: string[];
  headline: string;
  summary: string[];
  raw: string;
}

export interface ArticlesResponse {
  articles: Article[];
}
