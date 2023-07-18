export interface IPageData<T> {
  records: T[];
  current_page: number;
  items_per_page: number;
  total: number;
  total_pages: number;
}
