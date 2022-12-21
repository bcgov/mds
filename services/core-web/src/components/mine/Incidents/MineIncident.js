import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { flattenObject } from "@common/utils/helpers";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import {
  change,
  submit,
  getFormSyncErrors,
  getFormValues,
  reset,
  touch,
  isDirty,
} from "redux-form";
import { Tag } from "antd";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import moment from "moment";
import { getMineIncident } from "@common/reducers/incidentReducer";
import {
  createMineIncident,
  fetchMineIncident,
  updateMineIncident,
  removeDocumentFromMineIncident,
} from "@common/actionCreators/incidentActionCreator";
import { clearMineIncident } from "@common/actions/incidentActions";
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import * as FORM from "@/constants/forms";
import * as Permission from "@/constants/permissions";
import Loading from "@/components/common/Loading";
import customPropTypes from "@/customPropTypes";
import IncidentForm from "@/components/Forms/incidents/IncidentForm";
import ScrollSideMenu from "@/components/common/ScrollSideMenu";
import * as routes from "@/constants/routes";

const propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  incident: customPropTypes.incident.isRequired,
  createMineIncident: PropTypes.func.isRequired,
  fetchMineIncident: PropTypes.func.isRequired,
  updateMineIncident: PropTypes.func.isRequired,
  clearMineIncident: PropTypes.func.isRequired,
  removeDocumentFromMineIncident: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      mineGuid: PropTypes.string,
      mineIncidentGuid: PropTypes.string,
    }),
  }).isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      isEditMode: PropTypes.bool,
      mineName: customPropTypes.mine,
    }),
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }).isRequired,
  reset: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  formIsDirty: PropTypes.bool.isRequired,
  formErrors: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class MineIncident extends Component {
  state = {
    isEditMode: false,
    isNewIncident: true,
    isLoaded: false,
    fixedTop: false,
  };

  componentDidMount() {
    this.handleFetchData().then(() => {
      this.setState({ isLoaded: true, isEditMode: this.props.location.state?.isEditMode });
    });
    window.addEventListener("scroll", this.handleScroll);
    this.handleScroll();
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    this.props.clearMineIncident();
  }

  handleScroll = () => {
    if (window.pageYOffset > 170 && !this.state.fixedTop) {
      this.setState({ fixedTop: true });
    } else if (window.pageYOffset <= 170 && this.state.fixedTop) {
      this.setState({ fixedTop: false });
    }
  };

  handleFetchData = () => {
    const { mineGuid, mineIncidentGuid } = this.props.match.params;
    if (mineGuid && mineIncidentGuid) {
      this.setState({ isNewIncident: false });
      return this.props.fetchMineIncident(mineGuid, mineIncidentGuid);
    }
    return Promise.resolve();
  };

  handleCreateMineIncident = (formattedValues) => {
    this.setState({ isLoaded: false });
    return this.props
      .createMineIncident(this.props.match.params?.mineGuid, formattedValues)
      .then(({ data: { mine_guid, mine_incident_guid } }) =>
        this.props.history.replace(routes.MINE_INCIDENT.dynamicRoute(mine_guid, mine_incident_guid))
      )
      .then(() => this.handleFetchData())
      .then(() => this.setState({ isLoaded: true }));
  };

  handleCancel = () => this.props.reset(FORM.ADD_EDIT_INCIDENT);

  handleUpdateMineIncident = (formattedValues) => {
    const { mineGuid, mineIncidentGuid } = this.props.match.params;
    this.setState({ isLoaded: false });
    return this.props
      .updateMineIncident(mineGuid, mineIncidentGuid, formattedValues)
      .then(() => this.handleFetchData())
      .then(() => this.setState({ isLoaded: true }));
  };

  handleSaveData = () => {
    const incidentExists = Boolean(this.props.formValues?.mine_incident_guid);
    const errors = Object.keys(flattenObject(this.props.formErrors));
    if (errors.length === 0) {
      if (!incidentExists) {
        return this.handleCreateMineIncident(this.formatPayload(this.props.formValues));
      }
      return this.handleUpdateMineIncident(this.formatPayload(this.props.formValues));
    }
    return null;
  };

  handleDeleteDocument = (params) => {
    if (params?.mineGuid && params?.mineIncidentGuid && params.mineDocumentGuid) {
      return this.props
        .removeDocumentFromMineIncident(
          params?.mineGuid,
          params?.mineIncidentGuid,
          params?.mineDocumentGuid
        )
        .then(() => this.handleFetchData());
    }
    return null;
  };

  formatTimestamp = (dateString, time) => {
    if (!moment.isMoment(time)) {
      return dateString && time && `${dateString} ${time}`;
    }
    return dateString && time && `${dateString} ${time.format("HH:mm")}`;
  };

  formatPayload = (values) => {
    let mineDeterminationTypeCode = null;
    if (typeof values?.mine_determination_type_code === "boolean") {
      mineDeterminationTypeCode = values?.mine_determination_type_code ? "DO" : "NDO";
    }
    const documents = [
      ...values?.initial_incident_documents,
      ...values?.final_report_documents,
      ...values?.internal_ministry_documents,
    ];

    return {
      ...values,
      updated_documents: documents,
      mine_determination_type_code: mineDeterminationTypeCode,
    };
  };

  formatInitialValues = (incident) => ({
    ...incident,
    categories: incident?.categories?.map((cat) => cat?.mine_incident_category_code),
    mine_determination_type_code: incident?.mine_determination_type_code
      ? incident.mine_determination_type_code === "DO"
      : null,
    initial_incident_documents: [],
    final_report_documents: [],
    internal_ministry_documents: [],
  });

  toggleEditMode = () => this.setState((prevState) => ({ isEditMode: !prevState.isEditMode }));

  handleCancelEdit = (isNewIncident) => {
    this.props.reset(FORM.ADD_EDIT_INCIDENT);
    if (!isNewIncident) {
      return this.toggleEditMode();
    }
    return null;
  };

  render() {
    const mineName = this.props.incident?.mine_name || this.props.location?.state?.mineName;
    const { isNewIncident } = this.state;

    return (
      (this.state.isLoaded && (
        <>
          <div className="page">
            <div
              className={
                this.state.fixedTop
                  ? "padding-lg view--header fixed-scroll"
                  : " padding-lg view--header"
              }
              style={{ paddingBottom: 0 }}
            >
              <h1>
                {this.props.incident.mine_incident_guid ? "Mine Incident" : "Create New Incident"}
                &nbsp;
                <span>
                  <Tag title={`Mine: ${mineName}`}>
                    <Link
                      style={{ textDecoration: "none" }}
                      to={routes.MINE_GENERAL.dynamicRoute(this.props.match?.params?.mineGuid)}
                    >
                      <EnvironmentOutlined className="padding-sm--right" />
                      {mineName}
                    </Link>
                  </Tag>
                </span>
              </h1>
              <Link to={routes.MINE_INCIDENTS.dynamicRoute(this.props.match?.params?.mineGuid)}>
                <ArrowLeftOutlined className="padding-sm--right" />
                Back to All Incidents
              </Link>
              <hr />
            </div>
            <div className={this.state.fixedTop ? "side-menu--fixed" : "side-menu"}>
              <ScrollSideMenu
                menuOptions={[
                  { href: "initial-report", title: "Initial Report" },
                  { href: "incident-details", title: "Incident Details" },
                  { href: "documentation", title: "Documentation" },
                  { href: "final-report", title: "Final Report" },
                  { href: "ministry-follow-up", title: "Ministry Follow Up" },
                  { href: "internal-documents", title: "Internal Documents" },
                  { href: "internal-ministry-comments", title: "Comments" },
                ]}
                featureUrlRoute={routes.MINE_INCIDENT.hashRoute}
                featureUrlRouteArguments={[
                  this.props.match.params?.mineGuid,
                  this.props.match.params?.mineIncidentGuid,
                ]}
              />
            </div>
            <div
              className={
                this.state.fixedTop
                  ? "side-menu--content with-fixed-top top-125"
                  : "side-menu--content"
              }
            >
              <IncidentForm
                initialValues={
                  !isNewIncident
                    ? this.formatInitialValues(this.props.incident)
                    : {
                        initial_incident_documents: [],
                        final_report_documents: [],
                        internal_ministry_documents: [],
                      }
                }
                isEditMode={this.state.isEditMode}
                isNewIncident={isNewIncident}
                incident={this.props.incident}
                handlers={{
                  deleteDocument: this.handleDeleteDocument,
                  toggleEditMode: this.toggleEditMode,
                  handleSaveData: this.handleSaveData,
                  handleCancelEdit: this.handleCancelEdit,
                }}
              />
            </div>
          </div>
        </>
      )) || <Loading />
    );
  }
}

MineIncident.propTypes = propTypes;

const mapStateToProps = (state) => ({
  incident: getMineIncident(state) || {},
  formErrors: getFormSyncErrors(FORM.ADD_EDIT_INCIDENT)(state) || {},
  formValues: getFormValues(FORM.ADD_EDIT_INCIDENT)(state) || {},
  formIsDirty: isDirty(FORM.ADD_EDIT_INCIDENT)(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      clearMineIncident,
      createMineIncident,
      fetchMineIncident,
      updateMineIncident,
      removeDocumentFromMineIncident,
      submit,
      reset,
      touch,
      change,
    },
    dispatch
  );

// ENV FLAG FOR MINE INCIDENTS //
export default withRouter(
  AuthorizationGuard(Permission.IN_TESTING)(
    connect(mapStateToProps, mapDispatchToProps)(MineIncident)
  )
);
