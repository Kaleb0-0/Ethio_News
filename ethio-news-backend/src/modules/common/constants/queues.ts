export const QUEUES = {
  INGESTION: 'ingestion',
  SUMMARIZATION: 'summarization',
} as const;

export const JOBS = {
  FETCH_NEWS: 'fetch-news',
  SUMMARIZE_ARTICLE: 'summarize-article',
  SEND_PUSH: 'send-push',
} as const;
