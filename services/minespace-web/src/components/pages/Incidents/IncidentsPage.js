import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { change, submit, getFormSyncErrors, getFormValues, reset, touch } from "redux-form";
import { Button, Row, Col, Steps, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getProject } from "@common/reducers/projectReducer";
import { createMineIncident } from "@common/actionCreators/incidentActionCreator";
import { clearMineIncident } from "@common/actions/incidentActions";
import * as FORM from "@/constants/forms";
import LinkButton from "@/components/common/LinkButton";
import customPropTypes from "@/customPropTypes";
import { IncidentsGetStarted } from "@/components/pages/Incidents/IncidentsGetStarted";
import * as routes from "@/constants/routes";

const propTypes = {
  // incident: customPropTypes.incident.isRequired,
  createMineIncident: PropTypes.func.isRequired,
  clearMineIncident: PropTypes.func.isRequired,
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
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

const StepForms = (props, next, handleSaveData) => [
  {
    title: "Get Started",
    content: <IncidentsGetStarted />,
    buttons: [
      <React.Fragment key="step-1-buttons">
        <LinkButton
          style={{ marginRight: "15px" }}
          onClick={(e) => handleSaveData(e, ...props.formValues)}
          title="Save Draft"
        >
          Save Draft
        </LinkButton>
        <Link to={routes.MINE_DASHBOARD.dynamicRoute(props.match.params?.mineGuid, "incidents")}>
          <Button
            id="step1-cancel"
            type="secondary"
            style={{ marginRight: "15px" }}
            onClick={() => {}}
          >
            Cancel
          </Button>
        </Link>
        <Button id="step1-next" type="primary" onClick={() => next()}>
          Create Record
        </Button>
      </React.Fragment>,
    ],
  },
  {
    title: "Create Record",
    content: <></>,
    buttons: [],
  },
  {
    title: "Review & Submit",
    content: <></>,
    buttons: [],
  },
];

export class IncidentsPage extends Component {
  state = {
    current: 0,
    // isEditMode: false,
    isLoaded: true, // change to false when fetch & fetch logic is hooked up
  };

  // componentDidMount() {
  //   this.handleFetchData().then(() => {
  //     this.setState((prevState) => ({
  //       current: this.props.location?.state?.current || prevState.current,
  //       isLoaded: true
  //     }));
  //   });
  // }

  componentWillUnmount() {
    this.props.clearMineIncident();
  }

  handleFetchData = () => {
    // Create and integrate action creator for fetching
  };

  handleCreateMineIncident = (values) => {
    return this.props
      .createMineIncident(this.props.match.params?.mineGuid, values)
      .then(() => this.handleFetchData());
  };

  handleSaveData = async (e) => {
    e.preventDefault();
    // Handle create new incident
    // ...
    // Handle edit existing incident
    // ...
  };

  next = () => this.setState((prevState) => ({ current: prevState.current + 1 }));

  prev = () => this.setState((prevState) => ({ current: prevState.current - 1 }));

  render() {
    const mineName = this.props.location.state?.mine?.mine_name || "";
    const title = `Record a Mine Incident - ${mineName}`;
    const incidentSubmitted = false;

    const Forms = StepForms(this.props, this.next, this.handleSaveData);

    return (
      this.state.isLoaded && (
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
              <Typography.Title level={2}>Record New Mine Incident</Typography.Title>
            </Col>
            <Col span={9}>
              {!incidentSubmitted && (
                <div style={{ display: "inline", float: "right" }}>
                  <p>{Forms[this.state.current].buttons}</p>
                </div>
              )}
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
          {!incidentSubmitted && (
            <Row>
              <Col span={24}>
                <div style={{ display: "inline", float: "right" }}>
                  <p>{Forms[this.state.current].buttons}</p>
                </div>
              </Col>
            </Row>
          )}
        </>
      )
    );
  }
}

IncidentsPage.propTypes = propTypes;

const mapStateToProps = (state) => ({
  incident: getProject(state),
  formErrors: getFormSyncErrors(FORM.ADD_EDIT_INCIDENT)(state) || {},
  formValues: getFormValues(FORM.ADD_EDIT_INCIDENT)(state) || {},
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      clearMineIncident,
      createMineIncident,
      submit,
      reset,
      touch,
      change,
    },
    dispatch
  );

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(IncidentsPage));
