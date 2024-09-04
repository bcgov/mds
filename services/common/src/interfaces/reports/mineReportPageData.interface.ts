import { IMineReport } from "@mds/common/interfaces";

export interface IMineReportPageData {
  records: IMineReport[];
  current_page: number;
  items_per_page: number;
  total: number;
  total_pages: number;
}
