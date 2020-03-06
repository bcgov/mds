/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import MineReportTable from "@/components/mine/Reports/MineReportTable";
import * as Strings from "@common/constants/strings";

/**
 * @class Reports Table
 */

const propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  openMineReportModal: PropTypes.func.isRequired,
  handleEditMineReport: PropTypes.func.isRequired,
  openViewMineReportModal: PropTypes.func.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  handleReportSearch: PropTypes.func.isRequired,
  params: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.arrayOf(PropTypes.string)])
  ).isRequired,
  reports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  mineReportCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  pageData: CustomPropTypes.reportPageData,
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

export const ReportsTable = (props) => {
  return (
    <div className="tab__content">
      <MineReportTable
        isLoaded={props.isLoaded}
        mineReports={props.reports}
        mineReportCategoryOptionsHash={props.mineReportCategoryOptionsHash}
        openMineReportModal={props.openMineReportModal}
        handleEditMineReport={props.handleEditMineReport}
        openViewMineReportModal={props.openViewMineReportModal}
        params={props.params}
        handleFilterChange={props.handleFilterChange}
        handleReportSearch={props.handleReportSearch}
        isDashboardView
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
};

ReportsTable.propTypes = propTypes;
ReportsTable.defaultProps = defaultProps;

export default ReportsTable;
