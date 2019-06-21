import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import MineVarianceTable from "@/components/mine/Variances/MineVarianceTable";

/**
 * @class VarianceTables
 */
const propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  openModal: PropTypes.func.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  params: PropTypes.objectOf(
    PropTypes.oneOfType[(PropTypes.string, PropTypes.number, PropTypes.arrayOf(PropTypes.string))]
  ).isRequired,
  pageData: CustomPropTypes.variancePageData.isRequired,
};

export const VarianceTable = (props) => (
  <div className="tab__content">
    <h4>Variances</h4>
    <br />
    <MineVarianceTable
      handleFilterChange={props.handleFilterChange}
      variances={props.variances}
      isApplication
      isDashboardView
      openEditVarianceModal={props.openModal}
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

export default VarianceTable;
