import { IParty } from "@/index";

export interface IPartiesPageData {
  records: IParty[];
  current_page: number;
  items_per_page: number;
  total: number;
  total_pages: number;
}
