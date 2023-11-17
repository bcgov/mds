import React from "react";
import PropTypes from "prop-types";
import * as Strings from "@mds/common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import MineVarianceTable from "@/components/mine/Variances/MineVarianceTable";

/**
 * @class VarianceTables
 */
const propTypes = {
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  openEditVarianceModal: PropTypes.func.isRequired,
  openViewVarianceModal: PropTypes.func.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  handleVarianceSearch: PropTypes.func.isRequired,
  handleDeleteVariance: PropTypes.func.isRequired,
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
  sortField: undefined,
  sortDir: undefined,
};

export const VarianceTable = (props) => (
  <div className="tab__content">
    <MineVarianceTable
      isLoaded={props.isLoaded}
      params={props.params}
      filterVarianceStatusOptions={props.filterVarianceStatusOptions}
      handleVarianceSearch={props.handleVarianceSearch}
      variances={props.variances}
      isApplication
      isDashboardView
      openEditVarianceModal={props.openEditVarianceModal}
      openViewVarianceModal={props.openViewVarianceModal}
      handleDeleteVariance={props.handleDeleteVariance}
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
