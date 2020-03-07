/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import MineIncidentTable from "@/components/mine/Incidents/MineIncidentTable";
import * as Strings from "@common/constants/strings";

/**
 * @class Incidents Table
 */

const propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  openMineIncidentModal: PropTypes.func.isRequired,
  handleEditMineIncident: PropTypes.func.isRequired,
  openViewMineIncidentModal: PropTypes.func.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  handleIncidentSearch: PropTypes.func.isRequired,
  params: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.arrayOf(PropTypes.string)])
  ).isRequired,
  pageData: CustomPropTypes.incidentPageData,
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

export const IncidentsTable = (props) => {
  return (
    <div className="tab__content">
      <MineIncidentTable
        isLoaded={props.isLoaded}
        incidents={props.incidents}
        followupActions={props.followupActions}
        openMineIncidentModal={props.openMineIncidentModal}
        handleEditMineIncident={props.handleEditMineIncident}
        openViewMineIncidentModal={props.openViewMineIncidentModal}
        params={props.params}
        handleFilterChange={props.handleFilterChange}
        handleIncidentSearch={props.handleIncidentSearch}
        isApplication
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

IncidentsTable.propTypes = propTypes;
IncidentsTable.defaultProps = defaultProps;

export default IncidentsTable;
