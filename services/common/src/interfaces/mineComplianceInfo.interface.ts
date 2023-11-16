import { IComplianceOrder } from "./complianceOrder.interface";

export interface IMineComplianceInfo {
  advisories: number;
  last_inspector: string;
  last_inspection: string;
  num_open_orders: number;
  num_overdue_orders: number;
  orders: IComplianceOrder[];
  section_35_orders: number;
  warnings: number;
}
