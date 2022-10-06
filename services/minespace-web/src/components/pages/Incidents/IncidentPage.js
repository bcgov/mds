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
  destroy,
} from "redux-form";
import { Button, Row, Col, Steps, Typography, Popconfirm } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
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
import LinkButton from "@/components/common/LinkButton";
import Loading from "@/components/common/Loading";
import customPropTypes from "@/customPropTypes";
import { IncidentGetStarted } from "@/components/pages/Incidents/IncidentGetStarted";
import IncidentForm from "@/components/Forms/incidents/IncidentForm";
import * as routes from "@/constants/routes";

const propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  incident: customPropTypes.incident.isRequired,
  createMineIncident: PropTypes.func.isRequired,
  fetchMineIncident: PropTypes.func.isRequired,
  updateMineIncident: PropTypes.func.isRequired,
  clearMineIncident: PropTypes.func.isRequired,
  removeDocumentFromMineIncident: PropTypes.func.isRequired,
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
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  formErrors: PropTypes.objectOf(PropTypes.string),
  // eslint-disable-next-line react/no-unused-prop-types
  formIsDirty: PropTypes.bool.isRequired,
};

const defaultProps = {
  formErrors: {},
};

const StepForms = (
  props,
  state,
  navigation,
  handlers,
  formatInitialValues,
  setConfirmedSubmission,
  disabledButton
) => [
  {
    title: "Get Started",
    content: <IncidentGetStarted />,
    buttons: [
      <React.Fragment key="step-1-buttons">
        {props.formIsDirty && (
          <LinkButton
            style={{ marginRight: "15px" }}
            onClick={(e) => handlers?.save(e, props.formValues, true)}
            title="Save Draft"
          >
            Save Draft
          </LinkButton>
        )}
        {props.formIsDirty ? (
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
                props.history.push(
                  routes.MINE_DASHBOARD.dynamicRoute(props.match.params?.mineGuid, "incidents")
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
              props.history.push(
                routes.MINE_DASHBOARD.dynamicRoute(props.match.params?.mineGuid, "incidents")
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
        initialValues={state.isEditMode ? formatInitialValues(props?.incident) : {}}
        handlers={{ deleteDocument: handlers?.deleteDocument }}
      />
    ),
    buttons: [
      <React.Fragment key="step-2-buttons">
        {props.formIsDirty && (
          <LinkButton
            style={{ marginRight: "15px" }}
            onClick={async (e) => {
              const response = await handlers?.save(e, props.formValues, true);
              const incidentGuid =
                props.incident?.mine_incident_guid || response?.mine_incident_guid;
              const mineGuid = props.incident?.mine_guid || response?.mine_guid;
              return props.history.push({
                pathname: `${routes.EDIT_MINE_INCIDENT.dynamicRoute(mineGuid, incidentGuid)}`,
                state: { current: 1 },
              });
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
            const response = await handlers?.save(e, props.formValues);
            const incidentGuid = props.incident?.mine_incident_guid || response?.mine_incident_guid;
            const mineGuid = props.incident?.mine_guid || response?.mine_guid;
            if (incidentGuid && mineGuid) {
              return props.history.push({
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
    content: (
      <IncidentForm
        setConfirmedSubmission={setConfirmedSubmission}
        confirmedSubmission={state.confirmedSubmission}
        initialValues={formatInitialValues(props?.incident)}
        isReviewSubmitStage
        applicationSubmitted={false}
      />
    ),
    buttons: [
      <React.Fragment key="step-3-buttons">
        {!props.incident.status_code && (
          <Button
            id="step-back3"
            type="tertiary"
            className="full-mobile"
            style={{ marginRight: "24px" }}
            onClick={() => {
              props.history.push({
                pathname: `${routes.EDIT_MINE_INCIDENT.dynamicRoute(
                  props.incident?.mine_guid,
                  props.incident?.mine_incident_guid
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
          title="Are you sure you want to submit your final incident? No changes can be made after submitting."
          onConfirm={async (e) => {
            await handlers?.save(e, {
              ...props.incident,
              status_code: "IRS",
            });
            const url = routes.MINE_INCIDENT_SUCCESS.dynamicRoute(
              props.incident?.mine_guid,
              props.incident?.mine_incident_guid
            );
            const urlState = { state: { incident: props.incident } };

            return props.history.push({ pathname: url, ...urlState });
          }}
          okText="Yes"
          cancelText="No"
        >
          {!props.incident?.status_code && (
            <Button id="submit_irt" type="primary" disabled={!state.confirmedSubmission}>
              Submit Now
            </Button>
          )}
        </Popconfirm>
      </React.Fragment>,
    ],
  },
];

export class IncidentPage extends Component {
  state = {
    current: 0,
    isEditMode: false,
    isLoaded: false,
    confirmedSubmission: false,
  };

  componentDidMount() {
    this.handleFetchData().then(() => {
      this.setState((prevState) => ({
        current: this.props.location?.state?.current || prevState.current,
        isLoaded: true,
        isEditMode: Boolean(this.props.match.params?.mineIncidentGuid),
      }));
    });
  }

  componentWillUnmount() {
    this.props.clearMineIncident();
    this.props.destroy(FORM.ADD_EDIT_INCIDENT);
  }

  handleFetchData = () => {
    const { mineGuid, mineIncidentGuid } = this.props.match.params;
    if (mineGuid && mineIncidentGuid) {
      return this.props.fetchMineIncident(mineGuid, mineIncidentGuid);
    }
    return Promise.resolve();
  };

  handleCreateMineIncident = (values, isDraft) => {
    this.setState({ isLoaded: false });
    const message = isDraft ? "Successfully created a draft incident." : null;
    return this.props
      .createMineIncident(this.props.match.params?.mineGuid, values, message)
      .then((response) => {
        return response?.data;
      });
  };

  handleUpdateMineIncident = (values, isDraft) => {
    const { mineGuid, mineIncidentGuid } = this.props.match.params;
    this.setState({ isLoaded: false });

    let message;
    if (isDraft) {
      message = "Successfully updated draft incident.";
    } else if (this.props.location.state.current === 2) {
      message = "Successfully submitted a new incident.";
    } else {
      message = null;
    }

    return this.props.updateMineIncident(mineGuid, mineIncidentGuid, values, message).then(() => {
      this.handleFetchData();
      this.setState({ isLoaded: true });
    });
  };

  handleSaveData = (e, formValues, isDraft) => {
    e.preventDefault();
    this.props.submit(FORM.ADD_EDIT_INCIDENT);
    this.props.touch(FORM.ADD_EDIT_INCIDENT);
    const errors = Object.keys(flattenObject(this.props.formErrors));
    if (errors.length === 0) {
      const incidentExists = Boolean(formValues?.mine_incident_guid);
      if (!incidentExists) {
        return this.handleCreateMineIncident(this.formatPayload(formValues), isDraft);
      }
      return this.handleUpdateMineIncident(this.formatPayload(formValues), isDraft);
    }
    return null;
  };

  handleDeleteDocument = ({ mineGuid, mineIncidentGuid, mineDocumentGuid }) =>
    this.props
      .removeDocumentFromMineIncident(mineGuid, mineIncidentGuid, mineDocumentGuid)
      .then(() => this.handleFetchData());

  formatTimestamp = (dateString, time) => {
    if (!moment.isMoment(time)) {
      return dateString && time && `${dateString} ${time}`;
    }
    return dateString && time && `${dateString} ${time.format("HH:mm")}`;
  };

  formatPayload = (values) => {
    let mineDeterminationTypeCode = null;
    if (typeof values?.mine_determination_type_code === "boolean") {
      mineDeterminationTypeCode = values.mine_determination_type_code ? "DO" : "NDO";
    }
    return {
      ...values,
      categories: values?.categories?.map((cat) => cat?.mine_incident_category_code || cat),
      updated_documents: values?.initial_notification_documents,
      incident_timestamp: this.formatTimestamp(values?.incident_date, values?.incident_time),
      mine_determination_type_code: mineDeterminationTypeCode,
    };
  };

  formatInitialValues = (incident) => ({
    ...incident,
    categories: incident?.categories?.map((cat) => cat?.mine_incident_category_code),
    incident_date: moment(incident?.incident_timestamp).format("YYYY-MM-DD"),
    incident_time: moment(incident?.incident_timestamp).format("HH:mm"),
    mine_determination_type_code: incident?.mine_determination_type_code
      ? incident.mine_determination_type_code === "DO"
      : null,
  });

  next = () => this.setState((prevState) => ({ current: prevState.current + 1 }));

  prev = () => this.setState((prevState) => ({ current: prevState.current - 1 }));

  setConfirmedSubmission = () =>
    this.setState((prevState) => ({ confirmedSubmission: !prevState.confirmedSubmission }));

  render() {
    const mineName =
      this.props.formValues?.mine_name ?? this.props.location.state?.mine?.mine_name ?? "";
    const title = `Record a Mine Incident - ${mineName}`;
    const subTitle = this.state.isEditMode ? "Edit Mine Incident" : "Record New Mine Incident";
    const errors = Object.keys(flattenObject(this.props.formErrors));
    const disabledButton = errors.length > 0;

    const Forms = StepForms(
      this.props,
      this.state,
      { next: this.next, prev: this.prev },
      { save: this.handleSaveData, deleteDocument: this.handleDeleteDocument },
      this.formatInitialValues,
      this.setConfirmedSubmission,
      disabledButton
    );

    return (
      (this.state.isLoaded && (
        <>
          <Row>
            <Col span={24}>
              <Typography.Title>{title}</Typography.Title>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Link
                to={routes.MINE_DASHBOARD.dynamicRoute(
                  this.props.match.params?.mineGuid,
                  "incidents"
                )}
              >
                <ArrowLeftOutlined className="padding-sm--right" />
                Back to All Incidents
              </Link>
            </Col>
          </Row>
          <br />
          <Row>
            <Col span={15}>
              <Typography.Title level={2}>{subTitle}</Typography.Title>
            </Col>
            <Col span={9}>
              <div style={{ display: "inline", float: "right" }}>
                <p>{Forms[this.state.current].buttons}</p>
              </div>
            </Col>
          </Row>
          <Row>
            <Steps current={this.state.current} style={{ marginLeft: "8%", marginRight: "8%" }}>
              {Forms.map((step) => (
                <Steps.Step key={step.title} title={step.title} />
              ))}
            </Steps>
          </Row>
          <br />
          <Row>
            <Col span={24}>
              <div>{Forms[this.state.current].content}</div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <div style={{ display: "inline", float: "right" }}>
                <p>{Forms[this.state.current].buttons}</p>
              </div>
            </Col>
          </Row>
        </>
      )) || <Loading />
    );
  }
}

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
      submit,
      reset,
      touch,
      change,
      destroy,
    },
    dispatch
  );

// ENV FLAG FOR MINE INCIDENTS //
export default withRouter(
  AuthorizationGuard(Permission.IN_TESTING)(
    connect(mapStateToProps, mapDispatchToProps)(IncidentPage)
  )
);
