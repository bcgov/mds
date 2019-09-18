import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { destroy } from "redux-form";
import { debounce, isEmpty } from "lodash";
import queryString from "query-string";
import PropTypes from "prop-types";
import {
  fetchRegionOptions,
  fetchMineComplianceCodes,
  fetchMineIncidentStatusCodeOptions,
} from "@/actionCreators/staticContentActionCreator";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";
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
  getIncidentFollowupActionOptions,
} from "@/selectors/staticContentSelectors";
import { getDropdownInspectors } from "@/selectors/partiesSelectors";
import CustomPropTypes from "@/customPropTypes";
import { fetchIncidents, updateMineIncident } from "@/actionCreators/incidentActionCreator";
import { getIncidents, getIncidentPageData } from "@/selectors/incidentSelectors";
import { IncidentsTable } from "./IncidentsTable";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import * as router from "@/constants/routes";
import { fetchInspectors } from "@/actionCreators/partiesActionCreator";
import IncidentsSearch from "./IncidentsSearch";
import { formatParamStringToArray } from "@/utils/helpers";
import * as ModalContent from "@/constants/modalContent";
import * as FORM from "@/constants/forms";

/**
 * @class Incidents page is a landing page for all incidents in the system
 *
 */

const propTypes = {
  fetchMineComplianceCodes: PropTypes.func.isRequired,
  fetchRegionOptions: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  destroy: PropTypes.func.isRequired,
  fetchInspectors: PropTypes.func.isRequired,
  fetchIncidents: PropTypes.func.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  incidentPageData: CustomPropTypes.incidentPageData.isRequired,
  incidents: PropTypes.arrayOf(CustomPropTypes.incident).isRequired,
  updateMineIncident: PropTypes.func,
  fetchMineIncidentStatusCodeOptions: PropTypes.func.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  followupActions: PropTypes.arrayOf(CustomPropTypes.incidentFollowupType),
  followupActionsOptions: CustomPropTypes.options.isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  incidentStatusCodeOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
};

const defaultProps = {
  updateMineIncident: () => {},
  followupActions: [],
};

export const joinOrRemove = (param, key) => {
  if (isEmpty(param)) {
    return {};
  }
  return typeof param === "string" ? { [key]: param } : { [key]: param.join(",") };
};
export const removeEmptyStings = (param, key) => (isEmpty(param) ? {} : { [key]: param });

// TODO: Implement the NoW dashboard patern for cleaning props
export const formatParams = ({
  region = [],
  year,
  incident_status = [],
  codes = [],
  determination = [],
  search,
  major,
  ...remainingParams
}) => {
  return {
    ...joinOrRemove(region, "region"),
    ...removeEmptyStings(year, "year"),
    ...joinOrRemove(incident_status, "incident_status"),
    ...joinOrRemove(codes, "codes"),
    ...joinOrRemove(determination, "determination"),
    ...removeEmptyStings(search, "search"),
    ...removeEmptyStings(major, "major"),
    ...remainingParams,
  };
};

export class IncidentsHomePage extends Component {
  params = queryString.parse(this.props.location.search);

  constructor(props) {
    super(props);
    this.handleIncidentSearchDebounced = debounce(this.handleIncidentSearch, 1000);
    this.state = {
      incidentsLoaded: false,
      params: {
        region: formatParamStringToArray(this.params.region),
        major: this.params.major,
        search: this.params.search,
        year: this.params.year,
        incident_status: this.params.incident_status,
        codes: this.params.codes,
        determination: this.params.determination,
      },
    };
  }

  componentDidMount() {
    const params = this.props.location.search;
    this.renderDataFromURL(params);
    this.props.fetchIncidents(this.state.params).then(() => {
      this.setState({ incidentsLoaded: true });
    });
    this.props.fetchInspectors();
    this.props.fetchMineComplianceCodes();
    this.props.fetchRegionOptions();
    this.props.fetchMineIncidentStatusCodeOptions();
  }

  componentWillReceiveProps(nextProps) {
    const locationChanged = nextProps.location !== this.props.location;
    if (locationChanged) {
      this.renderDataFromURL(nextProps.location.search);
    }
  }

  componentWillUnmount() {
    this.handleIncidentSearchDebounced.cancel();
    this.setState({
      params: {},
    });
  }

  renderDataFromURL = (params) => {
    const {
      region,
      major,
      incident_status,
      codes,
      determination,
      search,
      ...remainingParams
    } = queryString.parse(params);
    this.setState(
      {
        params: {
          region: formatParamStringToArray(region),
          incident_status: formatParamStringToArray(incident_status),
          codes: formatParamStringToArray(codes),
          determination: formatParamStringToArray(determination),
          major,
          search,
          ...remainingParams,
        },
      },
      () => {
        this.props.fetchIncidents(this.state.params);
      }
    );
  };

  clearParams = () => {
    this.setState({
      params: {
        region: [],
        major: null,
        search: null,
        year: null,
        incident_status: [],
        codes: [],
        determination: [],
      },
    });
  };

  handleIncidentSearch = (searchParams, clear = false) => {
    const formattedSearchParams = formatParams(searchParams);
    const persistedParams = clear ? {} : formatParams(this.state.params);
    this.setState((prevState) => {
      const updatedParams = {
        // Start from existing state
        ...persistedParams,
        // Overwrite prev params with any newly provided search params
        ...formattedSearchParams,
        // Reset page number
        page: prevState.params.page ? prevState.params.page : String.DEFAULT_PAGE,
        // Retain per_page if present
        per_page: prevState.params.per_page ? prevState.params.per_page : String.DEFAULT_PER_PAGE,
      };
      this.props.history.push(router.INCIDENTS_DASHBOARD.dynamicRoute(updatedParams));
      return { params: updatedParams };
    });
  };

  handleIncidentPageChange = (page, per_page) => {
    this.setState({ incidentsLoaded: false });
    const params = { ...this.state.params, page, per_page };
    this.props.history.push(router.INCIDENTS_DASHBOARD.dynamicRoute(params));
    return this.props.fetchIncidents(params).then(() => {
      this.setState({
        incidentsLoaded: true,
        params,
      });
    });
  };

  openViewMineIncidentModal = (event, incident) => {
    event.preventDefault();
    const title = `${incident.mine_name} - Incident No. ${incident.mine_incident_report_no}`;
    this.props.openModal({
      props: {
        title,
        incident,
      },
      isViewOnly: true,
      afterClose: () => {},
      content: modalConfig.VIEW_MINE_INCIDENT,
    });
  };

  handleEditMineIncident = (values) => {
    this.props.updateMineIncident(values.mine_guid, values.mine_incident_guid, values).then(() => {
      this.props.closeModal();
    });
  };

  handleCancelMineIncident = () => {
    this.props.destroy(FORM.MINE_INCIDENT);
  };

  openMineIncidentModal = (
    event,
    onSubmit,
    newIncident,
    existingIncident = { dangerous_occurrence_subparagraph_ids: [] }
  ) => {
    event.preventDefault();
    const title = newIncident
      ? ModalContent.ADD_INCIDENT(existingIncident.mine_name)
      : ModalContent.EDIT_INCIDENT(existingIncident.mine_name);
    this.props.openModal({
      props: {
        newIncident,
        initialValues: {
          ...existingIncident,
          dangerous_occurrence_subparagraph_ids: existingIncident.dangerous_occurrence_subparagraph_ids.map(
            String
          ),
        },
        onSubmit,
        afterClose: this.handleCancelMineIncident,
        title,
        mineGuid: existingIncident.mine_guid,
        followupActionOptions: this.props.followupActionsOptions,
        incidentDeterminationOptions: this.props.incidentDeterminationOptions,
        incidentStatusCodeOptions: this.props.incidentStatusCodeOptions,
        doSubparagraphOptions: this.props.doSubparagraphOptions,
        inspectors: this.props.inspectors,
        clearOnSubmit: true,
      },
      content: modalConfig.MINE_INCIDENT,
    });
  };

  // eslint-disable-next-line no-unused-vars
  handleFilterChange = (_pagination, _filters) => {
    this.setState({ incidentsLoaded: false });
    const params = {
      ...this.state.params,
      page: 1,
    };
    return this.props.fetchIncidents(params).then(() => {
      this.setState({
        incidentsLoaded: true,
        params,
      });
    });
  };

  render() {
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <h1>Browse Incidents</h1>
        </div>
        <div className="landing-page__content">
          <IncidentsSearch
            handleNameFieldReset={this.handleNameFieldReset}
            initialValues={this.state.params}
            handleIncidentSearch={this.handleIncidentSearchDebounced}
            mineRegionOptions={this.props.mineRegionOptions}
            incidentStatusCodeOptions={this.props.incidentStatusCodeOptions}
            incidentDeterminationOptions={this.props.incidentDeterminationOptions}
            doSubparagraphOptions={this.props.doSubparagraphOptions}
          />
          <LoadingWrapper condition={this.state.incidentsLoaded}>
            <IncidentsTable
              incidents={this.props.incidents}
              isApplication={this.state.isApplication}
              handleFilterChange={this.handleFilterChange}
              pageData={this.props.incidentPageData}
              handlePageChange={this.handleIncidentPageChange}
              handleIncidentSearch={this.handleIncidentSearch}
              params={this.state.params}
              sortField={this.state.params.sort_field}
              sortDir={this.state.params.sort_dir}
              followupActions={this.props.followupActions}
              openMineIncidentModal={this.openMineIncidentModal}
              handleEditMineIncident={this.handleEditMineIncident}
              openViewMineIncidentModal={this.openViewMineIncidentModal}
            />
          </LoadingWrapper>
        </div>
      </div>
    );
  }
}

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
  followupActions: getIncidentFollowupActionOptions(state),
  followupActionsOptions: getDropdownIncidentFollowupActionOptions(state),
  incidentDeterminationOptions: getDropdownIncidentDeterminationOptions(state),
  incidentStatusCodeOptions: getDropdownIncidentStatusCodeOptions(state),
  inspectors: getDropdownInspectors(state),
  doSubparagraphOptions: getDangerousOccurrenceSubparagraphOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchIncidents,
      updateMineIncident,
      destroy,
      openModal,
      closeModal,
      fetchRegionOptions,
      fetchMineComplianceCodes,
      fetchMineIncidentStatusCodeOptions,
      fetchInspectors,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IncidentsHomePage);
