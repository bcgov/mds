import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { destroy } from "redux-form";
import { debounce, isEmpty } from "lodash";
import queryString from "query-string";
import moment from "moment";
import PropTypes from "prop-types";
import {
  fetchRegionOptions,
  fetchMineTenureTypes,
  fetchMineCommodityOptions,
  fetchMineComplianceCodes,
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
import CustomPropTypes from "@/customPropTypes";
import { fetchIncidents } from "@/actionCreators/incidentsActionCreator";
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
  fetchMineTenureTypes: PropTypes.func.isRequired,
  fetchMineComplianceCodes: PropTypes.func.isRequired,
  fetchRegionOptions: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  destroy: PropTypes.func.isRequired,
  fetchInspectors: PropTypes.func.isRequired,
  fetchMineCommodityOptions: PropTypes.func.isRequired,
  fetchIncidents: PropTypes.func.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  getDropdownHSRCMComplianceCodes: CustomPropTypes.options.isRequired,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  followupActions: PropTypes.arrayOf(CustomPropTypes.incidentFollowupType),
  followupActionsOptions: CustomPropTypes.options.isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  incidentStatusCodeOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
};

const defaultProps = {
  followupActions: [],
};

export const joinOrRemove = (param, key) => {
  if (isEmpty(param)) {
    return {};
  }
  return typeof param === "string" ? { [key]: param } : { [key]: param.join(",") };
};
export const removeEmptyStings = (param, key) => (isEmpty(param) ? {} : { [key]: param });

// TODO: These codes need to be updated for the incidents search
// TODO: Implement the NoW dashboard patern for cleaning props
export const formatParams = ({
  region = [],
  issue_date_after,
  issue_date_before,
  expiry_date_before,
  expiry_date_after,
  search,
  major,
  ...remainingParams
}) => {
  return {
    ...joinOrRemove(region, "region"),
    // ...joinOrRemove(compliance_code, "compliance_code"),
    // ...joinOrRemove(variance_application_status_code, "variance_application_status_code"),
    ...removeEmptyStings(issue_date_after, "issue_date_after"),
    ...removeEmptyStings(issue_date_before, "issue_date_before"),
    ...removeEmptyStings(expiry_date_before, "expiry_date_before"),
    ...removeEmptyStings(expiry_date_after, "expiry_date_after"),
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
        issue_date_after: this.params.issue_date_after,
        issue_date_before: this.params.issue_date_before,
        expiry_date_before: this.params.expiry_date_before,
        expiry_date_after: this.params.expiry_date_after,
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
    this.props.fetchMineTenureTypes();
    this.props.fetchMineComplianceCodes();
    this.props.fetchRegionOptions();
    this.props.fetchMineCommodityOptions();
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

  // TODO Implement incident search with incident parameter
  renderDataFromURL = (params) => {
    const { region, compliance_code, major, search, ...remainingParams } = queryString.parse(
      params
    );
    this.setState(
      {
        params: {
          region: formatParamStringToArray(region),
          compliance_code: formatParamStringToArray(compliance_code),
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

  // TODO clear incident search parameters
  clearParams = () => {
    this.setState({
      params: {
        region: [],
        major: null,
        search: null,
        issue_date_after: null,
        issue_date_before: null,
        expiry_date_before: null,
        expiry_date_after: null,
      },
    });
  };

  // TODO: This is copy-pasted from variance home page. Endpoint for searching/filtering not ready
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
        page: String.DEFAULT_PAGE,
        // Retain per_page if present
        per_page: prevState.params.per_page ? prevState.params.per_page : String.DEFAULT_PER_PAGE,
      };
      this.props.history.push(router.INCIDENTS_DASHBOARD.dynamicRoute(updatedParams));
      return { params: updatedParams };
    });
  };

  // TODO: This is copy-pasted from variance home page. Endpoint for searching/filtering not ready
  handleIncidentPageChange = (page, per_page) => {
    this.setState({ incidentsLoaded: false });
    const params = { ...this.state.params, page, per_page };
    return this.props.fetchIncidents(params).then(() => {
      this.setState({
        incidentsLoaded: true,
        params,
      });
    });
  };

  // TODO: This is copy-pasted from variance home page. May not be applicaple on the variance page FIX ME
  // handleUpdateVariance = (files, variance, isApproved) => (values) => {
  //   // if the application isApproved, set issue_date to today and set expiry_date 5 years from today,
  //   // unless the user sets a custom expiry.
  //   const { variance_document_category_code } = values;
  //   const issue_date = isApproved ? moment().format("YYYY-MM-DD") : null;
  //   let expiry_date;
  //   if (isApproved) {
  //     expiry_date = values.expiry_date
  //       ? values.expiry_date
  //       : moment(issue_date, "YYYY-MM-DD").add(5, "years");
  //   }
  //   const newValues = { ...values, issue_date, expiry_date };
  //   const mineGuid = variance.mine_guid;
  //   const varianceGuid = variance.variance_guid;
  //   const codeLabel = this.props.complianceCodesHash[variance.compliance_article_id];
  //   this.props.updateVariance({ mineGuid, varianceGuid, codeLabel }, newValues).then(async () => {
  //     await Promise.all(
  //       Object.entries(files).map(([document_manager_guid, document_name]) =>
  //         this.props.addDocumentToVariance(
  //           { mineGuid, varianceGuid },
  //           {
  //             document_manager_guid,
  //             document_name,
  //             variance_document_category_code,
  //           }
  //         )
  //       )
  //     );
  //     this.props.closeModal();
  //     // this.props.fetchVariances(this.state.params).then(() => {
  //     //   this.setState({ variancesLoaded: true });
  //     // });
  //     this.props.fetchIncidents(this.state.params).then(() => {
  //       this.setState({ incidentsLoaded: true });
  //     });
  //   });
  // };

  openViewMineIncidentModal = (event, incident) => {
    event.preventDefault();
    const title = `${incident.mine_name} - Incident No. ${incident.mine_incident_report_no}`;
    this.props.openModal({
      props: {
        title,
        incident,
      },
      isViewOnly: true,
      content: modalConfig.VIEW_MINE_INCIDENT,
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
    console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
    console.log(newIncident);
    console.log(existingIncident);
    // const mine = this.props.mines[this.props.mineGuid];
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
        mineGuid: existingIncident.mine_guid, // this.props.mineGuid,
        followupActionOptions: this.props.followupActionsOptions,
        incidentDeterminationOptions: this.props.incidentDeterminationOptions,
        incidentStatusCodeOptions: this.props.incidentStatusCodeOptions,
        doSubparagraphOptions: this.props.doSubparagraphOptions,
        inspectors: this.props.inspectors,
        clearOnSubmit: true,
      },
      widthSize: "50vw",
      content: modalConfig.MINE_INCIDENT,
    });
  };

  handleFilterChange = (pagination, filters) => {
    const { status } = filters;
    this.setState({ incidentsLoaded: false });
    const params = {
      ...this.state.params,
      variance_application_status_code: status,
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
    console.log("########################### THE STATE AND PROPS ARE:");
    console.log(this.state);
    console.log(this.props);
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <h1>Browse Incidents</h1>
        </div>
        <div className="landing-page__content">
          {/* REMOVE SEARCH FOR NOW. FOCUS ON MOVING THE INCIDENTS TABLE IN */}
          {/* <IncidentsSearch
            handleNameFieldReset={this.handleNameFieldReset}
            initialValues={this.state.params}
            fetchVariances={this.props.fetchVariances}
            handleVarianceSearch={this.handleVarianceSearchDebounced}
            mineRegionOptions={this.props.mineRegionOptions}
            complianceCodes={this.props.getDropdownHSRCMComplianceCodes}
            filterVarianceStatusOptions={this.props.filterVarianceStatusOptions}
          /> */}

          <LoadingWrapper condition={this.state.incidentsLoaded}>
            <IncidentsTable
              incidents={this.props.incidents}
              isApplication={this.state.isApplication}
              handleFilterChange={this.handleFilterChange}
              pageData={this.props.incidentPageData}
              handlePageChange={this.handleVariancePageChange}
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
  doSubparagraphOptions: getDangerousOccurrenceSubparagraphOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchIncidents,
      destroy,
      openModal,
      closeModal,
      fetchRegionOptions,
      fetchMineTenureTypes,
      fetchMineComplianceCodes,
      fetchMineCommodityOptions,
      fetchInspectors,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IncidentsHomePage);
