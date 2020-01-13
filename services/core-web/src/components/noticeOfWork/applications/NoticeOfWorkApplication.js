import React, { Component } from "react";
import { Prompt } from "react-router-dom";
import { Alert, Steps, Result, Button, Dropdown, Menu, Icon, Row, Col } from "antd";
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
import VerifyNOWMine from "@/components/noticeOfWork/applications/verification/VerifyNOWMine";
import VerifyNOWMineConfirmation from "@/components/noticeOfWork/applications/verification/VerifyNOWMineConfirmation";
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
  createNoticeOfWorkApplicationProgress: CustomPropTypes.importedNOWApplication.isRequired,
  createNoticeOfWorkApplication: PropTypes.func.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchOriginalNoticeOfWorkApplication: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
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
  formValues: CustomPropTypes.nowApplication.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  inspectorsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  applicationProgressStatusCodes: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings))
    .isRequired,
  reclamationSummary: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings)).isRequired,
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
    associatedLeadInspectorPartyGuid: "",
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

  handleUpdateLeadInspector = (finalAction) => {
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
      })
      .then(() => finalAction());
  };

  openUpdateLeadInspectorModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: "Change Lead Inspector",
        inspectors: this.props.inspectors,
        noticeOfWork: this.props.noticeOfWork,
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
        setMineGuid: this.setMineGuid,
        onSubmit: this.handleChangeNOWMine,
        title: `Transfer Notice of Work`,
        noticeOfWork,
      },
      widthSize: "75vw",
      content: modalConfig.CHANGE_NOW_MINE,
    });
  };

  handleConfirmMine = () => {
    this.setState({ isLoaded: false });
    this.props
      .createNoticeOfWorkApplication(
        this.state.associatedMineGuid,
        this.props.noticeOfWork.now_application_guid
      )
      .then(() => {
        return this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(({ data }) => {
            this.props.fetchMineRecordById(this.state.associatedMineGuid);
            this.setState({ isNoWLoaded: true, isLoaded: true, isImported: data.imported_to_core });
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
          .then(({ data }) => {
            this.props.fetchMineRecordById(this.state.associatedMineGuid);
            this.setState({ isNoWLoaded: true, isLoaded: true, isImported: data.imported_to_core });
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
    if (!this.state.isLoaded) {
      return null;
    }

    if (!this.state.isImported) {
      const mine = this.props.mines ? this.props.mines[this.state.associatedMineGuid] : {};
      return (
        <VerifyNOWMine
          noticeOfWork={this.props.noticeOfWork}
          handleConfirmMine={this.handleConfirmMine}
          setMineGuid={this.setMineGuid}
          currentMine={mine}
        />
      );
    }

    if (!this.props.noticeOfWork.lead_inspector_party_guid) {
      return (
        <VerifyNOWMineConfirmation
          inspectors={this.props.inspectors}
          noticeOfWork={this.props.noticeOfWork}
          setLeadInspectorPartyGuid={this.setLeadInspectorPartyGuid}
          handleUpdateLeadInspector={(e) =>
            this.handleUpdateLeadInspector(() => this.handleProgressChange("REV"), e)
          }
        />
      );
    }

    return (
      <Result
        status="success"
        title="Verification Complete!"
        subTitle="You've already completed the Verification step."
        extra={[
          <Row>
            <Col
              lg={{ span: 8, offset: 8 }}
              md={{ span: 10, offset: 7 }}
              sm={{ span: 12, offset: 6 }}
            >
              <Alert
                message="Need to change something?"
                description="You can transfer the Notice of Work to a different mine or change its Lead Inspector by using the Actions dropdown menu above."
                type="info"
                showIcon
              />
            </Col>
          </Row>,
        ]}
      />
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
        {this.state.isImported &&
          this.props.noticeOfWork.lead_inspector_party_guid &&
          !this.state.isDecision && (
            <div className="custom-menu-item">
              <button
                type="button"
                onClick={(event) =>
                  this.openUpdateLeadInspectorModal(event, this.props.noticeOfWork)
                }
              >
                Change the Lead Inspector
              </button>
            </div>
          )}
        {this.state.isImported &&
          this.props.noticeOfWork.lead_inspector_party_guid &&
          !this.state.isDecision && (
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
      <Step status={this.renderProgressStatus(0)} title="Verification" />,
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
                <Steps current={this.state.currentStep} onChange={this.onChange} type="navigation">
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
      createNoticeOfWorkApplication,
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      fetchOriginalNoticeOfWorkApplication,
      fetchMineRecordById,
      createNoticeOfWorkApplicationProgress,
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
