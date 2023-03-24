import React from "react";
import PropTypes from "prop-types";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import MineIncidentTable from "@/components/mine/Incidents/MineIncidentTable";

/**
 * @class Incidents Table
 */

const propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  handleEditMineIncident: PropTypes.func.isRequired,
  handleDeleteMineIncident: PropTypes.func.isRequired,
  handleIncidentSearch: PropTypes.func.isRequired,
  handleSortPaginate: PropTypes.func.isRequired,
  followupActions: PropTypes.arrayOf(CustomPropTypes.incidentFollowupType).isRequired,
  incidents: PropTypes.arrayOf(CustomPropTypes.incident).isRequired,
  params: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.arrayOf(PropTypes.string)])
  ).isRequired,
  pageData: CustomPropTypes.incidentPageData,
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
};

export const IncidentsTable = (props) => {
  return (
    <div className="tab__content">
      <MineIncidentTable
        isLoaded={props.isLoaded}
        incidents={props.incidents}
        followupActions={props.followupActions}
        handleEditMineIncident={props.handleEditMineIncident}
        handleDeleteMineIncident={props.handleDeleteMineIncident}
        params={props.params}
        handleFilterChange={props.handleFilterChange}
        handleIncidentSearch={props.handleIncidentSearch}
        isApplication
        isDashboardView
        pageData={props.pageData}
        handleUpdate={props.handleSortPaginate}
      />
    </div>
  );
};

IncidentsTable.propTypes = propTypes;
IncidentsTable.defaultProps = defaultProps;

export default IncidentsTable;
