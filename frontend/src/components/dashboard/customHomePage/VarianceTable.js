import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import MineVarianceTable from "@/components/mine/Variances/MineVarianceTable";
import * as Strings from "@/constants/strings";

/**
 * @class VarianceTables
 */
const propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  openEditVarianceModal: PropTypes.func.isRequired,
  openViewVarianceModal: PropTypes.func.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  params: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.arrayOf(PropTypes.string)])
  ).isRequired,
  pageData: CustomPropTypes.variancePageData,
  filterVarianceStatusOptions: CustomPropTypes.filterOptions.isRequired,
};

const defaultProps = {
  pageData: {
    records: [],
    current_page: 1,
    items_per_page: Strings.DEFAULT_PER_PAGE,
    total: 0,
    total_pages: 1,
  },
};
export const VarianceTable = (props) => (
  <div className="tab__content">
    <h4>Variances</h4>
    <br />
    <MineVarianceTable
      params={props.params}
      filterVarianceStatusOptions={props.filterVarianceStatusOptions}
      handleFilterChange={props.handleFilterChange}
      variances={props.variances}
      isApplication
      isDashboardView
      openEditVarianceModal={props.openEditVarianceModal}
      openViewVarianceModal={props.openViewVarianceModal}
    />
    <div className="center">
      <ResponsivePagination
        onPageChange={props.handlePageChange}
        currentPage={Number(props.params.page)}
        pageTotal={props.pageData.total}
        itemsPerPage={Number(props.params.per_page)}
      />
    </div>
  </div>
);

VarianceTable.propTypes = propTypes;
VarianceTable.defaultProps = defaultProps;
export default VarianceTable;
