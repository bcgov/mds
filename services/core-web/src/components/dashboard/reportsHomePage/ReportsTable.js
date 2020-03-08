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
  openEditReportModal: PropTypes.func.isRequired,
  handleEditReport: PropTypes.func.isRequired,
  handleRemoveReport: PropTypes.func.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  params: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.arrayOf(PropTypes.string)])
  ).isRequired,
  reports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  pageData: CustomPropTypes.reportPageData,
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
  isLoaded: PropTypes.bool.isRequired,
};

const defaultProps = {
  pageData: {
    records: {},
    current_page: 1,
    items_per_page: Strings.DEFAULT_PER_PAGE,
    total: 0,
    total_pages: 1,
  },
  sortField: undefined,
  sortDir: undefined,
};

export const ReportsTable = (props) => {
  return (
    <div className="tab__content">
      <MineReportTable
        isLoaded={props.isLoaded}
        mineReports={props.reports}
        handleTableChange={props.handleSearch}
        openMineReportModal={props.openMineReportModal}
        openEditReportModal={props.openEditReportModal}
        handleEditReport={props.handleEditReport}
        handleRemoveReport={props.handleRemoveReport}
        filters={props.params}
        sortField={props.sortField}
        sortDir={props.sortDir}
        isDashboardView={props.isDashboardView}
      />
      <div className="center">
        <ResponsivePagination
          onPageChange={props.handlePageChange}
          currentPage={props.pageData.current_page}
          pageTotal={props.pageData.total}
          itemsPerPage={props.pageData.items_per_page}
        />
      </div>
    </div>
  );
};

ReportsTable.propTypes = propTypes;
ReportsTable.defaultProps = defaultProps;

export default ReportsTable;
