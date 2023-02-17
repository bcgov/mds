import React, { useEffect, useState } from "react";
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
import * as Strings from "@common/constants/strings";
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

export const MineIncident = (props) => {
  const { formValues = {} } = props;
  const [isEditMode, setIsEditMode] = useState(false);
  const [isNewIncident, setIsNewIncident] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fixedTop, setIsFixedTop] = useState(false);

  const handleFetchData = () => {
    const { mineGuid, mineIncidentGuid } = props.match.params;
    if (mineGuid && mineIncidentGuid) {
      setIsNewIncident(false);
      return props.fetchMineIncident(mineGuid, mineIncidentGuid);
    }
    return null;
  };

  const handleScroll = () => {
    if (window.pageYOffset > 170 && !fixedTop) {
      setIsFixedTop(true);
    } else if (window.pageYOffset <= 170 && fixedTop) {
      setIsFixedTop(false);
    }
  };

  const handleCreateMineIncident = (formattedValues) => {
    setIsLoaded(false);
    return props
      .createMineIncident(props.match.params?.mineGuid, formattedValues)
      .then(({ data: { mine_guid, mine_incident_guid } }) =>
        props.history.replace(routes.MINE_INCIDENT.dynamicRoute(mine_guid, mine_incident_guid))
      )
      .then(() => handleFetchData())
      .then(() => setIsLoaded(true));
  };

  const formatTimestamp = (dateString, time) => {
    if (!moment.isMoment(time)) {
      return dateString && time && `${dateString} ${time}`;
    }
    return dateString && time && `${dateString} ${time.format("HH:mm")}`;
  };

  const formatPayload = (values) => {
    const documents = [
      ...values?.initial_incident_documents,
      ...values?.final_report_documents,
      ...values?.internal_ministry_documents,
    ];

    return {
      ...values,
      updated_documents: documents,
      incident_timestamp: formatTimestamp(values?.incident_date, values?.incident_time),
    };
  };

  const handleUpdateMineIncident = (formattedValues) => {
    const { mineGuid, mineIncidentGuid } = props.match.params;
    setIsLoaded(false);
    return props
      .updateMineIncident(mineGuid, mineIncidentGuid, formattedValues)
      .then(() => handleFetchData())
      .then(() => setIsLoaded(true));
  };

  const handleDeleteDocument = (params) => {
    if (params?.mineGuid && params?.mineIncidentGuid && params.mineDocumentGuid) {
      return props
        .removeDocumentFromMineIncident(
          params?.mineGuid,
          params?.mineIncidentGuid,
          params?.mineDocumentGuid
        )
        .then(() => handleFetchData());
    }
    return null;
  };

  const handleSaveData = () => {
    const incidentExists = Boolean(formValues.mine_incident_guid);
    const errors = Object.keys(flattenObject(props.formErrors));

    const { final_report_documents, documents = [] } = formValues;
    const isFinalReport =
      final_report_documents.length > 0 ||
      documents.filter(
        (doc) => doc.mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.final
      ).length > 0;

    if (!formValues.status_code) {
      formValues.status_code = isFinalReport ? "FRS" : "AFR";
    } else if (formValues.status_code === "AFR" && isFinalReport) {
      formValues.status_code = "FRS";
    }

    if (errors.length === 0) {
      if (!incidentExists) {
        return handleCreateMineIncident(formatPayload(formValues));
      }
      return handleUpdateMineIncident(formatPayload(formValues));
    }
    return null;
  };

  const formatInitialValues = (incident) => ({
    ...incident,
    categories: incident?.categories?.map((cat) => cat?.mine_incident_category_code),
    incident_date: moment(incident?.incident_timestamp).format("YYYY-MM-DD"),
    incident_time: moment(incident?.incident_timestamp).format("HH:mm"),
    initial_incident_documents: [],
    final_report_documents: [],
    internal_ministry_documents: [],
  });

  const toggleEditMode = () => setIsEditMode(!isEditMode);

  const handleCancelEdit = () => {
    props.reset(FORM.ADD_EDIT_INCIDENT);
    if (!isNewIncident) {
      return toggleEditMode();
    }
    return null;
  };

  window.addEventListener("scroll", handleScroll);

  useEffect(() => {
    handleFetchData().then(() => {
      setIsLoaded(true);
      setIsEditMode(props.location.state?.isEditMode);

      return () => {
        window.removeEventListener("scroll", handleScroll);
        props.clearMineIncident();
      };
    });
    handleScroll();
  }, [props.location]);

  const mineName = props.incident?.mine_name || props.location?.state?.mineName;

  return isLoaded ? (
    <>
      <div className="page">
        <div
          className={fixedTop ? "padding-lg view--header fixed-scroll" : " padding-lg view--header"}
          style={{ paddingBottom: 0 }}
        >
          <h1>
            {props.incident.mine_incident_guid ? "Mine Incident" : "Create New Incident"}
            &nbsp;
            <span>
              <Tag title={`Mine: ${mineName}`}>
                <Link
                  style={{ textDecoration: "none" }}
                  to={routes.MINE_GENERAL.dynamicRoute(props.match?.params?.mineGuid)}
                >
                  <EnvironmentOutlined className="padding-sm--right" />
                  {mineName}
                </Link>
              </Tag>
            </span>
          </h1>
          <Link to={routes.MINE_INCIDENTS.dynamicRoute(props.match?.params?.mineGuid)}>
            <ArrowLeftOutlined className="padding-sm--right" />
            Back to All Incidents
          </Link>
          <hr />
        </div>
        <div className={fixedTop ? "side-menu--fixed" : "side-menu"}>
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
              props.match.params?.mineGuid,
              props.match.params?.mineIncidentGuid,
            ]}
          />
        </div>
        <div
          className={fixedTop ? "side-menu--content with-fixed-top top-125" : "side-menu--content"}
        >
          <IncidentForm
            initialValues={
              !isNewIncident
                ? formatInitialValues(props.incident)
                : {
                    initial_incident_documents: [],
                    final_report_documents: [],
                    internal_ministry_documents: [],
                  }
            }
            isEditMode={isEditMode}
            isNewIncident={isNewIncident}
            incident={props.incident}
            handlers={{
              deleteDocument: handleDeleteDocument,
              toggleEditMode,
              handleSaveData,
              handleCancelEdit,
            }}
          />
        </div>
      </div>
    </>
  ) : (
    <Loading />
  );
};

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
