import React, { Component } from "react";
import { Steps, Result, Icon } from "antd";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as router from "@/constants/routes";
import {
  fetchNoticeOfWorkApplication,
  createNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWork } from "@/selectors/noticeOfWorkSelectors";
import VerifyNOWMine from "@/components/noticeOfWork/applications/verification/VerifyNOWMine";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import ScrollContentWrapper from "@/components/common/wrappers/ScrollContentWrapper";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";

const { Step } = Steps;

/**
 * @class NoticeOfWorkApplication- contains all information regarding a CORE notice of work application
 */

const propTypes = {
  fetchNoticeOfWorkApplication: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.nowApplication.isRequired,
  createNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
};

export class NoticeOfWorkApplication extends Component {
  state = {
    currentStep: 0,
    isLoaded: false,
    associatedMineGuid: "",
  };

  componentDidMount() {
    // const params = queryString.parse(this.props.location.search);
    const { id } = this.props.match.params;
    this.props.fetchNoticeOfWorkApplication(id).then((data) => {
      const associatedMineGuid = data.data.mine_guid ? data.data.mine_guid : "";
      this.setState({ isLoaded: true, associatedMineGuid });
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
    this.props
      .createNoticeOfWorkApplication(
        this.state.associatedMineGuid,
        this.props.noticeOfWork.application_guid
      )
      .then((data) => {
        return this.props
          .fetchImportedNoticeOfWorkApplication(data.data.application_guid)
          .then(() => {
            console.log("fetched data: state will change with new data");
          });
      });
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
      // To DO: add loading wrapper when fetching new data
      // <LoadingWrapper condition={this.state.isLoaded}>
      <div>
        <NOWSideMenu />
        <ScrollContentWrapper id="application-info" title="Application Info">
          <Result
            icon={<Icon type="smile" theme="twoTone" />}
            title="Great, we have verified the mine details!"
          />
        </ScrollContentWrapper>
        <ScrollContentWrapper id="contacts" title="Contacts">
          <Result
            icon={<Icon type="smile" theme="twoTone" />}
            title="Great, we have verified the mine details!"
          />
        </ScrollContentWrapper>
        <ScrollContentWrapper id="access" title="Access">
          <Result
            icon={<Icon type="smile" theme="twoTone" />}
            title="Great, we have verified the mine details!"
          />
        </ScrollContentWrapper>
        <ScrollContentWrapper id="state-of-land" title="State of Land">
          <Result
            icon={<Icon type="smile" theme="twoTone" />}
            title="Great, we have verified the mine details!"
          />
          <Result
            icon={<Icon type="smile" theme="twoTone" />}
            title="Great, we have verified the mine details!"
          />
          <Result
            icon={<Icon type="smile" theme="twoTone" />}
            title="Great, we have verified the mine details!"
          />
          <Result
            icon={<Icon type="smile" theme="twoTone" />}
            title="Great, we have verified the mine details!"
          />
        </ScrollContentWrapper>
      </div>
      // </LoadingWrapper>
    );
  };

  render() {
    const steps = [
      {
        title: "Verification",
        content: this.renderStepOne(),
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
      <div className="page">
        <div className="steps--header">
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
        </div>
        <div className="steps--content">{steps[this.state.currentStep].content}</div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ noticeOfWork: getNoticeOfWork(state) });

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchNoticeOfWorkApplication,
      createNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
    },
    dispatch
  );

NoticeOfWorkApplication.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NoticeOfWorkApplication);
