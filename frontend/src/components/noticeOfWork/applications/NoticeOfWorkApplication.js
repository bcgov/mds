import React, { Component } from "react";
import { Steps, Button } from "antd";
import PropTypes from "prop-types";
import { getFormValues } from "redux-form";
import { Link } from "react-router-dom";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as router from "@/constants/routes";
import {
  fetchNoticeOfWorkApplication,
  createNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@/actionCreators/noticeOfWorkActionCreator";
import { fetchMineRecordById } from "@/actionCreators/mineActionCreator";
import { getNoticeOfWork } from "@/selectors/noticeOfWorkSelectors";
import { getMines } from "@/selectors/mineSelectors";
import VerifyNOWMine from "@/components/noticeOfWork/applications/verification/VerifyNOWMine";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import ReviewNOWApplication from "@/components/noticeOfWork/applications/review/ReviewNOWApplication";
import NullScreen from "@/components/common/NullScreen";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import * as FORM from "@/constants/forms";

const { Step } = Steps;

/**
 * @class NoticeOfWorkApplication- contains all information regarding a CORE notice of work application
 */

const propTypes = {
  fetchNoticeOfWorkApplication: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.nowApplication.isRequired,
  createNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  // the following prop will be used in the future
  // eslint-disable-next-line
  formValues: CustomPropTypes.nowApplication.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
};

export class NoticeOfWorkApplication extends Component {
  state = {
    currentStep: 0,
    isLoaded: false,
    associatedMineGuid: "",
    isViewMode: true,
    fixedTop: false,
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    const { id } = this.props.match.params;
    this.props.fetchNoticeOfWorkApplication(id).then((data) => {
      const associatedMineGuid = data.data.mine_guid ? data.data.mine_guid : "";
      this.setState({ isLoaded: true, associatedMineGuid });
    });
  }

  toggleEditMode = () => {
    this.setState((prevState) => ({ isViewMode: !prevState.isViewMode }));
  };

  onChange = (currentStep) => {
    this.setState({ currentStep });
  };

  setMineGuid = (mineGuid) => {
    this.setState({ associatedMineGuid: mineGuid });
  };

  handleScroll = () => {
    if (window.pageYOffset > "100" && !this.state.fixedTop) {
      this.setState({ fixedTop: true });
    } else if (window.pageYOffset < "100" && this.state.fixedTop) {
      this.setState({ fixedTop: false });
    }
  };

  handleUpdateNOW = (currentStep) => {
    const { id } = this.props.match.params;
    this.props
      .createNoticeOfWorkApplication(
        this.state.associatedMineGuid,
        this.props.noticeOfWork.application_guid
      )
      .then((data) => {
        return this.props
          .fetchImportedNoticeOfWorkApplication(data.data.application_guid)
          .then(() => {
            this.props.fetchMineRecordById(this.state.associatedMineGuid);
            // updates route to include active section
            this.props.history.push(
              router.NOTICE_OF_WORK_APPLICATION.hashRoute(id, "#application-info")
            );
            this.setState({ currentStep });
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
    const mine = this.props.mines ? this.props.mines[this.state.associatedMineGuid] : {};
    return (
      // To DO: add loading wrapper when fetching new data
      <ReviewNOWApplication
        mine={mine}
        isViewMode={this.state.isViewMode}
        initialValues={this.props.noticeOfWork}
        noticeOfWork={this.props.noticeOfWork}
      />
    );
  };

  render() {
    const { id } = this.props.match.params;
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
        content: <NullScreen type="next-stage" />,
      },
      {
        title: "Decision",
        content: <NullScreen type="next-stage" />,
      },
    ];

    return (
      <div className="page" onScroll={this.handleScroll()}>
        <div className={this.state.fixedTop ? "steps--header fixed-scroll" : "steps--header"}>
          <div className="inline-flex between">
            <div>
              <h1>NoW Number: {Strings.EMPTY_FIELD}</h1>
              {/* update to use application_guid for link once guid is persisted */}
              <Link to={router.NOTICE_OF_WORK_INITIAL_APPLICATION.dynamicRoute(id)}>
                Open Original NoW
              </Link>
            </div>
            {/* hiding the edit button until fully functionality is implemented */}
            {false && (
              <div>
                {this.state.isViewMode ? (
                  <Button onClick={this.toggleEditMode}>Edit</Button>
                ) : (
                  <Button onClick={this.toggleEditMode}>Save</Button>
                )}
              </div>
            )}
          </div>
          <br />
          <Steps current={this.state.currentStep} onChange={this.onChange}>
            {steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
          {this.state.currentStep === 1 && <NOWSideMenu />}
        </div>
        <div className={this.state.fixedTop ? "steps--content with-fixed-top" : "steps--content"}>
          {steps[this.state.currentStep].content}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  formValues: getFormValues(FORM.EDIT_NOTICE_OF_WORK)(state),
  mines: getMines(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchNoticeOfWorkApplication,
      createNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      fetchMineRecordById,
    },
    dispatch
  );

NoticeOfWorkApplication.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NoticeOfWorkApplication);
