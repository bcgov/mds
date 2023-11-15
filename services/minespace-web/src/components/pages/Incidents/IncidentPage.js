import React, { useEffect, useState } from "react";
import { bindActionCreators } from "redux";
import { flattenObject } from "@common/utils/helpers";
import { connect, useSelector } from "react-redux";
import { Link, useParams, withRouter } from "react-router-dom";
import {
  change,
  destroy,
  getFormSyncErrors,
  getFormValues,
  isDirty,
  reset,
  submit,
  touch,
} from "redux-form";
import { Col, Row, Steps, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getMineIncident } from "@mds/common/redux/reducers/incidentReducer";
import {
  createMineIncident,
  fetchMineIncident,
  removeDocumentFromMineIncident,
  updateMineIncident,
} from "@mds/common/redux/actionCreators/incidentActionCreator";
import { fetchInspectors } from "@mds/common/redux/actionCreators/staticContentActionCreator";
import { clearMineIncident } from "@mds/common/redux/actions/incidentActions";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import * as FORM from "@/constants/forms";
import Loading from "@/components/common/Loading";
import customPropTypes from "@/customPropTypes";
import {
  FINAL_REPORT_DOCUMENTS_FORM_FIELD,
  INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD,
} from "@/components/Forms/incidents/IncidentForm";
import * as routes from "@/constants/routes";
import { modalConfig } from "@/components/modalContent/config";
import StepForms from "@/components/pages/Incidents/IncidentStepForms";

const propTypes = {
  incident: customPropTypes.incident.isRequired,
  createMineIncident: PropTypes.func.isRequired,
  fetchMineIncident: PropTypes.func.isRequired,
  updateMineIncident: PropTypes.func.isRequired,
  clearMineIncident: PropTypes.func.isRequired,
  removeDocumentFromMineIncident: PropTypes.func.isRequired,
  fetchInspectors: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  destroy: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  touch: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      mineGuid: PropTypes.string,
      mineIncidentGuid: PropTypes.string,
    }),
  }).isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      current: PropTypes.number,
      mine: customPropTypes.mine,
    }),
    hash: PropTypes.string,
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }).isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  formErrors: PropTypes.objectOf(PropTypes.string),
  formIsDirty: PropTypes.bool.isRequired,
};

const defaultProps = {
  formErrors: {},
};

export const sideMenuOptions = [
  { href: "initial-report", title: "Initial Report" },
  { href: "incident-details", title: "Incident Details" },
  { href: "documentation", title: "Documentation" },
  { href: "final-report", title: "Final Report" },
  { href: "ministry-follow-up", title: "Ministry Follow Up" },
];

export const IncidentPage = (props) => {
  const { match, location, incident, formErrors, formIsDirty } = props;

  const formValues = useSelector((state) => getFormValues(FORM.ADD_EDIT_INCIDENT)(state));

  const [current, setCurrent] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [confirmedSubmission, setConfirmedSubmission] = useState(false);
  const [isFinalReviewStage, setIsFinalReviewStage] = useState(false);

  const mineName = formValues?.mine_name ?? location.state?.mine?.mine_name ?? "";
  const title = `Record a Mine Incident - ${mineName}`;
  const subTitle = isEditMode ? "Edit Mine Incident" : "New Notice of a Reportable Incident";
  const errors = Object.keys(flattenObject(formErrors));
  const disabledButton = errors.length > 0;
  const { mineIncidentGuid, mineGuid } = useParams();

  let headerDivProps = {};
  if (isFinalReviewStage) {
    headerDivProps = { className: "padding-lg--left view--header sticky-header" };
  }

  const handleFetchData = () => {
    if (mineGuid && mineIncidentGuid) {
      return props.fetchMineIncident(mineGuid, mineIncidentGuid);
    }
    return Promise.resolve();
  };

  useEffect(() => {
    handleFetchData().then(() => {
      setIsLoaded(true);
      setIsEditMode(Boolean(match.params?.mineIncidentGuid));
      props.fetchInspectors();
    });

    return () => {
      props.clearMineIncident();
      props.destroy(FORM.ADD_EDIT_INCIDENT);
    };
  }, [props.location]);

  useEffect(() => {
    if (isLoaded && !location.state?.current) {
      if (incident && incident?.status_code === "DFT") {
        setCurrent(1);
      } else {
        setCurrent(mineIncidentGuid ? 2 : 0);
      }
    }
  }, [isLoaded]);

  useEffect(() => {
    if (location.state?.current) {
      setCurrent(location.state.current);
    }
  }, [location.state?.current]);

  useEffect(() => {
    if (incident.status_code) {
      setIsFinalReviewStage(incident.status_code !== "DFT");
    }
  }, [incident]);

  const handleCreateMineIncident = (values, isDraft) => {
    setIsLoaded(false);
    const message = isDraft ? "Successfully created a draft incident." : null;
    return props.createMineIncident(match.params?.mineGuid, values, message).then((response) => {
      return response?.data;
    });
  };

  const handleUpdateMineIncident = (values, isDraft) => {
    setIsLoaded(false);

    let message;
    if (isDraft) {
      message = "Successfully updated draft incident.";
    } else if (isFinalReviewStage) {
      message = "Successfully updated incident.";
    } else if (location?.state?.current === 2 && values.status_code !== "DFT") {
      message = "Successfully submitted a new incident.";
    } else {
      message = null;
    }

    return props.updateMineIncident(mineGuid, mineIncidentGuid, values, message).then(() => {
      handleFetchData();
      setIsLoaded(true);
    });
  };

  const formatPayload = (values) => {
    const reportedToInspectorDateSet =
      values?.reported_to_inspector_contact_date && values?.reported_to_inspector_contact_time;
    const johscWorkerRepDateSet =
      values?.johsc_worker_rep_contact_date && values?.johsc_worker_rep_contact_time;
    const johscManagementRepDateSet =
      values?.johsc_management_rep_contact_date && values?.johsc_management_rep_contact_time;
    const updatedDocuments = [
      ...new Map(
        [
          ...(values?.[INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD] || []),
          ...(values?.[FINAL_REPORT_DOCUMENTS_FORM_FIELD] || []),
          ...(values?.documents || []),
        ].map((item) => [item.document_manager_guid, item])
      ).values(),
    ];

    return {
      ...values,
      categories: values?.categories?.map((cat) => cat?.mine_incident_category_code || cat),
      updated_documents: updatedDocuments,
    };
  };

  const handleSaveData = (e, newFormValues, isDraft = false, fromModal = false) => {
    const updatedFormValues = { ...newFormValues };
    if (isDraft || !newFormValues?.status_code) {
      updatedFormValues.status_code = "DFT";
    } else if (
      newFormValues?.status_code === "AFR" &&
      newFormValues.final_report_documents?.length > 0
    ) {
      updatedFormValues.status_code = "FRS";
    }

    if (!fromModal) {
      e.preventDefault();
      props.submit(FORM.ADD_EDIT_INCIDENT);
      props.touch(FORM.ADD_EDIT_INCIDENT);
    }

    if (errors.length === 0 || fromModal) {
      const incidentExists = Boolean(newFormValues?.mine_incident_guid);
      if (!incidentExists) {
        return handleCreateMineIncident(formatPayload(updatedFormValues), isDraft);
      }
      return handleUpdateMineIncident(formatPayload(updatedFormValues), isDraft);
    }
    return null;
  };

  const handleDeleteDocument = ({ mineDocumentGuid }) =>
    props
      .removeDocumentFromMineIncident(mineGuid, mineIncidentGuid, mineDocumentGuid)
      .then(() => handleFetchData());

  const formatInitialValues = () => ({
    ...incident,
    categories: incident?.categories?.map((cat) => cat?.mine_incident_category_code),
    [INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD]: [],
    [FINAL_REPORT_DOCUMENTS_FORM_FIELD]: [],
  });

  const next = () => setCurrent(current + 1);

  const prev = () => setCurrent(current - 1);

  const handleSetConfirmedSubmission = () => setConfirmedSubmission(!confirmedSubmission);

  const openUploadIncidentDocumentsModal = (event, documentTypeCode) => {
    event.preventDefault();
    const modalTitle =
      documentTypeCode === "FIN"
        ? "Upload Final Report"
        : "Upload Supporting Notification Documentation";
    const modalSubTitle =
      documentTypeCode === "FIN"
        ? "Upload Final Incident Report"
        : "Upload Supporting Notification Documentation";

    return props.openModal({
      props: {
        onSubmit: handleSaveData,
        onCancel: props.closeModal,
        mineGuid: incident?.mine_guid,
        title: modalTitle,
        subTitle: modalSubTitle,
        description:
          "Please upload any documents that support this written incident notification. You may return later to upload additional documents as needed.",
        documentTypeCode,
      },
      content: modalConfig.UPLOAD_INCIDENT_DOCUMENT,
    });
  };

  const Forms = StepForms({
    formIsDirty,
    match,
    incident,
    isEditMode,
    current,
    setCurrent,
    confirmedSubmission,
    isFinalReviewStage,
    navigation: { next, prev },
    handlers: {
      save: handleSaveData,
      deleteDocument: handleDeleteDocument,
      openModal: openUploadIncidentDocumentsModal,
    },
    formatInitialValues,
    setConfirmedSubmission: handleSetConfirmedSubmission,
    disabledButton,
  });

  return (
    (isLoaded && (
      <div className="relative margin-large--bottom">
        <div {...headerDivProps}>
          <Row>
            <Col span={24}>
              <Typography.Title className="">{title}</Typography.Title>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Link to={routes.MINE_DASHBOARD.dynamicRoute(mineGuid, "incidents")}>
                <ArrowLeftOutlined className="padding-sm--right" />
                Back to All Incidents
              </Link>
            </Col>
          </Row>
        </div>
        {!isFinalReviewStage && (
          <>
            <Row className="margin-large--bottom">
              <Col span={15}>
                <Typography.Title level={2}>{subTitle}</Typography.Title>
              </Col>
              <Col span={9}>
                <div style={{ display: "inline", float: "right" }}>
                  <p>{Forms[current].buttons}</p>
                </div>
              </Col>
            </Row>
            <Row>
              <Steps current={current} style={{ marginLeft: "8%", marginRight: "8%" }}>
                {Forms.map((step) => (
                  <Steps.Step key={step.title} title={step.title} />
                ))}
              </Steps>
            </Row>
          </>
        )}
        <Row>
          <Col span={24}>
            <div>{Forms[current].content}</div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div style={{ display: "inline", float: "right" }}>
              <p>{Forms[current].buttons}</p>
            </div>
          </Col>
        </Row>
      </div>
    )) || <Loading />
  );
};

IncidentPage.propTypes = propTypes;
IncidentPage.defaultProps = defaultProps;

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
      fetchInspectors,
      submit,
      reset,
      touch,
      change,
      destroy,
      openModal,
      closeModal,
    },
    dispatch
  );

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(IncidentPage));
