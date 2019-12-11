/* eslint-disable */
import React, { Component } from "react";
import { Steps, Button } from "antd";
import PropTypes from "prop-types";
import { getFormValues } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as routes from "@/constants/routes";
import {
  createNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
  fetchOriginalNoticeOfWorkApplication,
  createNoticeOfWorkApplicationProgress,
} from "@/actionCreators/noticeOfWorkActionCreator";
import { fetchMineRecordById } from "@/actionCreators/mineActionCreator";
import {
  getNoticeOfWork,
  getOriginalNoticeOfWork,
  getNOWReclamationSummary,
} from "@/selectors/noticeOfWorkSelectors";
import {
  fetchNoticeOFWorkActivityTypeOptions,
  fetchNoticeOFWorkApplicationProgressStatusCodes,
} from "@/actionCreators/staticContentActionCreator";
import { getMines } from "@/selectors/mineSelectors";
import { getNoticeOfWorkApplicationProgressStatusCodeOptions } from "@/selectors/staticContentSelectors";
import VerifyNOWMine from "@/components/noticeOfWork/applications/verification/VerifyNOWMine";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import ReviewNOWApplication from "@/components/noticeOfWork/applications/review/ReviewNOWApplication";
import NullScreen from "@/components/common/NullScreen";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import * as FORM from "@/constants/forms";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import { downloadNowDocument } from "@/utils/actionlessNetworkCalls";

const { Step } = Steps;

/**
 * @class NoticeOfWorkApplication- contains all information regarding a CORE notice of work application
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  originalNoticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  fetchNoticeOFWorkApplicationProgressStatusCodes: PropTypes.func.isRequired,
  createNoticeOfWorkApplicationProgress: CustomPropTypes.importedNOWApplication.isRequired,
  createNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchOriginalNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchNoticeOFWorkActivityTypeOptions: PropTypes.func.isRequired,
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
  reclamationSummary: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings)).isRequired,
};

export class NoticeOfWorkApplication extends Component {
  state = {
    currentStep: 0,
    isLoaded: false,
    isImported: false,
    isNoWLoaded: false,
    associatedMineGuid: "",
    isViewMode: true,
    showOriginalValues: false,
    fixedTop: false,
  };

  // componentDidMount() {
  //   const { id } = this.props.match.params;
  //   this.props.  ();
  //   this.props.fetchNoticeOFWorkApplicationProgressStatusCodes();
  //   this.props.fetchOriginalNoticeOfWorkApplication(id);
  //   let currentStep = "VER";
  //   let isImported = false;
  //   let isNowLoaded = false;
  //   this.props.fetchImportedNoticeOfWorkApplication(id).then(({ data }) => {
  //     console.log(data);
  //     const associatedMineGuid = data.mine_guid ? data.mine_guid : "";
  //     // CHECK ASSOCIATED MINE GUID LOGIC
  //     if (data.imported_to_core) {
  //       // this.props.history.push(
  //       //   routes.NOTICE_OF_WORK_APPLICATION.hashRoute(id, "#application-info")
  //       // );
  //       isImported = true;
  //       isNowLoaded = true;
  //       if (data.application_progress.length > 1) {
  //         const recentStatus =
  //           data.application_progress[data.application_progress.length - 1]
  //             .application_progress_status_code;
  //         console.log(recentStatus);
  //         currentStep = recentStatus;
  //       }
  //     }

  //     this.props.fetchMineRecordById(associatedMineGuid).then(() => {
  //       return this.setState({
  //         isLoaded: true,
  //         associatedMineGuid,
  //         currentStep,
  //         isNoWLoaded,
  //         isImported,
  //       });
  //       console.log("fetched a thing???");
  //     });
  //   });
  // }
  componentDidMount() {
    const { id } = this.props.match.params;
    let currentStep = 0;
    this.props.fetchNoticeOFWorkActivityTypeOptions();
    this.props.fetchNoticeOFWorkApplicationProgressStatusCodes();
    this.props.fetchImportedNoticeOfWorkApplication(id).then(({ data }) => {
      const associatedMineGuid = data.mine_guid ? data.mine_guid : "";
      const isImported = data.imported_to_core;
      this.props.fetchMineRecordById(associatedMineGuid).then(() => {
        if (isImported) {
          currentStep = 1;
        }
        if (data.application_progress.length > 1) {
          const recentStatus = data.application_progress.length - 1;
          console.log(recentStatus);
          currentStep = recentStatus;
        }
        this.setState({
          isLoaded: true,
          associatedMineGuid,
          currentStep,
          isNoWLoaded: true,
          isImported,
        });
      });
    });
    this.props.fetchOriginalNoticeOfWorkApplication(id);
  }

  showApplicationForm = () => {
    const document = this.props.noticeOfWork.submission_documents.filter(
      (x) => x.filename === "ApplicationForm.pdf"
    )[0];
    downloadNowDocument(
      document.id,
      this.props.noticeOfWork.now_application_guid,
      document.filename
    );
  };

  toggleEditMode = () => {
    this.setState((prevState) => ({ isViewMode: !prevState.isViewMode }));
  };

  toggleShowOriginalValues = () => {
    this.setState((prevState) => ({ showOriginalValues: !prevState.showOriginalValues }));
  };

  onChange = (currentStep) => {
    this.setState({
      currentStep,
    });
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

  handleUpdateNOW = () => {
    const { id } = this.props.match.params;
    this.setState({ isLoaded: false });
    this.props
      .createNoticeOfWorkApplication(
        this.state.associatedMineGuid,
        this.props.noticeOfWork.now_application_guid
      )
      .then(() => {
        return this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(() => {
            this.props.fetchMineRecordById(this.state.associatedMineGuid);
            this.setState({ isNoWLoaded: true, isLoaded: true, isImported: true });
          });
      });
  };

  handleProgressChange = (currentStep) => {
    const { id } = this.props.match.params;
    this.props.createNoticeOfWorkApplicationProgress(id, {
      application_progress_status_code: "REV",
    });
    this.setState({ currentStep });
  };

  renderStepOne = () => {
    const mine = this.props.mines ? this.props.mines[this.state.associatedMineGuid] : {};
    console.log(this.state.isLoaded);
    return (
      this.state.isLoaded && (
        <VerifyNOWMine
          noticeOfWork={this.props.noticeOfWork}
          isNoWLoaded={this.state.isLoaded}
          handleSave={this.handleUpdateNOW}
          handleProgressChange={this.handleProgressChange}
          setMineGuid={this.setMineGuid}
          currentMine={mine}
          isImported={this.state.isImported}
        />
      )
    );
  };

  renderStepTwo = () => {
    return (
      <ReviewNOWApplication
        reclamationSummary={this.props.reclamationSummary}
        isViewMode={this.state.isViewMode}
        initialValues={
          this.state.showOriginalValues ? this.props.originalNoticeOfWork : this.props.noticeOfWork
        }
      />
    );
  };

  render() {
    const steps = {
      0: this.renderStepOne(),
      1: this.renderStepTwo(),
      2: <NullScreen type="next-stage" />,
      3: <NullScreen type="next-stage" />,
    };
    return (
      <div className="page" onScroll={this.handleScroll()}>
        <div className={this.state.fixedTop ? "steps--header fixed-scroll" : "steps--header"}>
          <div className="inline-flex between">
            <div>
              <h1>NoW Number: {this.props.noticeOfWork.now_number || Strings.EMPTY_FIELD}</h1>
            </div>

            {this.state.isLoaded &&
              this.props.noticeOfWork.submission_documents.filter(
                (x) => x.filename === "ApplicationForm.pdf"
              ).length > 0 && (
                <Button onClick={this.showApplicationForm}>Open Original Application Form</Button>
              )}
            {/* hiding the edit button until fully functionality is implemented */}
            {false && (
              <div>
                {this.state.isViewMode && (
                  <Button onClick={this.toggleShowOriginalValues}>
                    {this.state.showOriginalValues ? `Show Current` : `Show Original`}
                  </Button>
                )}
                {!this.state.showOriginalValues && (
                  <Button onClick={this.toggleEditMode}>
                    {this.state.isViewMode ? "Edit" : "Save"}
                  </Button>
                )}
              </div>
            )}
          </div>
          <br />
          <Steps current={this.state.currentStep} onChange={this.onChange} type="navigation">
            <Step status="VER" title="Verification" />
            <Step status="REV" title="Technical Review" />
            <Step status="REF" title="Referral / Consultation" />
            <Step status="DEC" title="Decision" disabled />
          </Steps>
        </div>
        <LoadingWrapper condition={this.state.isNoWLoaded}>
          <div>
            <div className={this.state.fixedTop ? "side-menu--fixed" : "side-menu"}>
              {this.state.currentStep === 1 && (
                <NOWSideMenu route={routes.NOTICE_OF_WORK_APPLICATION} />
              )}
            </div>
            <div
              className={this.state.fixedTop ? "steps--content with-fixed-top" : "steps--content"}
            >
              {steps[this.state.currentStep]}
            </div>
          </div>
        </LoadingWrapper>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  originalNoticeOfWork: getOriginalNoticeOfWork(state),
  formValues: getFormValues(FORM.EDIT_NOTICE_OF_WORK)(state),
  mines: getMines(state),
  reclamationSummary: getNOWReclamationSummary(state),
  applicationProgressStatusCodes: getNoticeOfWorkApplicationProgressStatusCodeOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      fetchOriginalNoticeOfWorkApplication,
      fetchMineRecordById,
      fetchNoticeOFWorkActivityTypeOptions,
      createNoticeOfWorkApplicationProgress,
      fetchNoticeOFWorkApplicationProgressStatusCodes,
    },
    dispatch
  );

NoticeOfWorkApplication.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NoticeOfWorkApplication);
