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
  handleVarianceSearch: PropTypes.func.isRequired,
  params: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.arrayOf(PropTypes.string)])
  ).isRequired,
  pageData: CustomPropTypes.variancePageData,
  filterVarianceStatusOptions: CustomPropTypes.filterOptions.isRequired,
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
  isLoaded: PropTypes.bool.isRequired,
};

const defaultProps = {
  pageData: {
    records: [],
    current_page: 1,
    items_per_page: Strings.DEFAULT_PER_PAGE,
    total: 0,
    total_pages: 1,
  },
  sortField: null,
  sortDir: null,
};
export const VarianceTable = (props) => (
  <div className="tab__content">
    <h4>Variances</h4>
    <br />
    <MineVarianceTable
      isLoaded={props.isLoaded}
      paginationPerPage={props.pageData.items_per_page}
      params={props.params}
      filterVarianceStatusOptions={props.filterVarianceStatusOptions}
      handleFilterChange={props.handleFilterChange}
      handleVarianceSearch={props.handleVarianceSearch}
      variances={props.variances}
      isApplication
      isDashboardView
      openEditVarianceModal={props.openEditVarianceModal}
      openViewVarianceModal={props.openViewVarianceModal}
      sortField={props.sortField}
      sortDir={props.sortDir}
    />
    <div className="center">
      <ResponsivePagination
        onPageChange={props.handlePageChange}
        currentPage={Number(props.pageData.current_page)}
        pageTotal={props.pageData.total}
        itemsPerPage={Number(props.pageData.items_per_page)}
      />
    </div>
  </div>
);

VarianceTable.propTypes = propTypes;
VarianceTable.defaultProps = defaultProps;
export default VarianceTable;
