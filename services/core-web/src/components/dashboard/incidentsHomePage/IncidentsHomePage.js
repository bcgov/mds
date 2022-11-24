import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { destroy } from "redux-form";
import moment from "moment";
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
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import * as FORM from "@/constants/forms";

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
};

export class IncidentsHomePage extends Component {
  state = {
    incidentsLoaded: false,
    params: defaultParams,
  };

  componentDidMount() {
    const params = queryString.parse(this.props.location.search);
    this.setState(
      (prevState) => ({
        params: {
          ...prevState.params,
          ...params,
        },
      }),
      () => this.props.history.replace(router.INCIDENTS_DASHBOARD.dynamicRoute(this.state.params))
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.setState({ incidentsLoaded: false }, () =>
        this.renderDataFromURL(nextProps.location.search)
      );
    }
  }

  renderDataFromURL = (params) => {
    const parsedParams = queryString.parse(params);
    this.props.fetchIncidents(parsedParams).then(() => {
      this.setState({ incidentsLoaded: true });
    });
  };

  clearParams = () => {
    this.setState(
      (prevState) => ({
        params: {
          ...defaultParams,
          per_page: prevState.params.per_page || defaultParams.per_page,
          sort_field: prevState.params.sort_field,
          sort_dir: prevState.params.sort_dir,
        },
      }),
      () => {
        this.props.history.replace(router.INCIDENTS_DASHBOARD.dynamicRoute(this.state.params));
      }
    );
  };

  handleIncidentSearch = (params) => {
    this.setState(
      {
        params,
      },
      () => this.props.history.replace(router.INCIDENTS_DASHBOARD.dynamicRoute(this.state.params))
    );
  };

  onPageChange = (page, per_page) => {
    this.setState(
      (prevState) => ({ params: { ...prevState.params, page, per_page } }),
      () => this.props.history.replace(router.INCIDENTS_DASHBOARD.dynamicRoute(this.state.params))
    );
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

  handleDeleteMineIncident = (values) => {
    this.props.deleteMineIncident(values.mine_guid, values.mine_incident_guid).then(() => {
      this.setState({ incidentsLoaded: false });
      this.props.fetchIncidents(this.state.params).then(() => {
        this.setState({ incidentsLoaded: true });
      });
    });
  };

  handleCancelMineIncident = () => {
    this.props.destroy(FORM.MINE_INCIDENT);
  };

  parseIncidentIntoFormData = (existingIncident) => ({
    ...existingIncident,
    reported_date: moment(existingIncident.reported_timestamp).format("YYYY-MM-DD"),
    reported_time: moment(existingIncident.reported_timestamp),
    incident_date: moment(existingIncident.incident_timestamp).format("YYYY-MM-DD"),
    incident_time: moment(existingIncident.incident_timestamp),
  });

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
          status_code: "WNS",
          ...this.parseIncidentIntoFormData(existingIncident),
          dangerous_occurrence_subparagraph_ids: existingIncident.dangerous_occurrence_subparagraph_ids.map(
            String
          ),
          categories: existingIncident.categories
            ? existingIncident.categories
                .sort((a, b) => (a.display_order > b.display_order ? 1 : -1))
                .map((c) => c.mine_incident_category_code)
            : [],
        },
        onSubmit,
        afterClose: this.handleCancelMineIncident,
        title,
        mineGuid: existingIncident.mine_guid,
        followupActionOptions: this.props.followupActionsOptions,
        incidentDeterminationOptions: this.props.incidentDeterminationOptionsActiveOnly,
        incidentStatusCodeOptions: this.props.incidentStatusCodeOptionsActiveOnly,
        incidentCategoryCodeOptions: this.props.incidentCategoryCodeOptions,
        doSubparagraphOptions: this.props.doSubparagraphOptions,
        inspectors: this.props.inspectors,
        clearOnSubmit: true,
      },
      width: "50vw",
      content: modalConfig.MINE_INCIDENT,
    });
  };

  handleFilterChange = () => {
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
        <PageTracker title="Incidents Page" />
        <div className="landing-page__header">
          <div>
            <h1>Browse Incidents</h1>
          </div>
        </div>
        <div className="landing-page__content">
          <div className="page__content">
            <IncidentsSearch
              handleReset={this.clearParams}
              handleNameFieldReset={this.handleNameFieldReset}
              initialValues={this.state.params}
              handleIncidentSearch={this.handleIncidentSearch}
              mineRegionOptions={this.props.mineRegionOptions}
              incidentStatusCodeOptions={this.props.incidentStatusCodeOptions}
              incidentDeterminationOptions={this.props.incidentDeterminationOptions}
              doSubparagraphOptions={this.props.doSubparagraphOptions}
            />
            <div>
              <IncidentsTable
                isLoaded={this.state.incidentsLoaded}
                incidents={this.props.incidents}
                isApplication={this.state.isApplication}
                handleFilterChange={this.handleFilterChange}
                pageData={this.props.incidentPageData}
                handlePageChange={this.onPageChange}
                handleIncidentSearch={this.handleIncidentSearch}
                params={this.state.params}
                sortField={this.state.params.sort_field}
                sortDir={this.state.params.sort_dir}
                followupActions={this.props.followupActions}
                openMineIncidentModal={this.openMineIncidentModal}
                handleEditMineIncident={this.handleEditMineIncident}
                openViewMineIncidentModal={this.openViewMineIncidentModal}
                handleDeleteMineIncident={this.handleDeleteMineIncident}
              />
            </div>
          </div>
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
