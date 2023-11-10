import React, { Component } from "react";
import { Prompt, withRouter } from "react-router-dom";
import { Button, Dropdown, Menu, Popconfirm, Alert, Divider } from "antd";
import { DownOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getFormValues, reset, getFormSyncErrors, submit, hasSubmitFailed } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { get, isNull, isUndefined } from "lodash";
import {
  fetchImportedNoticeOfWorkApplication,
  updateNoticeOfWorkApplication,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { getDropdownInspectors } from "@mds/common/redux/selectors/partiesSelectors";
import {
  getNoticeOfWork,
  getOriginalNoticeOfWork,
  getImportNowSubmissionDocumentsJob,
  getNOWReclamationSummary,
} from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import {
  getGeneratableNoticeOfWorkApplicationDocumentTypeOptions,
  getNoticeOfWorkApplicationStatusOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { flattenObject } from "@common/utils/helpers";
import { downloadNowDocument } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@common/constants/strings";
import * as Permission from "@/constants/permissions";
import { exportNoticeOfWorkApplicationDocument } from "@/actionCreators/documentActionCreator";
import CustomPropTypes from "@/customPropTypes";
import ReviewNOWApplication from "@/components/noticeOfWork/applications/review/ReviewNOWApplication";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import * as FORM from "@/constants/forms";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import NOWTabHeader from "@/components/noticeOfWork/applications/NOWTabHeader";
import AssignInspectors from "@/components/noticeOfWork/applications/verification/AssignInspectors";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import ReviewAdminAmendmentApplication from "@/components/noticeOfWork/applications/review/ReviewAdminAmendmentApplication";
import { EDIT_OUTLINE } from "@/constants/assets";

/**
 * @constant ApplicationTab renders All content under the Application Tab
 */

const propTypes = {
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  exportNoticeOfWorkApplicationDocument: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  originalNoticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any).isRequired,
  formValues: CustomPropTypes.importedNOWApplication.isRequired,
  formErrors: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.objectOf(PropTypes.string), PropTypes.string])
  ).isRequired,
  fixedTop: PropTypes.bool.isRequired,
  submitFailed: PropTypes.bool.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  reclamationSummary: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings)).isRequired,
  generatableApplicationDocuments: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    state: PropTypes.shape({
      applicationPageFromRoute: CustomPropTypes.applicationPageFromRoute,
    }),
  }).isRequired,
  isNoticeOfWorkTypeDisabled: PropTypes.bool,
  showActionsAndProgress: PropTypes.bool,
};
const defaultProps = {
  isNoticeOfWorkTypeDisabled: true,
  showActionsAndProgress: true,
};

export class ApplicationTab extends Component {
  state = {
    isInspectorsLoaded: true,
    isViewMode: true,
    menuVisible: false,
    submitting: false,
    submitted: false,
    exportingNow: false,
  };

  count = 1;

  toggleEditMode = () => {
    this.setState((prevState) => ({
      isViewMode: !prevState.isViewMode,
      menuVisible: false,
    }));
  };

  handleMenuClick = () => {
    this.setState({ menuVisible: false });
  };

  exportNowDocument = (documentType) => {
    const documentTypeCode = documentType.now_application_document_type_code;

    const payload = {
      now_application_guid: this.props.noticeOfWork.now_application_guid,
    };
    return this.props.exportNoticeOfWorkApplicationDocument(
      documentTypeCode,
      payload,
      `Successfully exported ${documentType.description} for this Notice of Work`
    );
  };

  // eslint-disable-next-line consistent-return
  handleSaveNOWEdit = (endEditSession) => {
    this.setState({ submitted: true });
    const errors = Object.keys(flattenObject(this.props.formErrors));
    if (errors.length > 0) {
      this.focusErrorInput();
    } else {
      this.setState({ submitting: true });
      return this.props
        .updateNoticeOfWorkApplication(
          this.props.formValues,
          this.props.noticeOfWork.now_application_guid
        )
        .then(() => {
          this.props
            .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
            .then(() => {
              this.setState(() => ({
                isViewMode: endEditSession,
                submitted: false,
              }));
              if (!endEditSession) {
                // if save & continue - update NoW/form state to reflect changes committed to db
                this.forceUpdate();
              }
            });
        })
        .finally(() => {
          this.setState(() => ({
            submitting: false,
          }));
        });
    }
  };

  focusErrorInput = (skip = false) => {
    this.props.submit(FORM.EDIT_NOTICE_OF_WORK);
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

  handleExportNowDocument = (documentTypeCode) => {
    const documentType = this.props.generatableApplicationDocuments[documentTypeCode];
    this.setState({ exportingNow: true });
    return this.exportNowDocument(documentType, this.props.noticeOfWork)
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
      })
      .finally(() => this.setState({ exportingNow: false }));
  };

  handleVisibleChange = (flag) => {
    this.setState({ menuVisible: flag });
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

  menu = () => {
    const isImported = this.props.noticeOfWork.imported_to_core;
    return (
      <Menu>
        <>
          {isImported &&
            this.props.noticeOfWork.submission_documents.filter(
              (x) => x.filename === "ApplicationForm.pdf"
            ).length > 0 && (
              <Menu.Item
                key="open-original-application-form"
                className="custom-menu-item"
                onClick={this.showApplicationForm}
              >
                Original Application
              </Menu.Item>
            )}
        </>
        <>
          {Object.values(this.props.generatableApplicationDocuments)
            .filter(
              ({ now_application_document_type_code }) =>
                now_application_document_type_code === "NTR"
            )
            .map((document) => {
              return (
                <Menu.Item
                  key={document.now_application_document_type_code}
                  className="custom-menu-item"
                  onClick={() =>
                    this.handleExportNowDocument(document.now_application_document_type_code)
                  }
                  disabled={this.state.exportingNow}
                >
                  Edited Application
                </Menu.Item>
              );
            })}
        </>
      </Menu>
    );
  };

  handleCancelNOWEdit = () => {
    if (this.props.formValues.contacts.length > 0) {
      // eslint-disable-next-line array-callback-return
      this.props.formValues.contacts.map((contact) => delete contact.state_modified);
    }

    this.props.reset(FORM.EDIT_NOTICE_OF_WORK);
    this.setState((prevState) => ({
      isViewMode: !prevState.isViewMode,
    }));
  };

  renderEditModeNav = () => {
    const errorsLength = Object.keys(flattenObject(this.props.formErrors)).length;
    const showErrors = errorsLength > 0 && this.state.submitted && this.props.submitFailed;
    const isNoWApplication = this.props.noticeOfWork.application_type_code === "NOW";
    return (
      <NOWTabHeader
        showProgressButton={this.props.noticeOfWork.lead_inspector_party_guid && isNoWApplication}
        tab="REV"
        showActionsAndProgress={this.props.showActionsAndProgress}
        tabActions={
          this.props.noticeOfWork.lead_inspector_party_guid && (
            <>
              <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="REV">
                <Button type="secondary" onClick={this.toggleEditMode}>
                  <img alt="EDIT_OUTLINE" className="padding-sm--right" src={EDIT_OUTLINE} />
                  Edit
                </Button>
              </NOWActionWrapper>
              {isNoWApplication && (
                <Dropdown
                  overlay={this.menu(true)}
                  placement="bottomLeft"
                  onVisibleChange={this.handleVisibleChange}
                  visible={this.state.menuVisible}
                >
                  <Button type="secondary" className="full-mobile">
                    Download
                    <DownOutlined />
                  </Button>
                </Dropdown>
              )}
            </>
          )
        }
        tabEditActions={
          <div className="center">
            <Popconfirm
              placement="bottomRight"
              title="You have unsaved changes. Are you sure you want to cancel?"
              onConfirm={this.handleCancelNOWEdit}
              okText="Yes"
              cancelText="No"
              disabled={this.state.submitting}
            >
              <Button type="secondary" className="full-mobile" disabled={this.state.submitting}>
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
            <Button
              type="tertiary"
              className="full-mobile"
              onClick={() => this.handleSaveNOWEdit(false)}
              loading={this.state.submitting}
            >
              Save & Continue
            </Button>
            <Button
              type="primary"
              className="full-mobile"
              onClick={() => this.handleSaveNOWEdit(true)}
              loading={this.state.submitting}
            >
              Save
            </Button>
            {showErrors && (
              <Alert
                message={`You have ${errorsLength} ${
                  errorsLength === 1 ? "issue" : "issues"
                } that must be fixed before proceeding.`}
                type="error"
                showIcon
              />
            )}
          </div>
        }
        tabName="Application"
        fixedTop={this.props.fixedTop}
        noticeOfWork={this.props.noticeOfWork}
        isEditMode={!this.state.isViewMode}
      />
    );
  };

  renderOriginalValues = (path, currentPath = null) => {
    const prevValue = get(this.props.originalNoticeOfWork, path);
    const currentValue = get(this.props.noticeOfWork, currentPath || path);
    // cases for isEdited:
    // activities can be added, prevValue === undefined, currentValue === null, thus prevValue !== currentValue - but field has not been edited.
    // prevValue !== undefined || prevValue !==  null, but currentValue has been changed to null, thus is has been edited
    // prevValue !== currentValue, due to other value changes that are not null or undefined
    const isNewValue = isUndefined(prevValue) && !isNull(currentValue);
    const isPrevValue = !isUndefined(prevValue) && !isNull(prevValue);
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

  handleUpdateInspectors = (values) => {
    this.setState({ isInspectorsLoaded: false });
    return this.props
      .updateNoticeOfWorkApplication(
        values,
        this.props.noticeOfWork.now_application_guid,
        "Successfully updated the assigned inspectors"
      )
      .then(() => {
        this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(() => this.setState({ isInspectorsLoaded: true }));
      });
  };

  handleResetNOWForm = () => {
    this.props.reset(FORM.EDIT_NOTICE_OF_WORK);
  };

  render() {
    const isImported = this.props.noticeOfWork.imported_to_core;
    const isNoWApplication = this.props.noticeOfWork.application_type_code === "NOW";

    return (
      <React.Fragment>
        <Prompt
          style={{ backgroundColor: "red !important" }}
          when={!this.state.isViewMode}
          message={(location, action) => {
            const onTechnicalReview =
              location.pathname.includes("application") &&
              this.props.location.pathname.includes("application");
            // handle user navigating away from technical review/draft permit while in editMode
            if (action === "REPLACE" && !onTechnicalReview) {
              this.toggleEditMode();
              this.handleResetNOWForm();
            }
            // if the pathname changes while still on the technicalReview tab (via side navigation), don't prompt user
            return this.props.location.pathname === location.pathname && onTechnicalReview
              ? true
              : "You have unsaved changes. Are you sure you want to leave without saving?";
          }}
        />
        {this.renderEditModeNav()}
        <div className={this.props.fixedTop ? "side-menu--fixed" : "side-menu"}>
          <NOWSideMenu tabSection="application" />
        </div>
        <div
          className={
            this.props.fixedTop ? "side-menu--content with-fixed-top" : "side-menu--content"
          }
        >
          {isImported && !this.props.noticeOfWork.lead_inspector_party_guid && (
            <>
              <ScrollContentWrapper id="inspectors" title="Assign Inspectors" isActive>
                <AssignInspectors
                  inspectors={this.props.inspectors}
                  noticeOfWork={this.props.noticeOfWork}
                  handleUpdateInspectors={this.handleUpdateInspectors}
                  title="Assign Inspectors"
                  isEditMode
                  isLoaded={this.state.isInspectorsLoaded}
                />
              </ScrollContentWrapper>
              <Divider />
            </>
          )}
          {isNoWApplication ? (
            <ReviewNOWApplication
              reclamationSummary={this.props.reclamationSummary}
              isViewMode={this.state.isViewMode}
              noticeOfWorkType={this.props.noticeOfWork.notice_of_work_type_code}
              initialValues={this.props.noticeOfWork}
              noticeOfWork={this.props.noticeOfWork}
              importNowSubmissionDocumentsJob={this.props.importNowSubmissionDocumentsJob}
              renderOriginalValues={this.renderOriginalValues}
              isPreLaunch={this.props.originalNoticeOfWork.is_pre_launch}
              isNoticeOfWorkTypeDisabled={this.props.isNoticeOfWorkTypeDisabled}
            />
          ) : (
            <ReviewAdminAmendmentApplication
              reclamationSummary={this.props.reclamationSummary}
              isViewMode={this.state.isViewMode}
              noticeOfWorkType={this.props.noticeOfWork.notice_of_work_type_code}
              initialValues={this.props.noticeOfWork}
              noticeOfWork={this.props.noticeOfWork}
              renderOriginalValues={this.renderOriginalValues}
              isPreLaunch={this.props.originalNoticeOfWork.is_pre_launch}
              isNoticeOfWorkTypeDisabled={this.props.isNoticeOfWorkTypeDisabled}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}

ApplicationTab.propTypes = propTypes;

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  originalNoticeOfWork: getOriginalNoticeOfWork(state),
  importNowSubmissionDocumentsJob: getImportNowSubmissionDocumentsJob(state),
  formValues: getFormValues(FORM.EDIT_NOTICE_OF_WORK)(state),
  formErrors: getFormSyncErrors(FORM.EDIT_NOTICE_OF_WORK)(state),
  submitFailed: hasSubmitFailed(FORM.EDIT_NOTICE_OF_WORK)(state),
  inspectors: getDropdownInspectors(state),
  reclamationSummary: getNOWReclamationSummary(state),
  generatableApplicationDocuments: getGeneratableNoticeOfWorkApplicationDocumentTypeOptions(state),
  noticeOfWorkApplicationStatusOptionsHash: getNoticeOfWorkApplicationStatusOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      exportNoticeOfWorkApplicationDocument,
      reset,
      submit,
    },
    dispatch
  );

ApplicationTab.propTypes = propTypes;
ApplicationTab.defaultProps = defaultProps;

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ApplicationTab));
