import { IMineReport } from "../..";

export interface IMineReportPageData {
  current_page: number;
  items_per_page: number;
  records: IMineReport[];
  total: number;
  total_pages: number;
}
