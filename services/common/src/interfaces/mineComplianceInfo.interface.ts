import { IComplianceOrder } from "./complianceOrder.interface";
import { IMineComplianceStats } from "./mineComplianceStats.interface";

export interface IMineComplianceInfo {
  advisories: number;
  last_inspector: string;
  last_inspection: string;
  num_open_orders: number;
  num_overdue_orders: number;
  orders: IComplianceOrder[];
  section_35_orders: number;
  warnings: number;
  last_12_months: IMineComplianceStats;
  current_fiscal: IMineComplianceStats;
}
