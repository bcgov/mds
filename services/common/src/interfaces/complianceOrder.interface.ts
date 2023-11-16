export interface IComplianceOrder {
  overdue: boolean;
  due_date: string;
  order_no: string;
  violation: string;
  report_no: number | string;
  inspector: string;
  order_status: string;
}
