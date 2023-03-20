import React from "react";
import { useSelector } from "react-redux";
import { getFormValues } from "redux-form";
import { Button, Col, Popconfirm, Row } from "antd";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { IncidentGetStarted } from "@/components/pages/Incidents/IncidentGetStarted";
import LinkButton from "@/components/common/LinkButton";
import * as routes from "@/constants/routes";
import { ADD_EDIT_INCIDENT } from "@/constants/forms";
import IncidentForm from "@/components/Forms/incidents/IncidentForm";
import ScrollSideMenu from "@/components/common/ScrollSideMenu";
import { sideMenuOptions } from "@/components/pages/Incidents/IncidentPage";
import customPropTypes from "@/customPropTypes";

const renderReviewSubmitStep = (renderReviewProps) => {
  const {
    isFinalReviewStage,
    confirmedSubmission,
    initialValues,
    incident,
    handlers,
    setConfirmedSubmission,
  } = renderReviewProps;
  if (!isFinalReviewStage) {
    return (
      <IncidentForm
        setConfirmedSubmission={setConfirmedSubmission}
        confirmedSubmission={confirmedSubmission}
        initialValues={initialValues}
        isReviewSubmitStage
        isFinalReviewStage={false}
        applicationSubmitted={false}
        incident={incident}
        handlers={{
          deleteDocument: handlers?.handleDeleteDocument,
          save: handlers?.save,
          openUploadIncidentDocumentsModal: handlers?.openModal,
        }}
      />
    );
  }
  return (
    <Row>
      <Col span={6} className="side-menu-container">
        <div className="side-menu sticky-side-menu">
          <ScrollSideMenu
            menuOptions={sideMenuOptions}
            featureUrlRoute={routes.REVIEW_MINE_INCIDENT.hashRoute}
            featureUrlRouteArguments={[incident.mine_guid, incident.mine_incident_guid]}
          />
        </div>
      </Col>
      <Col span={18}>
        <div className="side-menu--content">
          <IncidentForm
            setConfirmedSubmission={setConfirmedSubmission}
            confirmedSubmission={confirmedSubmission}
            initialValues={initialValues}
            isReviewSubmitStage={false}
            isFinalReviewStage={isFinalReviewStage}
            applicationSubmitted
            incident={incident}
            handlers={{
              deleteDocument: handlers?.handleDeleteDocument,
              save: handlers?.save,
              openUploadIncidentDocumentsModal: handlers?.openModal,
            }}
          />
        </div>
      </Col>
    </Row>
  );
};

const propTypes = {
  formIsDirty: PropTypes.bool.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      mineGuid: PropTypes.string,
      mineIncidentGuid: PropTypes.string,
    }),
  }).isRequired,
  incident: customPropTypes.incident.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  confirmedSubmission: PropTypes.bool.isRequired,
  navigation: PropTypes.shape({
    next: PropTypes.func.isRequired,
    previous: PropTypes.func.isRequired,
  }).isRequired,
  handlers: PropTypes.shape({
    save: PropTypes.func.isRequired,
    deleteDocument: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
  }).isRequired,
  formatInitialValues: PropTypes.func.isRequired,
  setConfirmedSubmission: PropTypes.func.isRequired,
  disabledButton: PropTypes.bool.isRequired,
  isFinalReviewStage: PropTypes.bool.isRequired,
};

const StepForms = (props) => {
  const {
    formIsDirty,
    match,
    incident,
    isEditMode,
    confirmedSubmission,
    navigation,
    handlers,
    formatInitialValues,
    setConfirmedSubmission,
    disabledButton,
    isFinalReviewStage,
  } = props;
  const formValues = useSelector((state) => getFormValues(ADD_EDIT_INCIDENT)(state));
  const history = useHistory();

  return [
    {
      title: "Get Started",
      content: <IncidentGetStarted />,
      buttons: [
        <React.Fragment key="step-1-buttons">
          {formIsDirty && (
            <LinkButton
              style={{ marginRight: "15px" }}
              onClick={(e) => handlers?.save(e, formValues, true)}
              title="Save Draft"
            >
              Save Draft
            </LinkButton>
          )}
          {formIsDirty ? (
            <Popconfirm
              placement="topRight"
              title="You have unsaved work, are you sure you want to navigate away from this page?"
              okText="Yes"
              cancelText="No"
            >
              <Button
                id="step-1-cancel"
                type="secondary"
                style={{ marginRight: "15px" }}
                onClick={() =>
                  history.push(
                    routes.MINE_DASHBOARD.dynamicRoute(match.params?.mineGuid, "incidents")
                  )
                }
              >
                Cancel
              </Button>
            </Popconfirm>
          ) : (
            <Button
              id="step-1-cancel"
              type="secondary"
              style={{ marginRight: "15px" }}
              onClick={() =>
                history.push(
                  routes.MINE_DASHBOARD.dynamicRoute(match.params?.mineGuid, "incidents")
                )
              }
            >
              Cancel
            </Button>
          )}
          <Button id="step-1-next" type="primary" onClick={() => navigation?.next()}>
            Create Record
          </Button>
        </React.Fragment>,
      ],
    },
    {
      title: "Create Record",
      content: (
        <IncidentForm
          initialValues={isEditMode ? formatInitialValues(incident) : {}}
          handlers={{
            deleteDocument: handlers?.deleteDocument,
            openUploadIncidentDocumentsModal: handlers?.openModal,
          }}
          onSubmit={handlers?.save}
          setConfirmedSubmission={setConfirmedSubmission}
          confirmedSubmission={confirmedSubmission}
          isFinalReviewStage={false}
          applicationSubmitted={false}
          incident={incident}
        />
      ),
      buttons: [
        <React.Fragment key="step-2-buttons">
          {formIsDirty && (
            <LinkButton
              style={{ marginRight: "15px" }}
              onClick={async (e) => {
                const response = await handlers?.save(e, formValues, true);
                if (response) {
                  const incidentGuid = incident?.mine_incident_guid || response?.mine_incident_guid;
                  const mineGuid = incident?.mine_guid || response?.mine_guid;
                  return history.push({
                    pathname: `${routes.EDIT_MINE_INCIDENT.dynamicRoute(mineGuid, incidentGuid)}`,
                    state: { current: 1 },
                  });
                }
                return null;
              }}
              title="Save Draft"
            >
              Save Draft
            </LinkButton>
          )}
          <Button
            id="step-2-cancel"
            type="secondary"
            style={{ marginRight: "15px" }}
            onClick={() => navigation.prev()}
          >
            Back
          </Button>
          <Button
            id="step-2-next"
            type="primary"
            disabled={disabledButton}
            onClick={async (e) => {
              const response = await handlers?.save(e, formValues);
              const incidentGuid = incident?.mine_incident_guid || response?.mine_incident_guid;
              const mineGuid = incident?.mine_guid || response?.mine_guid;
              if (incidentGuid && mineGuid) {
                return history.push({
                  pathname: `${routes.REVIEW_MINE_INCIDENT.dynamicRoute(mineGuid, incidentGuid)}`,
                  state: { current: 2 },
                });
              }
              return null;
            }}
          >
            Review & Submit
          </Button>
        </React.Fragment>,
      ],
    },
    {
      title: "Review & Submit",
      content: renderReviewSubmitStep({
        isFinalReviewStage,
        confirmedSubmission,
        initialValues: formatInitialValues(incident),
        incident,
        handlers,
        setConfirmedSubmission,
      }),
      buttons: [
        <React.Fragment key="step-3-buttons">
          {incident.status_code === "DFT" && (
            <Button
              id="step-back3"
              type="tertiary"
              className="full-mobile"
              style={{ marginRight: "24px" }}
              onClick={() => {
                history.push({
                  pathname: `${routes.EDIT_MINE_INCIDENT.dynamicRoute(
                    incident?.mine_guid,
                    incident?.mine_incident_guid
                  )}`,
                  state: { current: 1 },
                });
              }}
            >
              Back
            </Button>
          )}
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to submit your final incident? No changes can be made to the original information provided but you will be able to upload additional documentation."
            onConfirm={async (e) => {
              const status_code =
                incident?.documents?.filter((doc) => doc.mine_incident_document_type_code === "FIN")
                  ?.length > 0
                  ? "FRS"
                  : "AFR";
              await handlers?.save(e, {
                ...incident,
                status_code,
              });
              const url = routes.MINE_INCIDENT_SUCCESS.dynamicRoute(
                incident?.mine_guid,
                incident?.mine_incident_guid
              );
              const urlState = { state: { incident } };

              return history.push({ pathname: url, ...urlState });
            }}
            okText="Yes"
            cancelText="No"
          >
            {incident.status_code === "DFT" && (
              <Button id="submit_irt" type="primary" disabled={!confirmedSubmission}>
                Submit Now
              </Button>
            )}
          </Popconfirm>
        </React.Fragment>,
      ],
    },
  ];
};

StepForms.propTypes = propTypes;

export default StepForms;
