export interface ISearchResult {
  result: {
    id: string;
    value: string;
  };
  score: number;
  type: string;
}
