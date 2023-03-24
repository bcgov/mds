import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { destroy } from "redux-form";
import queryString from "query-string";
import PropTypes from "prop-types";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  getMineRegionHash,
  getMineTenureTypesHash,
  getCommodityOptionHash,
  getHSRCMComplianceCodesHash,
  getDropdownHSRCMComplianceCodes,
  getMineRegionDropdownOptions,
  getDropdownIncidentFollowupActionOptions,
  getDangerousOccurrenceSubparagraphOptions,
  getDropdownIncidentDeterminationOptions,
  getDropdownIncidentStatusCodeOptions,
  getDropdownIncidentCategoryCodeOptions,
} from "@common/selectors/staticContentSelectors";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
import { getIncidents, getIncidentPageData } from "@common/selectors/incidentSelectors";
import {
  fetchIncidents,
  updateMineIncident,
  deleteMineIncident,
} from "@common/actionCreators/incidentActionCreator";
import * as Strings from "@common/constants/strings";
import { PageTracker } from "@common/utils/trackers";
import CustomPropTypes from "@/customPropTypes";
import { IncidentsTable } from "./IncidentsTable";
import * as router from "@/constants/routes";
import IncidentsSearch from "./IncidentsSearch";

/**
 * @class Incidents page is a landing page for all incidents in the system
 *
 */

const propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  destroy: PropTypes.func.isRequired,
  fetchIncidents: PropTypes.func.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  incidentPageData: CustomPropTypes.incidentPageData.isRequired,
  incidents: PropTypes.arrayOf(CustomPropTypes.incident).isRequired,
  updateMineIncident: PropTypes.func.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
  followupActions: PropTypes.arrayOf(CustomPropTypes.incidentFollowupType),
  followupActionsOptions: CustomPropTypes.options.isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  incidentDeterminationOptionsActiveOnly: CustomPropTypes.options.isRequired,
  incidentStatusCodeOptions: CustomPropTypes.options.isRequired,
  incidentStatusCodeOptionsActiveOnly: CustomPropTypes.options.isRequired,
  incidentCategoryCodeOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
  deleteMineIncident: PropTypes.func.isRequired,
};

const defaultProps = {
  followupActions: [],
};

const defaultParams = {
  page: Strings.DEFAULT_PAGE,
  per_page: Strings.DEFAULT_PER_PAGE,
  sort_field: "incident_timestamp",
  sort_dir: "desc",
  search: undefined,
  major: undefined,
  region: [],
  year: undefined,
  incident_status: [],
  codes: [],
  determination: [],
  responsible_inspector_party: [],
};

const IncidentsHomePage = (props) => {
  const [incidentsLoaded, setIncidentsLoaded] = useState(false);
  const [params, setParams] = useState();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const {
    history,
    location,
    followupActionsOptions,
    incidentDeterminationOptionsActiveOnly,
    incidentStatusCodeOptionsActiveOnly,
    incidentCategoryCodeOptions,
    doSubparagraphOptions,
    inspectors,
    mineRegionOptions,
    incidentStatusCodeOptions,
    incidentDeterminationOptions,
    followupActions,
    incidents,
    incidentPageData,
  } = props;

  useEffect(() => {
    const searchParams = queryString.parse(location.search);
    setParams(searchParams);
    setInitialLoadComplete(true);
  }, []);

  const renderDataFromURL = async (newParams) => {
    const parsedParams = queryString.parse(newParams);
    await props.fetchIncidents(parsedParams);
    setIncidentsLoaded(true);
  };

  useEffect(() => {
    setIncidentsLoaded(false);
    if (params && initialLoadComplete) {
      renderDataFromURL(location.search);
    }
  }, [location]);

  useEffect(() => {
    if (params) {
      history.replace(router.INCIDENTS_DASHBOARD.dynamicRoute(params));
    }
  }, [params]);

  const clearParams = () => {
    setParams({
      ...defaultParams,
      per_page: params.per_page || defaultParams.per_page,
      sort_field: params?.sort_field,
      sort_dir: params?.sort_dir,
    });
  };

  const handleIncidentSearch = (newParams) => {
    setParams({
      ...newParams,
      page: defaultParams.page,
      responsible_inspector_party: newParams.responsible_inspector_party ?? [],
    });
  };

  const handleEditMineIncident = async (values) => {
    await props.updateMineIncident(values.mine_guid, values.mine_incident_guid, values);
    props.closeModal();
  };

  const handleDeleteMineIncident = async (values) => {
    await props.deleteMineIncident(values.mine_guid, values.mine_incident_guid);
    setIncidentsLoaded(false);

    await props.fetchIncidents(params);
    setIncidentsLoaded(true);
  };

  const handleFilterChange = async () => {
    setIncidentsLoaded(false);
    const searchParams = {
      ...params,
      page: 1,
    };
    setParams(searchParams);
    setIncidentsLoaded(true);
  };

  const handleSortPaginate = (newParams) => {
    setParams({
      ...params,
      ...newParams,
    });
  };

  return (
    <div className="landing-page">
      <PageTracker title="Incidents Page" />
      <div className="landing-page__header">
        <div>
          <h1>Browse Incidents</h1>
        </div>
      </div>
      <div className="landing-page__content">
        <div className="page__content">
          <IncidentsSearch
            handleReset={clearParams}
            initialValues={params}
            handleIncidentSearch={handleIncidentSearch}
            mineRegionOptions={mineRegionOptions}
            incidentStatusCodeOptions={incidentStatusCodeOptions}
            incidentDeterminationOptions={incidentDeterminationOptions}
            doSubparagraphOptions={doSubparagraphOptions}
          />
          <div>
            <IncidentsTable
              isLoaded={incidentsLoaded}
              incidents={incidents}
              handleFilterChange={handleFilterChange}
              pageData={incidentPageData}
              handleIncidentSearch={handleIncidentSearch}
              params={params}
              followupActions={followupActions}
              handleEditMineIncident={handleEditMineIncident}
              handleDeleteMineIncident={handleDeleteMineIncident}
              handleSortPaginate={handleSortPaginate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

IncidentsHomePage.propTypes = propTypes;
IncidentsHomePage.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  mineRegionHash: getMineRegionHash(state),
  mineTenureHash: getMineTenureTypesHash(state),
  mineCommodityOptionsHash: getCommodityOptionHash(state),
  incidentPageData: getIncidentPageData(state),
  incidents: getIncidents(state),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  getDropdownHSRCMComplianceCodes: getDropdownHSRCMComplianceCodes(state),
  mineRegionOptions: getMineRegionDropdownOptions(state),
  followupActionsOptions: getDropdownIncidentFollowupActionOptions(state),
  incidentDeterminationOptions: getDropdownIncidentDeterminationOptions(state, false),
  incidentDeterminationOptionsActiveOnly: getDropdownIncidentDeterminationOptions(state),
  incidentStatusCodeOptions: getDropdownIncidentStatusCodeOptions(state, false),
  incidentStatusCodeOptionsActiveOnly: getDropdownIncidentStatusCodeOptions(state),
  inspectors: getDropdownInspectors(state),
  doSubparagraphOptions: getDangerousOccurrenceSubparagraphOptions(state),
  incidentCategoryCodeOptions: getDropdownIncidentCategoryCodeOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchIncidents,
      updateMineIncident,
      destroy,
      openModal,
      closeModal,
      deleteMineIncident,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(IncidentsHomePage);
