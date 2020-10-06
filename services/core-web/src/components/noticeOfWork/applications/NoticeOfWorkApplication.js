import React, { Component } from "react";
import { Prompt } from "react-router-dom";
import { Button, Dropdown, Menu, Popconfirm, Alert, Tabs, Divider } from "antd";
import { DownOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getFormValues, reset, getFormSyncErrors, focus } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { get, isNull, isUndefined, kebabCase } from "lodash";
import {
  fetchImportedNoticeOfWorkApplication,
  fetchOriginalNoticeOfWorkApplication,
  updateNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getDropdownInspectors, getInspectorsHash } from "@common/selectors/partiesSelectors";
import {
  getNoticeOfWork,
  getOriginalNoticeOfWork,
  getNOWReclamationSummary,
} from "@common/selectors/noticeOfWorkSelectors";
import { getMines } from "@common/selectors/mineSelectors";
import {
  getDropdownNoticeOfWorkApplicationStatusOptions,
  getGeneratableNoticeOfWorkApplicationDocumentTypeOptions,
  getNoticeOfWorkApplicationStatusOptionsHash,
} from "@common/selectors/staticContentSelectors";
import { formatDate, flattenObject } from "@common/utils/helpers";
import { clearNoticeOfWorkApplication } from "@common/actions/noticeOfWorkActions";
import { downloadNowDocument } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@common/constants/strings";
import * as Permission from "@/constants/permissions";
import {
  generateNoticeOfWorkApplicationDocument,
  fetchNoticeOfWorkApplicationContextTemplate,
} from "@/actionCreators/documentActionCreator";
import { getDocumentContextTemplate } from "@/reducers/documentReducer";
import * as routes from "@/constants/routes";
import NOWPermitGeneration from "@/components/noticeOfWork/applications/permitGeneration/NOWPermitGeneration";
import ApplicationStepOne from "@/components/noticeOfWork/applications/verification/ApplicationStepOne";
import NOWApplicationReviews from "@/components/noticeOfWork/applications/referals/NOWApplicationReviews";
import CustomPropTypes from "@/customPropTypes";
import ReviewNOWApplication from "@/components/noticeOfWork/applications/review/ReviewNOWApplication";
import NullScreen from "@/components/common/NullScreen";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import NoticeOfWorkPageHeader from "@/components/noticeOfWork/applications/NoticeOfWorkPageHeader";
import * as FORM from "@/constants/forms";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import { modalConfig } from "@/components/modalContent/config";
import { NOWApplicationAdministrative } from "@/components/noticeOfWork/applications/administrative/NOWApplicationAdministrative";
import Loading from "@/components/common/Loading";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

/**
 * @class NoticeOfWorkApplication- contains all information regarding a CORE notice of work application
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication,
  originalNoticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchOriginalNoticeOfWorkApplication: PropTypes.func.isRequired,
  generateNoticeOfWorkApplicationDocument: PropTypes.func.isRequired,
  fetchNoticeOfWorkApplicationContextTemplate: PropTypes.func.isRequired,
  documentContextTemplate: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)),
  reset: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
    replace: PropTypes.func,
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
  noticeOfWorkApplicationStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  generatableApplicationDocuments: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  reclamationSummary: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings)).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  clearNoticeOfWorkApplication: PropTypes.func.isRequired,
  formErrors: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.objectOf(PropTypes.string), PropTypes.string])
  ),
};

const defaultProps = {
  noticeOfWork: {},
  documentContextTemplate: {},
  formErrors: undefined,
};

export class NoticeOfWorkApplication extends Component {
  state = {
    isLoaded: false,
    isTabLoaded: false,
    isMajorMine: null,
    associatedLeadInspectorPartyGuid: "",
    associatedStatus: "",
    isViewMode: true,
    showOriginalValues: false,
    fixedTop: false,
    menuVisible: false,
    adminMenuVisible: false,
    noticeOfWorkPageFromRoute: undefined,
    showNullScreen: false,
    initialPermitGuid: "",
    isNewApplication: false,
    mineGuid: "",
    submitting: false,
    activeTab: "verification",
  };

  count = 1;

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

    if (this.props.match.params.tab) {
      this.setActiveTab(this.props.match.params.tab);
    }

    if (!this.props.history.location.state && !this.props.match.params.id) {
      this.setState({ showNullScreen: true });
    }

    window.addEventListener("scroll", this.handleScroll);
    this.handleScroll();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id !== this.props.match.params.id) {
      this.loadNoticeOfWork(nextProps.match.params.id);
    }

    if (nextProps.match.params.tab !== this.props.match.params.tab) {
      this.setState({ isTabLoaded: false });
      this.setActiveTab(nextProps.match.params.tab);
    }
  }

  componentWillUnmount() {
    this.props.clearNoticeOfWorkApplication();
    window.removeEventListener("scroll", this.handleScroll);
  }

  loadMineInfo = (mineGuid, onMineInfoLoaded = () => {}) => {
    this.props.fetchMineRecordById(mineGuid).then(({ data }) => {
      this.setState({ isMajorMine: data.major_mine_ind, mineGuid: data.mine_guid });
      onMineInfoLoaded();
    });
  };

  setActiveTab = (tab) => {
    this.setState({ activeTab: tab, isTabLoaded: true });
  };

  renderOriginalValues = (path) => {
    const prevValue = get(this.props.originalNoticeOfWork, path);
    const currentValue = get(this.props.noticeOfWork, path);
    // cases for isEdited:
    // activities can be added, prevValue === undefined, currentValue === null, thus prevValue !== currentValue - but field has not been edited.
    // prevValue !== undefined || prevValue !==  null, but currentValue has been changed to null, thus is has been edited
    // prevValue !== currentValue, due to other value changes that are not null or undefined
    const isNewValue = isUndefined(prevValue) && !isNull(currentValue);
    const isPrevValue =
      !isUndefined(prevValue) &&
      !isNull(prevValue) &&
      (isNull(currentValue) || isUndefined(currentValue));
    const hasBeenEdited = isNewValue || isPrevValue;
    const edited = hasBeenEdited && prevValue !== currentValue;
    const getValue = () => {
      if (prevValue === true) {
        return "Yes";
      }
      if (prevValue === false) {
        return "No";
      }
      if (isUndefined(prevValue) || isNull(prevValue)) {
        return Strings.EMPTY_FIELD;
      }
      return prevValue;
    };

    const toolTipValue = { value: getValue(), edited };
    return toolTipValue;
  };

  loadCreatePermitApplication = () => {
    const { mineGuid, permitGuid } = this.props.history.location.state;
    this.loadMineInfo(mineGuid);
    this.setState({
      initialPermitGuid: permitGuid,
      isLoaded: true,
    });
  };

  loadNoticeOfWork = async (id) => {
    this.setState({ isLoaded: false });
    await Promise.all([
      this.props.fetchOriginalNoticeOfWorkApplication(id),
      this.props.fetchImportedNoticeOfWorkApplication(id).then(({ data }) => {
        if (
          data.imported_to_core &&
          data.lead_inspector_party_guid &&
          this.props.match.params.tab === "verification"
        ) {
          this.handleTabChange("technical-review");
        }
        this.loadMineInfo(data.mine_guid, this.setState({ isLoaded: true }));
      }),
    ]);
  };

  handleVisibleChange = (flag) => {
    this.setState({ menuVisible: flag });
  };

  handleAdminVisibleChange = (flag) => {
    this.setState({ adminMenuVisible: flag });
  };

  handleMenuClick = () => {
    this.setState({ menuVisible: false, adminMenuVisible: false });
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

  setLeadInspectorPartyGuid = (leadInspectorPartyGuid) => {
    this.setState({
      associatedLeadInspectorPartyGuid: leadInspectorPartyGuid,
    });
  };

  setStatus = (status) => {
    this.setState({
      associatedStatus: status,
    });
  };

  handleSaveNOWEdit = () => {
    this.setState({ submitting: true });
    const errors = Object.keys(flattenObject(this.props.formErrors));
    if (errors.length > 0) {
      this.focusErrorInput();
    } else {
      const { id } = this.props.match.params;
      this.props
        .updateNoticeOfWorkApplication(
          this.props.formValues,
          this.props.noticeOfWork.now_application_guid
        )
        .then(() => {
          this.props.fetchImportedNoticeOfWorkApplication(id).then(() => {
            this.setState(() => ({
              isViewMode: true,
              submitting: false,
            }));
          });
        });
    }
  };

  focusErrorInput = (skip = false) => {
    const errors = Object.keys(flattenObject(this.props.formErrors));
    if (skip) {
      if (this.count < errors.length) {
        this.count += 1;
      } else if (this.count === errors.length) {
        this.count = 1;
      }
    }
    const errorElement = document.querySelector(`[name="${errors[this.count - 1]}"]`);
    if (errorElement && errorElement.focus) {
      errorElement.focus();
    }
  };

  handleCancelNOWEdit = () => {
    this.props.reset(FORM.EDIT_NOTICE_OF_WORK);
    this.setState((prevState) => ({
      isViewMode: !prevState.isViewMode,
    }));
  };

  handleScroll = () => {
    if (window.pageYOffset > 170 && !this.state.fixedTop) {
      this.setState({ fixedTop: true });
    } else if (window.pageYOffset <= 170 && this.state.fixedTop) {
      this.setState({ fixedTop: false });
    }
  };

  handleChangeNOWMineAndLocation = (values) => {
    const message = values.latitude
      ? "Successfully updated Notice of Work location"
      : "Successfully transferred Notice of Work";
    this.props
      .updateNoticeOfWorkApplication(values, this.props.noticeOfWork.now_application_guid, message)
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
      });
    this.props.closeModal();
  };

  handleUpdateLeadInspector = (finalAction) => {
    if (
      !this.state.associatedLeadInspectorPartyGuid ||
      this.state.associatedLeadInspectorPartyGuid ===
        this.props.noticeOfWork.lead_inspector_party_guid
    ) {
      finalAction();
      return;
    }
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
        this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(() => this.setState({ isLoaded: true }));
      })
      .then(() => finalAction());
  };

  openUpdateLeadInspectorModal = () => {
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

  handleUpdateStatus = (finalAction) => {
    if (
      !this.state.associatedStatus ||
      this.state.associatedStatus === this.props.noticeOfWork.now_application_status_code
    ) {
      finalAction();
      return;
    }

    this.setState({ isLoaded: false });
    this.props
      .updateNoticeOfWorkApplication(
        { now_application_status_code: this.state.associatedStatus },
        this.props.noticeOfWork.now_application_guid,
        `Successfully changed status to ${
          this.props.noticeOfWorkApplicationStatusOptionsHash[this.state.associatedStatus]
        }`
      )
      .then(() => {
        this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(() => this.setState({ isLoaded: true }));
      })
      .then(() => finalAction());
  };

  openUpdateStatusModal = () => {
    this.props.openModal({
      props: {
        title: "Change Application Status",
        now_application_status_code: this.props.noticeOfWork.now_application_status_code,
        setStatus: this.setStatus,
        handleUpdateStatus: (e) => this.handleUpdateStatus(this.props.closeModal, e),
      },
      content: modalConfig.UPDATE_NOW_STATUS,
    });
  };

  openChangeNOWMineModal = (noticeOfWork) => {
    this.props.openModal({
      props: {
        initialValues: {
          mine_guid: noticeOfWork.mine_guid,
        },
        onSubmit: this.handleChangeNOWMineAndLocation,
        title: `Transfer Notice of Work`,
        noticeOfWork,
      },
      width: "75vw",
      content: modalConfig.CHANGE_NOW_MINE,
    });
  };

  openChangeNOWLocationModal = (noticeOfWork) => {
    this.props.openModal({
      props: {
        initialValues: {
          mine_guid: noticeOfWork.mine_guid,
          latitude: noticeOfWork.latitude,
          longitude: noticeOfWork.longitude,
        },
        mineGuid: noticeOfWork.mine_guid,
        onSubmit: this.handleChangeNOWMineAndLocation,
        title: `Edit Location`,
        noticeOfWork,
      },
      width: "75vw",
      content: modalConfig.CHANGE_NOW_LOCATION,
    });
  };

  handleGenerateDocument = (menuItem) => {
    const documentTypeCode = menuItem.key;
    const documentType = this.props.generatableApplicationDocuments[documentTypeCode];
    this.props
      .fetchNoticeOfWorkApplicationContextTemplate(
        documentTypeCode,
        this.props.noticeOfWork.now_application_guid
      )
      .then(() => {
        const initialValues = {};
        this.props.documentContextTemplate.document_template.form_spec.map(
          // eslint-disable-next-line
          (item) => (initialValues[item.id] = item["context-value"])
        );
        this.props.openModal({
          props: {
            initialValues,
            documentType: this.props.documentContextTemplate,
            onSubmit: (values) => this.handleGenerateDocumentFormSubmit(documentType, values),
            title: `Generate ${documentType.description}`,
          },
          width: "75vw",
          content: modalConfig.GENERATE_DOCUMENT,
        });
      });
  };

  handleGenerateDocumentFormSubmit = (documentType, values) => {
    const documentTypeCode = documentType.now_application_document_type_code;
    const newValues = values;
    documentType.document_template.form_spec
      .filter((field) => field.type === "DATE")
      .forEach((field) => {
        newValues[field.id] = formatDate(newValues[field.id]);
      });
    const payload = {
      now_application_guid: this.props.noticeOfWork.now_application_guid,
      template_data: newValues,
    };
    this.props
      .generateNoticeOfWorkApplicationDocument(
        documentTypeCode,
        payload,
        "Successfully Created Document and Attached it to this Notice of Work",
        () => {
          this.setState({ isLoaded: false });
          this.props
            .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
            .then(() => this.setState({ isLoaded: true }));
        }
      )
      .then(() => {
        this.props.closeModal();
      });
  };

  renderPermitGeneration = () => {
    const isAmendment = this.props.noticeOfWork.type_of_application !== "New Permit";
    return (
      <NOWPermitGeneration
        isViewMode={this.state.isViewMode}
        toggleEditMode={this.toggleEditMode}
        fixedTop={this.state.fixedTop}
        noticeOfWork={this.props.noticeOfWork}
        isAmendment={isAmendment}
        documentType={
          isAmendment
            ? this.props.generatableApplicationDocuments.PMA
            : this.props.generatableApplicationDocuments.PMT
        }
        handleGenerateDocumentFormSubmit={this.handleGenerateDocumentFormSubmit}
      />
    );
  };

  handleTabChange = (key) => {
    this.props.history.replace(
      routes.NOTICE_OF_WORK_APPLICATION.dynamicRoute(
        this.props.noticeOfWork.now_application_guid,
        kebabCase(key)
      )
    );
  };

  renderEditModeNav = () => {
    const errorsLength = Object.keys(flattenObject(this.props.formErrors)).length;
    const showErrors = errorsLength > 0 && this.state.submitting;
    return this.state.isViewMode ? (
      <div className="inline-flex block-mobile padding-md between">
        <h2>Technical Review</h2>
        <Dropdown
          overlay={this.menu(true)}
          placement="bottomLeft"
          onVisibleChange={this.handleVisibleChange}
          visible={this.state.menuVisible}
        >
          <Button type="secondary" className="full-mobile">
            Actions
            <DownOutlined />
          </Button>
        </Dropdown>
      </div>
    ) : (
      <div className="center padding-md">
        <div className="inline-flex flex-center block-mobile">
          <Popconfirm
            placement="bottomRight"
            title="You have unsaved changes, Are you sure you want to cancel?"
            onConfirm={this.handleCancelNOWEdit}
            okText="Yes"
            cancelText="No"
          >
            <Button type="secondary" className="full-mobile">
              Cancel
            </Button>
          </Popconfirm>
          {showErrors && (
            <Button
              type="danger"
              className="full-mobile"
              onClick={() => this.focusErrorInput(true)}
            >
              Next Issue
            </Button>
          )}
          <Button type="primary" className="full-mobile" onClick={this.handleSaveNOWEdit}>
            Save
          </Button>
        </div>
        {showErrors && (
          <div className="error">
            <Alert
              message={`You have ${errorsLength} ${
                errorsLength === 1 ? "issue" : "issues"
              } that must be fixed before proceeding`}
              type="error"
              showIcon
              style={{ width: "50vw", margin: "auto", top: "8px" }}
            />
          </div>
        )}
      </div>
    );
  };

  menu = (isReview = false) => {
    const isImported = this.props.noticeOfWork.imported_to_core;
    return (
      <Menu>
        {isReview &&
          isImported &&
          this.props.noticeOfWork.submission_documents.filter(
            (x) => x.filename === "ApplicationForm.pdf"
          ).length > 0 && (
            <Menu.Item key="open-original-application-form" onClick={this.showApplicationForm}>
              Open Original Application Form
            </Menu.Item>
          )}
        {isReview && (
          <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
            <Menu.Item key="edit" onClick={this.toggleEditMode} className="custom-menu-item">
              Edit
            </Menu.Item>
          </AuthorizationWrapper>
        )}
        <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
          <Menu.Item
            key="transfer-to-a-different-mine"
            className="custom-menu-item"
            onClick={() => this.openChangeNOWMineModal(this.props.noticeOfWork)}
          >
            Transfer to a Different Mine
          </Menu.Item>
        </AuthorizationWrapper>
        <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
          <Menu.Item
            key="edit-application-lat-long"
            className="custom-menu-item"
            onClick={() => this.openChangeNOWLocationModal(this.props.noticeOfWork)}
          >
            Edit Application Lat/Long
          </Menu.Item>
        </AuthorizationWrapper>
        {!isReview && (
          <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
            <Menu.Item
              key="edit-application-status"
              className="custom-menu-item"
              onClick={() => this.openUpdateStatusModal()}
            >
              Edit Application Status
            </Menu.Item>
          </AuthorizationWrapper>
        )}
        {this.props.noticeOfWork.lead_inspector_party_guid && (
          <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
            <Menu.Item
              className="custom-menu-item"
              key="change-the-lead-inspector"
              onClick={() => this.openUpdateLeadInspectorModal()}
            >
              Change the Lead Inspector
            </Menu.Item>
          </AuthorizationWrapper>
        )}
        {!isReview && Object.values(this.props.generatableApplicationDocuments).length > 0 && (
          <Menu.SubMenu key="generate-documents" title="Generate Documents">
            {Object.values(this.props.generatableApplicationDocuments)
              .filter(
                ({ now_application_document_type_code }) =>
                  now_application_document_type_code !== "PMA" &&
                  now_application_document_type_code !== "PMT"
              )
              .map((document) => (
                <Menu.Item
                  key={document.now_application_document_type_code}
                  onClick={this.handleGenerateDocument}
                >
                  {document.description}
                </Menu.Item>
              ))}
          </Menu.SubMenu>
        )}
      </Menu>
    );
  };

  renderFixedHeaderClass = () =>
    this.state.fixedTop ? "view--header fixed-scroll" : "view--header";

  render() {
    if (this.state.showNullScreen) {
      return <NullScreen type="unauthorized-page" />;
    }
    if (!this.state.isLoaded) {
      return <Loading />;
    }
    const isImported = this.props.noticeOfWork.imported_to_core;
    const verificationComplete = isImported && this.props.noticeOfWork.lead_inspector_party_guid;
    return (
      <React.Fragment>
        <Prompt
          when={!this.state.isViewMode}
          message={(location, action) => {
            const onTechnicalReview =
              location.pathname.includes("technical-review") &&
              this.props.location.pathname.includes("technical-review");
            const onDraftPermit =
              location.pathname.includes("draft-permit") &&
              this.props.location.pathname.includes("draft-permit");
            const hasEditMode = onTechnicalReview || onDraftPermit;
            // handle user navigating away from technical review/draft permit while in editMode
            if (action === "REPLACE" && !hasEditMode) {
              this.toggleEditMode();
            }
            // if the pathname changes while still on the technicalReview/draftPermit tab (via side navigation), don't prompt user
            return this.props.location.pathname === location.pathname || hasEditMode
              ? true
              : "You have unsaved changes. Are you sure you want to leave without saving?";
          }}
        />
        <div className="page">
          <div className="padding-large">
            <div className="inline-flex between">
              <NoticeOfWorkPageHeader
                noticeOfWork={this.props.noticeOfWork}
                inspectorsHash={this.props.inspectorsHash}
                noticeOfWorkPageFromRoute={this.state.noticeOfWorkPageFromRoute}
                noticeOfWorkApplicationStatusOptionsHash={
                  this.props.noticeOfWorkApplicationStatusOptionsHash
                }
                fixedTop={this.state.fixedTop}
              />
            </div>
          </div>
          <Tabs
            size="large"
            activeKey={this.state.activeTab}
            animated={{ inkBar: true, tabPane: false }}
            className={this.state.fixedTop ? "now-tabs" : "now-tabs"}
            onTabClick={this.handleTabChange}
            style={{ margin: "0" }}
            centered
          >
            <Tabs.TabPane tab="Verification" key="verification">
              <ApplicationStepOne
                isNewApplication={this.state.isNewApplication}
                loadMineData={this.loadMineInfo}
                isMajorMine={this.state.isMajorMine}
                noticeOfWork={this.props.noticeOfWork}
                mineGuid={this.state.mineGuid}
                setLeadInspectorPartyGuid={this.setLeadInspectorPartyGuid}
                handleUpdateLeadInspector={this.handleUpdateLeadInspector}
                loadNoticeOfWork={this.loadNoticeOfWork}
                initialPermitGuid={this.state.initialPermitGuid}
              />
            </Tabs.TabPane>

            <Tabs.TabPane tab="Technical Review" key="technical-review" disabled={!isImported}>
              <>
                <div className="tab-disclaimer">
                  <p className="center">
                    This page is for reviewing and editing the information and documents sent in
                    with a Notice of Work. All information provided by the proponent, and any
                    additional files requested during the application review live here. Use the
                    Actions button to update information about this application.
                  </p>
                </div>
                <Divider style={{ margin: "0" }} />
                <LoadingWrapper condition={this.state.isTabLoaded}>
                  <div>
                    <div className={this.renderFixedHeaderClass()}>{this.renderEditModeNav()}</div>
                    <div className={this.state.fixedTop ? "side-menu--fixed" : "side-menu"}>
                      <NOWSideMenu
                        route={routes.NOTICE_OF_WORK_APPLICATION}
                        noticeOfWorkType={this.props.noticeOfWork.notice_of_work_type_code}
                        tabSection="technical-review"
                      />
                    </div>
                    <div
                      className={
                        this.state.fixedTop ? "view--content with-fixed-top" : "view--content"
                      }
                    >
                      <ReviewNOWApplication
                        reclamationSummary={this.props.reclamationSummary}
                        isViewMode={this.state.isViewMode}
                        noticeOfWorkType={this.props.noticeOfWork.notice_of_work_type_code}
                        initialValues={
                          this.state.showOriginalValues
                            ? this.props.originalNoticeOfWork
                            : this.props.noticeOfWork
                        }
                        noticeOfWork={this.props.noticeOfWork}
                        renderOriginalValues={this.renderOriginalValues}
                      />
                    </div>
                  </div>
                </LoadingWrapper>
              </>
            </Tabs.TabPane>

            <Tabs.TabPane
              tab="Referral/Consultation"
              key="referral-consultation"
              disabled={!verificationComplete}
            >
              <>
                <div className="tab-disclaimer">
                  <p className="center">
                    This page contains basic information about any referrals or consultations
                    related to this application. You can create document packages for reviewers and
                    attach any responses that reviewers send back.
                  </p>
                </div>
                <Divider style={{ margin: "0" }} />
                <LoadingWrapper condition={this.state.isTabLoaded}>
                  <div className={this.renderFixedHeaderClass()}>
                    <h2 className="padding-md">Referral/Consultation</h2>
                  </div>
                  <div className="page__content">
                    <NOWApplicationReviews
                      mineGuid={this.props.noticeOfWork.mine_guid}
                      noticeOfWork={this.props.noticeOfWork}
                    />
                  </div>
                </LoadingWrapper>
              </>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Draft Permit" key="draft-permit" disabled={!verificationComplete}>
              <>
                <div className="tab-disclaimer">
                  <p className="center">
                    This page contains all the information that will appear in the permit when it is
                    issued. The Conditions sections are pre-populated with conditions based on the
                    permit type. You can add or remove any condition.
                  </p>
                </div>
                <Divider style={{ margin: "0" }} />
                <LoadingWrapper condition={this.state.isTabLoaded}>
                  {this.renderPermitGeneration()}
                </LoadingWrapper>
              </>
            </Tabs.TabPane>

            <Tabs.TabPane
              tab="Administrative"
              key="administrative"
              disabled={!verificationComplete}
            >
              <>
                <div className="tab-disclaimer">
                  <p className="center">
                    This page contains information about securities and any internal files relevant
                    to processing the application. It is also where the permit is issued.
                  </p>
                </div>
                <Divider style={{ margin: "0" }} />
                <LoadingWrapper condition={this.state.isTabLoaded}>
                  <div className={this.renderFixedHeaderClass()}>
                    <div className="inline-flex block-mobile padding-md between">
                      <h2>Administrative</h2>
                      <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                        <Dropdown
                          overlay={this.menu(false)}
                          placement="bottomLeft"
                          onVisibleChange={this.handleAdminVisibleChange}
                          visible={this.state.adminMenuVisible}
                        >
                          <Button type="secondary" className="full-mobile">
                            Actions
                            <DownOutlined />
                          </Button>
                        </Dropdown>
                      </AuthorizationWrapper>
                    </div>
                  </div>
                  <div className="page__content">
                    <NOWApplicationAdministrative
                      mineGuid={this.props.noticeOfWork.mine_guid}
                      noticeOfWork={this.props.noticeOfWork}
                      handleSaveNOWEdit={this.handleSaveNOWEdit}
                    />
                  </div>
                </LoadingWrapper>
              </>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  originalNoticeOfWork: getOriginalNoticeOfWork(state),
  formValues: getFormValues(FORM.EDIT_NOTICE_OF_WORK)(state),
  formErrors: getFormSyncErrors(FORM.EDIT_NOTICE_OF_WORK)(state),
  mines: getMines(state),
  inspectors: getDropdownInspectors(state),
  inspectorsHash: getInspectorsHash(state),
  reclamationSummary: getNOWReclamationSummary(state),
  applicationStatusOptions: getDropdownNoticeOfWorkApplicationStatusOptions(state),
  generatableApplicationDocuments: getGeneratableNoticeOfWorkApplicationDocumentTypeOptions(state),
  noticeOfWorkApplicationStatusOptionsHash: getNoticeOfWorkApplicationStatusOptionsHash(state),
  documentContextTemplate: getDocumentContextTemplate(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      fetchOriginalNoticeOfWorkApplication,
      generateNoticeOfWorkApplicationDocument,
      fetchNoticeOfWorkApplicationContextTemplate,
      fetchMineRecordById,
      reset,
      openModal,
      closeModal,
      clearNoticeOfWorkApplication,
      focus,
    },
    dispatch
  );

NoticeOfWorkApplication.propTypes = propTypes;
NoticeOfWorkApplication.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(NoticeOfWorkApplication);
