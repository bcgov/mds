import React, { Component } from "react";
import { Steps, Result, Icon } from "antd";
import queryString from "query-string";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as router from "@/constants/routes";
import {
  fetchNoticeOfWorkApplication,
  createNoticeOfWorkApplication,
} from "@/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWork } from "@/selectors/noticeOfWorkSelectors";
import VerifyNOWMine from "@/components/noticeOfWork/applications/verification/VerifyNOWMine";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import ScrollContentWrapper from "@/components/common/wrappers/ScrollContentWrapper";

const { Step } = Steps;

/**
 * @class NoticeOfWorkApplication- contains all information regarding a CORE notice of work application
 */

const propTypes = {
  fetchNoticeOfWorkApplication: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.nowApplication.isRequired,
  createNoticeOfWorkApplication: PropTypes.func.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
};

export class NoticeOfWorkApplication extends Component {
  state = {
    currentStep: 0,
    isLoaded: false,
    associatedMineGuid: "",
  };

  componentDidMount() {
    const params = queryString.parse(this.props.location.search);
    const { id } = params;
    this.props.fetchNoticeOfWorkApplication(id).then((data) => {
      this.setState({ isLoaded: true, associatedMineGuid: data.data.mine_guid });
    });
  }

  onChange = (currentStep) => {
    this.setState({ currentStep });
  };

  setMineGuid = (mineGuid) => {
    this.setState({ associatedMineGuid: mineGuid });
  };

  handleUpdateNOW = (currentStep) => {
    this.setState({ currentStep });
    this.props.createNoticeOfWorkApplication(
      this.state.associatedMineGuid,
      this.props.noticeOfWork.application_guid
    );
  };

  renderStepOne = () =>
    this.state.isLoaded && (
      <VerifyNOWMine
        noticeOfWork={this.props.noticeOfWork}
        isNoWLoaded={this.state.isLoaded}
        handleSave={this.handleUpdateNOW}
        setMineGuid={this.setMineGuid}
      />
    );

  renderStepTwo = () => {
    return (
      <ScrollContentWrapper id="blach">
        <Result
          icon={<Icon type="smile" theme="twoTone" />}
          title="Great, we have verified the mine details!"
        />
      </ScrollContentWrapper>
    );
  };

  render() {
    const steps = [
      {
        title: "Verification",
        content: this.renderStepOne(),
      },
      {
        title: "Received Application",
        content: this.renderStepTwo(),
      },
      {
        title: "Technical Review",
        content: this.renderStepTwo(),
      },
      {
        title: "Referral / Consultation",
        content: this.renderStepTwo(),
      },
      {
        title: "Decision",
        content: this.renderStepTwo(),
      },
    ];

    return (
      <div className="page__content">
        <div className="inline-flex between">
          <div>
            <h1>NoW Number: {Strings.EMPTY_FIELD}</h1>
            <Link
              to={router.NOTICE_OF_WORK_INITIAL_APPLICATION.dynamicRoute(
                this.props.noticeOfWork.application_guid
              )}
            >
              Open Original NoW
            </Link>
          </div>
        </div>
        <br />
        <Steps current={this.state.currentStep} onChange={this.onChange}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="steps-content">{steps[this.state.currentStep].content}</div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ noticeOfWork: getNoticeOfWork(state) });

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ fetchNoticeOfWorkApplication, createNoticeOfWorkApplication }, dispatch);

NoticeOfWorkApplication.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NoticeOfWorkApplication);
