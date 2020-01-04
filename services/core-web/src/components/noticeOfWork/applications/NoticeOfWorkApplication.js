import React, { Component } from "react";
import { Steps, Button, Dropdown, Menu, Icon } from "antd";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { getFormValues, reset } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as routes from "@/constants/routes";
import {
  createNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
  fetchOriginalNoticeOfWorkApplication,
  createNoticeOfWorkApplicationProgress,
  updateNoticeOfWorkApplication,
} from "@/actionCreators/noticeOfWorkActionCreator";
import { openModal, closeModal } from "@/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
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
// import SuccessNOWConfirmation from "@/components/noticeOfWork/applications/verification/SuccessNOWConfirmation";
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
  noticeOfWork: CustomPropTypes.importedNOWApplication,
  originalNoticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  fetchNoticeOFWorkApplicationProgressStatusCodes: PropTypes.func.isRequired,
  createNoticeOfWorkApplicationProgress: CustomPropTypes.importedNOWApplication.isRequired,
  createNoticeOfWorkApplication: PropTypes.func.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchOriginalNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchNoticeOFWorkActivityTypeOptions: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      noticeOfWorkPageFromRoute: CustomPropTypes.noticeOfWorkPageFromRoute,
    }),
  }).isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  // the following prop will be used in the future
  // eslint-disable-next-line
  formValues: CustomPropTypes.nowApplication.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  applicationProgressStatusCodes: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings))
    .isRequired,
  reclamationSummary: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings)).isRequired,
  reset: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
  noticeOfWork: { application_progress: [] },
};

export class NoticeOfWorkApplication extends Component {
  state = {
    currentStep: 0,
    isLoaded: false,
    isImported: false,
    isNoWLoaded: false,
    associatedMineGuid: "",
    associatedMineName: "",
    isViewMode: true,
    showOriginalValues: false,
    fixedTop: false,
    menuVisible: false,
    isDecision: false,
    buttonValue: "REV",
    buttonLabel: "Technical Review",
    noticeOfWorkPageFromRoute: undefined,
  };

  componentDidMount() {
    const { id } = this.props.match.params;
    let currentStep = 0;
    this.props.fetchNoticeOFWorkActivityTypeOptions();
    this.props.fetchNoticeOFWorkApplicationProgressStatusCodes();
    this.props.fetchImportedNoticeOfWorkApplication(id).then(({ data }) => {
      const associatedMineGuid = data.mine_guid ? data.mine_guid : "";
      const isImported = data.imported_to_core;
      this.handleProgressButtonLabels(data.application_progress);
      this.props.fetchMineRecordById(associatedMineGuid).then(() => {
        if (isImported) {
          if (data.application_progress.length > 0) {
            const recentStatus = data.application_progress.length;
            currentStep = recentStatus;
          }
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
    this.setState((prevState) => ({
      noticeOfWorkPageFromRoute:
        this.props.location &&
        this.props.location.state &&
        this.props.location.state.noticeOfWorkPageFromRoute
          ? this.props.location.state.noticeOfWorkPageFromRoute
          : prevState.noticeOfWorkPageFromRoute,
    }));
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.noticeOfWork.application_progress &&
      nextProps.noticeOfWork.application_progress.length !==
        this.props.noticeOfWork.application_progress.length
    ) {
      this.handleProgressButtonLabels(nextProps.noticeOfWork.application_progress);
    }
  }

  handleProgressButtonLabels = (applicationProgress) => {
    const currentStep = applicationProgress.length;
    if (currentStep < 3 && this.props.applicationProgressStatusCodes.length !== 0) {
      const buttonLabel = this.props.applicationProgressStatusCodes[currentStep + 1].description;
      const buttonValue = this.props.applicationProgressStatusCodes[currentStep + 1]
        .application_progress_status_code;
      this.setState({ buttonLabel, buttonValue });
    } else {
      this.setState({ isDecision: true });
    }
  };

  handleVisibleChange = (flag) => {
    this.setState({ menuVisible: flag });
  };

  handleMenuClick = () => {
    this.setState({ menuVisible: false });
  };

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
    this.setState((prevState) => ({
      isViewMode: !prevState.isViewMode,
      menuVisible: false,
    }));
  };

  toggleShowOriginalValues = () => {
    this.setState((prevState) => ({ showOriginalValues: !prevState.showOriginalValues }));
  };

  onChange = (currentStep) => {
    this.setState({
      currentStep,
    });
  };

  setMineGuid = (mineGuid, mineName = "") => {
    this.setState({ associatedMineGuid: mineGuid, associatedMineName: mineName });
  };

  handleNOWFormSubmit = () => {
    const { id } = this.props.match.params;
    this.props
      .updateNoticeOfWorkApplication(
        this.props.formValues,
        this.props.noticeOfWork.now_application_guid
      )
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(id);
        this.setState((prevState) => ({
          isViewMode: !prevState.isViewMode,
        }));
      });
  };

  handleCancelNOWEdit = () => {
    this.props.reset(FORM.EDIT_NOTICE_OF_WORK);
    this.setState((prevState) => ({
      isViewMode: !prevState.isViewMode,
    }));
  };

  handleScroll = () => {
    if (window.pageYOffset > "100" && !this.state.fixedTop) {
      this.setState({ fixedTop: true });
    } else if (window.pageYOffset < "100" && this.state.fixedTop) {
      this.setState({ fixedTop: false });
    }
  };

  handleChangeNOWMine = () => {
    this.props
      .updateNoticeOfWorkApplication(
        { mine_guid: this.state.associatedMineGuid },
        this.props.noticeOfWork.now_application_guid,
        `Successfully transferred Notice of Work to ${this.state.associatedMineName}`
      )
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
      });
    this.props.closeModal();
  };

  openChangeNOWMineModal = (event, noticeOfWork) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: {
          mine_guid: noticeOfWork.mine_guid,
        },
        setMineGuid: this.setMineGuid,
        onSubmit: this.handleChangeNOWMine,
        title: `Transfer Notice of Work`,
        noticeOfWork,
      },
      widthSize: "75vw",
      content: modalConfig.CHANGE_NOW_MINE,
    });
  };

  handleUpdateNOW = () => {
    this.setState({ isLoaded: false });
    this.props
      .createNoticeOfWorkApplication(
        this.state.associatedMineGuid,
        this.props.noticeOfWork.now_application_guid
      )
      .then(() => {
        this.setState({ isImported: true });
        return this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(() => {
            this.props.fetchMineRecordById(this.state.associatedMineGuid);
            this.setState({ isNoWLoaded: true, isLoaded: true });
          });
      });
  };

  handleProgressChange = (status) => {
    this.setState({ isNoWLoaded: false, isLoaded: false });
    const { id } = this.props.match.params;
    this.props
      .createNoticeOfWorkApplicationProgress(id, {
        application_progress_status_code: status,
      })
      .then(() => {
        return this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(() => {
            this.props.fetchMineRecordById(this.state.associatedMineGuid);
            this.setState({ isNoWLoaded: true, isLoaded: true });
          });
      });

    const statusIndex = {
      REV: 1,
      REF: 2,
      DEC: 3,
    };
    this.setState({ currentStep: statusIndex[status] });
  };

  renderStepOne = () => {
    const mine = this.props.mines ? this.props.mines[this.state.associatedMineGuid] : {};
    return (
      this.state.isLoaded &&
      ((this.state.isImported && <div>{/* <SuccessNOWConfirmation /> */}</div>) || (
        <VerifyNOWMine
          noticeOfWork={this.props.noticeOfWork}
          isNoWLoaded={this.state.isLoaded}
          handleSave={this.handleUpdateNOW}
          handleProgressChange={this.handleProgressChange}
          setMineGuid={this.setMineGuid}
          currentMine={mine}
          isImported={this.state.isImported}
        />
      ))
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

  renderProgressStatus = (stepIndex) => {
    if (this.props.noticeOfWork.application_progress) {
      const progressLength = this.props.noticeOfWork.application_progress.length;
      if (progressLength === stepIndex) {
        return "process";
      }
      if (progressLength > stepIndex) {
        return "finish";
      }
    }
    return "wait";
  };

  isStepDisabled = (stepIndex) => {
    let isDisabled = true;
    if (this.props.noticeOfWork.application_progress) {
      isDisabled = this.props.noticeOfWork.application_progress.length < stepIndex;
    }
    return isDisabled;
  };

  render() {
    const steps = {
      0: this.renderStepOne(),
      1: this.renderStepTwo(),
      2: <NullScreen type="next-stage" />,
      3: <NullScreen type="next-stage" />,
    };

    const menu = (
      <Menu>
        {this.state.isLoaded &&
          this.props.noticeOfWork.submission_documents.filter(
            (x) => x.filename === "ApplicationForm.pdf"
          ).length > 0 && (
            <div className="custom-menu-item">
              <button type="button" className="full" onClick={this.showApplicationForm}>
                Open Original Application Form
              </button>
            </div>
          )}
        {/* only show the edit button during technical review stage */}
        {this.state.currentStep === 1 && (
          <div className="custom-menu-item">
            <span>
              {this.state.isViewMode && (
                <button type="button" className="full" onClick={this.toggleEditMode}>
                  Edit
                </button>
              )}
            </span>
          </div>
        )}
        {this.state.isImported && !this.state.isDecision && (
          <div className="custom-menu-item">
            <button
              type="button"
              onClick={(event) => this.openChangeNOWMineModal(event, this.props.noticeOfWork)}
            >
              Transfer to a different mine
            </button>
          </div>
        )}
        {this.state.isImported && !this.state.isDecision && (
          <div className="custom-menu-item">
            <button
              type="button"
              onClick={() => this.handleProgressChange(this.state.buttonValue)}
            >{`Ready for ${this.state.buttonLabel}`}</button>
          </div>
        )}
      </Menu>
    );

    return (
      <div className="page" onScroll={this.handleScroll()} onLoad={this.handleScroll()}>
        <div className={this.state.fixedTop ? "steps--header fixed-scroll" : "steps--header"}>
          <div className="inline-flex between">
            <div>
              <h1>NoW Number: {this.props.noticeOfWork.now_number || Strings.EMPTY_FIELD}</h1>
              {this.state.noticeOfWorkPageFromRoute && (
                <Link to={this.state.noticeOfWorkPageFromRoute.route}>
                  <Icon type="arrow-left" style={{ paddingRight: "5px" }} />
                  Back to: {this.state.noticeOfWorkPageFromRoute.title}
                </Link>
              )}
            </div>
            {this.state.isViewMode && (
              <Dropdown
                overlay={menu}
                placement="bottomLeft"
                onVisibleChange={this.handleVisibleChange}
                visible={this.state.menuVisible}
              >
                <Button type="secondary">
                  Actions
                  <Icon type="down" />
                </Button>
              </Dropdown>
            )}
          </div>
          <br />
          {this.state.isViewMode ? (
            <Steps current={this.state.currentStep} onChange={this.onChange} type="navigation">
              <Step status={this.renderProgressStatus(0)} title="Verification" />
              <Step
                status={this.renderProgressStatus(1)}
                title="Technical Review"
                disabled={this.isStepDisabled(1)}
              />
              <Step
                status={this.renderProgressStatus(2)}
                title="Referral / Consultation"
                disabled={this.isStepDisabled(2)}
              />
              <Step
                status={this.renderProgressStatus(3)}
                title="Decision"
                disabled={this.isStepDisabled(3)}
              />
            </Steps>
          ) : (
            <div className="inline-flex flex-center block-mobile">
              <Button type="secondary" className="full-mobile" onClick={this.handleCancelNOWEdit}>
                Cancel
              </Button>
              <Button type="primary" className="full-mobile" onClick={this.handleNOWFormSubmit}>
                Save
              </Button>
            </div>
          )}
        </div>
        <LoadingWrapper condition={this.state.isNoWLoaded}>
          <div>
            <div
              className={this.state.fixedTop ? "side-menu--fixed" : "side-menu"}
              style={
                this.state.noticeOfWorkPageFromRoute && this.state.fixedTop
                  ? { paddingTop: "24px" }
                  : {}
              }
            >
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
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      fetchOriginalNoticeOfWorkApplication,
      fetchMineRecordById,
      fetchNoticeOFWorkActivityTypeOptions,
      createNoticeOfWorkApplicationProgress,
      fetchNoticeOFWorkApplicationProgressStatusCodes,
      reset,
      openModal,
      closeModal,
    },
    dispatch
  );

NoticeOfWorkApplication.propTypes = propTypes;
NoticeOfWorkApplication.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NoticeOfWorkApplication);
