import React, { FC } from "react";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import MineReportTable from "@/components/mine/Reports/MineReportTable";
import { IMineReport, IPageData, MineReportParams } from "@mds/common";

interface ReportsTableProps {
  openEditReportModal: (event, onSubmit, report) => void;
  handleEditReport: (updateNOWList, tableFilters) => void;
  handleRemoveReport: (updateNOWList, tableFilters) => void;
  handlePageChange: (updateNOWList, tableFilters) => void;
  handleSearch: (updateNOWList, tableFilters) => void;
  reports: IMineReport[];
  pageData: IPageData<IMineReport>;
  params: MineReportParams;
  isLoaded: boolean;
  isDashboardView?: boolean;
  sortField?: string;
  sortDir?: string;
}

export const ReportsTable: FC<ReportsTableProps> = ({
  openEditReportModal,
  handleEditReport,
  handleRemoveReport,
  handlePageChange,
  handleSearch,
  reports,
  pageData,
  params,
  isLoaded,
  isDashboardView = false,
  sortField = undefined,
  sortDir = undefined,
}) => {
  return (
    <div className="tab__content">
      <MineReportTable
        isLoaded={isLoaded}
        mineReports={reports}
        handleTableChange={handleSearch}
        openEditReportModal={openEditReportModal}
        handleEditReport={handleEditReport}
        handleRemoveReport={handleRemoveReport}
        filters={params}
        sortField={sortField}
        sortDir={sortDir}
        isDashboardView={isDashboardView}
      />
      <div className="center">
        <ResponsivePagination
          onPageChange={handlePageChange}
          currentPage={Number(pageData.current_page)}
          pageTotal={Number(pageData.total)}
          itemsPerPage={Number(pageData.items_per_page)}
        />
      </div>
    </div>
  );
};

export default ReportsTable;
