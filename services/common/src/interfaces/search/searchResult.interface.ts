export interface ISearchResult {
  result: {
    id: string;
    value: string;
  };
  score: number;
  type: string;
}

export interface ISearchResultList {
  mine: ISearchResult[],
  mine_documents: ISearchResult[],
  party: ISearchResult[],
  permit: ISearchResult[],
  permit_documents: ISearchResult[],
}