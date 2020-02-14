import { PropTypes } from "prop-types";

export const complianceOrder = PropTypes.shape({
  overdue: PropTypes.bool,
  due_date: PropTypes.string,
  order_no: PropTypes.string,
  violation: PropTypes.string,
  report_no: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  inspector: PropTypes.string,
  order_status: PropTypes.string,
});

export const complianceFilterOptions = PropTypes.shape({
  order_status: PropTypes.string,
  due_date: PropTypes.string,
  order_no: PropTypes.string,
  violation: PropTypes.arrayOf(PropTypes.string),
  report_no: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  inspector: PropTypes.string,
});

export const complianceOrders = PropTypes.arrayOf(complianceOrder);

export const mineComplianceInfo = PropTypes.shape({
  advisories: PropTypes.number,
  last_inspector: PropTypes.string,
  last_inspection: PropTypes.string,
  num_open_orders: PropTypes.number,
  num_overdue_orders: PropTypes.number,
  orders: complianceOrders,
  section_35_orders: PropTypes.number,
  warnings: PropTypes.number,
});
