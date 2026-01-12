export type Source = {
  document: string;
  snippet: string;
  page?: number | null;
};

export type ChatResponse = {
  answer: string;
  sources: Source[];
};
