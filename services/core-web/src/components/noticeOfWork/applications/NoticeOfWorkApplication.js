import React, { Component } from "react";
import { Prompt } from "react-router-dom";
import { Steps, Button, Dropdown, Menu, Icon } from "antd";
import PropTypes from "prop-types";
import { getFormValues, reset } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as routes from "@/constants/routes";
import {
  fetchImportedNoticeOfWorkApplication,
  fetchOriginalNoticeOfWorkApplication,
  createNoticeOfWorkApplicationProgress,
  updateNoticeOfWorkApplication,
} from "@/actionCreators/noticeOfWorkActionCreator";
import { openModal, closeModal } from "@/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import { fetchMineRecordById } from "@/actionCreators/mineActionCreator";
import { getDropdownInspectors, getInspectorsHash } from "@/selectors/partiesSelectors";
import {
  getNoticeOfWork,
  getOriginalNoticeOfWork,
  getNOWReclamationSummary,
} from "@/selectors/noticeOfWorkSelectors";
import { getMines } from "@/selectors/mineSelectors";
import {
  getDropdownNoticeOfWorkApplicationStatusOptions,
  getNoticeOfWorkApplicationProgressStatusCodeOptions,
} from "@/selectors/staticContentSelectors";
import { clearNoticeOfWorkApplication } from "@/actions/noticeOfWorkActions";
import ApplicationStepOne from "@/components/noticeOfWork/applications/applicationStepOne/ApplicationStepOne";
import NOWApplicationReviews from "@/components/noticeOfWork/applications/referals/NOWApplicationReviews";
import CustomPropTypes from "@/customPropTypes";
import ReviewNOWApplication from "@/components/noticeOfWork/applications/review/ReviewNOWApplication";
import NullScreen from "@/components/common/NullScreen";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import NoticeOfWorkPageHeader from "@/components/noticeOfWork/applications/NoticeOfWorkPageHeader";
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
  createNoticeOfWorkApplicationProgress: PropTypes.func.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchOriginalNoticeOfWorkApplication: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
    location: PropTypes.shape({
      state: PropTypes.shape({ mineGuid: PropTypes.string, permitGuid: PropTypes.string }),
    }),
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    state: PropTypes.shape({
      noticeOfWorkPageFromRoute: CustomPropTypes.noticeOfWorkPageFromRoute,
    }),
  }).isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  formValues: CustomPropTypes.importedNOWApplication.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  inspectorsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  applicationProgressStatusCodes: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string))
    .isRequired,
  reclamationSummary: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings)).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  clearNoticeOfWorkApplication: PropTypes.func.isRequired,
};

const defaultProps = {
  noticeOfWork: { application_progress: [] },
};

export class NoticeOfWorkApplication extends Component {
  state = {
    currentStep: 0,
    isLoaded: false,
    isMajorMine: null,
    associatedLeadInspectorPartyGuid: "",
    isViewMode: true,
    showOriginalValues: false,
    fixedTop: false,
    menuVisible: false,
    buttonValue: "REV",
    buttonLabel: "Technical Review",
    noticeOfWorkPageFromRoute: undefined,
    showNullScreen: false,
    initialPermitGuid: "",
    isNewApplication: false,
    mineGuid: "",
  };

  componentDidMount() {
    if (this.props.location.state && this.props.location.state.noticeOfWorkPageFromRoute) {
      this.setState({
        noticeOfWorkPageFromRoute: this.props.location.state.noticeOfWorkPageFromRoute,
      });
    }
    const isNewApplication = !!this.props.history.location.state;
    if (this.props.match.params.id) {
      this.loadNoticeOfWork(this.props.match.params.id);
    } else if (isNewApplication) {
      this.loadCreatePermitApplication();
      this.setState({ isNewApplication });
    }

    // if users navigate to the route from a hard refresh, or without a mineGuid - show nulllScreen
    if (!this.props.history.location.state && !this.props.match.params.id) {
      this.setState({ showNullScreen: true });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.loadNoticeOfWork(nextProps.match.params.id);
    }
    if (
      nextProps.noticeOfWork &&
      this.props.noticeOfWork.application_progress &&
      nextProps.noticeOfWork.application_progress.length !==
        this.props.noticeOfWork.application_progress.length
    ) {
      this.handleProgressButtonLabels(nextProps.noticeOfWork.application_progress);
    }
  }

  componentWillUnmount() {
    this.props.clearNoticeOfWorkApplication();
  }

  loadMineInfo = (mineGuid) => {
    this.props.fetchMineRecordById(mineGuid).then(({ data }) => {
      this.setState({ isMajorMine: data.major_mine_ind, mineGuid: data.mine_guid });
    });
  };

  loadCreatePermitApplication = () => {
    const { mineGuid, permitGuid } = this.props.history.location.state;
    this.loadMineInfo(mineGuid);
    this.setState({
      initialPermitGuid: permitGuid,
      isLoaded: true,
    });
  };

  loadNoticeOfWork = (id) => {
    this.props.fetchImportedNoticeOfWorkApplication(id).then(({ data }) => {
      this.setState({ isLoaded: true });
      this.loadMineInfo(data.mine_guid);
      this.handleProgressButtonLabels(data.application_progress);
      this.props.fetchOriginalNoticeOfWorkApplication(id);
    });
  };

  handleProgressButtonLabels = (applicationProgress) => {
    const currentStep = applicationProgress.length;
    if (currentStep !== 3 && this.props.applicationProgressStatusCodes.length !== 0) {
      const buttonLabel = this.props.applicationProgressStatusCodes[currentStep + 1].description;
      const buttonValue = this.props.applicationProgressStatusCodes[currentStep + 1]
        .application_progress_status_code;
      this.setState({ buttonLabel, buttonValue, currentStep });
    } else {
      this.setState({ currentStep });
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

  handleStepChange = (currentStep) => {
    this.setState(
      {
        isLoaded: false,
        currentStep,
      },
      () => {
        this.setState({ isLoaded: true });
      }
    );
  };

  setLeadInspectorPartyGuid = (leadInspectorPartyGuid) => {
    this.setState({
      associatedLeadInspectorPartyGuid: leadInspectorPartyGuid,
    });
  };

  handleSaveNOWEdit = () => {
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

  handleChangeNOWMine = (values) => {
    this.props
      .updateNoticeOfWorkApplication(
        values,
        this.props.noticeOfWork.now_application_guid,
        `Successfully transferred Notice of Work`
      )
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
      });
    this.props.closeModal();
  };

  handleUpdateLeadInspector = (finalAction) => {
    this.setState({ isLoaded: false });
    this.props
      .updateNoticeOfWorkApplication(
        { lead_inspector_party_guid: this.state.associatedLeadInspectorPartyGuid },
        this.props.noticeOfWork.now_application_guid,
        `Successfully assigned ${
          this.props.inspectorsHash[this.state.associatedLeadInspectorPartyGuid]
        } as the Lead Inspector`
      )
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
        this.setState({ isLoaded: true });
      })
      .then(() => finalAction());
  };

  openUpdateLeadInspectorModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: "Change Lead Inspector",
        inspectors: this.props.inspectors,
        lead_inspector_party_guid: this.props.noticeOfWork.lead_inspector_party_guid,
        setLeadInspectorPartyGuid: this.setLeadInspectorPartyGuid,
        handleUpdateLeadInspector: (e) => this.handleUpdateLeadInspector(this.props.closeModal, e),
      },
      content: modalConfig.UPDATE_NOW_LEAD_INSPECTOR,
    });
  };

  openChangeNOWMineModal = (event, noticeOfWork) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: {
          mine_guid: noticeOfWork.mine_guid,
        },
        onSubmit: this.handleChangeNOWMine,
        title: `Transfer Notice of Work`,
        noticeOfWork,
      },
      widthSize: "75vw",
      content: modalConfig.CHANGE_NOW_MINE,
    });
  };

  handleProgressChange = (status) => {
    this.setState({ isLoaded: false });
    const { id } = this.props.match.params;
    this.props
      .createNoticeOfWorkApplicationProgress(id, {
        application_progress_status_code: status,
      })
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(id).then(() => {
          this.setState({ isLoaded: true });
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
    return (
      <ApplicationStepOne
        isNewApplication={this.state.isNewApplication}
        loadMineData={this.loadMineData}
        isMajorMine={this.state.isMajorMine}
        noticeOfWork={this.props.noticeOfWork}
        mineGuid={this.state.mineGuid}
        setLeadInspectorPartyGuid={this.setLeadInspectorPartyGuid}
        handleUpdateLeadInspector={this.handleUpdateLeadInspector}
        handleProgressChange={this.handleProgressChange}
        loadNoticeOfWork={this.loadNoticeOfWork}
        initialPermitGuid={this.state.initialPermitGuid}
      />
    );
  };

  renderStepTwo = () => {
    return (
      <ReviewNOWApplication
        reclamationSummary={this.props.reclamationSummary}
        isViewMode={this.state.isViewMode}
        noticeOfWorkType={this.props.noticeOfWork.notice_of_work_type_code}
        initialValues={
          this.state.showOriginalValues ? this.props.originalNoticeOfWork : this.props.noticeOfWork
        }
      />
    );
  };

  renderStepThree = () => {
    return (
      <NOWApplicationReviews
        mineGuid={this.props.noticeOfWork.mine_guid}
        noticeOfWork={this.props.noticeOfWork}
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
    if (this.state.showNullScreen) {
      return <NullScreen type="unauthorized-page" />;
    }
    const isImported = this.props.noticeOfWork.imported_to_core;
    const isDecision =
      this.props.noticeOfWork.application_progress &&
      this.props.noticeOfWork.application_progress.length === 3;
    const steps = {
      0: this.renderStepOne(),
      1: this.renderStepTwo(),
      2: this.renderStepThree(),
      3: <NullScreen type="next-stage" />,
    };
    const menu = (
      <Menu>
        {isImported &&
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
        {isImported && !isDecision && (
          <div className="custom-menu-item">
            <button
              type="button"
              onClick={(event) => this.openChangeNOWMineModal(event, this.props.noticeOfWork)}
            >
              Transfer to a different mine
            </button>
          </div>
        )}
        {isImported && this.props.noticeOfWork.lead_inspector_party_guid && !isDecision && (
          <div className="custom-menu-item">
            <button type="button" onClick={(event) => this.openUpdateLeadInspectorModal(event)}>
              Change the Lead Inspector
            </button>
          </div>
        )}
        {isImported && this.props.noticeOfWork.lead_inspector_party_guid && !isDecision && (
          <div className="custom-menu-item">
            <button
              type="button"
              onClick={() => this.handleProgressChange(this.state.buttonValue)}
            >{`Ready for ${this.state.buttonLabel}`}</button>
          </div>
        )}
      </Menu>
    );

    const headerSteps = [
      <Step
        status={this.renderProgressStatus(0)}
        title={this.state.isMajorMine ? "Initialization" : "Verification"}
      />,
      <Step
        status={this.renderProgressStatus(1)}
        title="Technical Review"
        disabled={this.isStepDisabled(1)}
      />,
      <Step
        status={this.renderProgressStatus(2)}
        title="Referral / Consultation"
        disabled={this.isStepDisabled(2)}
      />,
      <Step
        status={this.renderProgressStatus(3)}
        title="Decision"
        disabled={this.isStepDisabled(3)}
      />,
    ];

    return (
      <React.Fragment>
        <Prompt
          when={!this.state.isViewMode}
          message={(location) => {
            return this.props.location.pathname === location.pathname
              ? true
              : "You have unsaved changes. Are you sure you want to leave without saving?";
          }}
        />
        <div className="page" onScroll={this.handleScroll()} onLoad={this.handleScroll()}>
          <div className={this.state.fixedTop ? "steps--header fixed-scroll" : "steps--header"}>
            <div className="inline-flex between">
              <NoticeOfWorkPageHeader
                noticeOfWork={this.props.noticeOfWork}
                inspectorsHash={this.props.inspectorsHash}
                noticeOfWorkPageFromRoute={this.state.noticeOfWorkPageFromRoute}
                fixedTop={this.state.fixedTop}
              />
            </div>
            <br />
            {this.state.isViewMode ? (
              <div className="inline-flex flex-center block-mobile padding-md--right">
                <Steps
                  current={this.state.currentStep}
                  onChange={this.handleStepChange}
                  type="navigation"
                >
                  {headerSteps}
                </Steps>
                {this.state.isViewMode && (
                  <Dropdown
                    overlay={menu}
                    placement="bottomLeft"
                    onVisibleChange={this.handleVisibleChange}
                    visible={this.state.menuVisible}
                  >
                    <Button type="secondary" className="full-mobile">
                      Actions
                      <Icon type="down" />
                    </Button>
                  </Dropdown>
                )}
              </div>
            ) : (
              <div className="inline-flex flex-center block-mobile">
                <Button type="secondary" className="full-mobile" onClick={this.handleCancelNOWEdit}>
                  Cancel
                </Button>
                <Button type="primary" className="full-mobile" onClick={this.handleSaveNOWEdit}>
                  Save
                </Button>
              </div>
            )}
          </div>
          <LoadingWrapper condition={this.state.isLoaded}>
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
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  originalNoticeOfWork: getOriginalNoticeOfWork(state),
  formValues: getFormValues(FORM.EDIT_NOTICE_OF_WORK)(state),
  mines: getMines(state),
  inspectors: getDropdownInspectors(state),
  inspectorsHash: getInspectorsHash(state),
  reclamationSummary: getNOWReclamationSummary(state),
  applicationStatusOptions: getDropdownNoticeOfWorkApplicationStatusOptions(state),
  applicationProgressStatusCodes: getNoticeOfWorkApplicationProgressStatusCodeOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      fetchOriginalNoticeOfWorkApplication,
      fetchMineRecordById,
      createNoticeOfWorkApplicationProgress,
      reset,
      openModal,
      closeModal,
      clearNoticeOfWorkApplication,
    },
    dispatch
  );

NoticeOfWorkApplication.propTypes = propTypes;
NoticeOfWorkApplication.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NoticeOfWorkApplication);
