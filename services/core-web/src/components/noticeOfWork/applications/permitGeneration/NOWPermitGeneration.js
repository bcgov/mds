import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { isEmpty } from "lodash";
import { Button, Popconfirm } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { formatDate, getDurationText, flattenObject } from "@common/utils/helpers";
import { getFormValues, reset, isSubmitting, getFormSyncErrors, submit } from "redux-form";
import {
  getNoticeOfWorkApplicationTypeOptions,
  getDropdownPermitAmendmentTypeOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import {
  fetchPermits,
  updatePermitAmendment,
  fetchDraftPermitByNOW,
  deletePermit,
  deletePermitAmendment,
} from "@mds/common/redux/actionCreators/permitActionCreator";
import { storeEditingPreambleFlag } from "@mds/common/redux/actions/permitActions";
import {
  getDraftPermitForNOW,
  getDraftPermitAmendmentForNOW,
  getPermits,
} from "@mds/common/redux/selectors/permitSelectors";
import { PERMIT_AMENDMENT_TYPES } from "@common/constants/strings";
import { getNOWProgress } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { modalConfig } from "@/components/modalContent/config";
import * as FORM from "@/constants/forms";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import GeneratePermitForm from "@/components/Forms/permits/GeneratePermitForm";
import { EDIT_OUTLINE } from "@/constants/assets";
import NullScreen from "@/components/common/NullScreen";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import NOWTabHeader from "@/components/noticeOfWork/applications/NOWTabHeader";

/**
 * @class NOWPermitGeneration - contains the form and information to generate a permit document form a Notice of Work
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  appOptions: PropTypes.arrayOf(CustomPropTypes.options).isRequired,
  handleGenerateDocumentFormSubmit: PropTypes.func.isRequired,
  documentType: PropTypes.objectOf(PropTypes.any).isRequired,
  toggleEditMode: PropTypes.func.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  fixedTop: PropTypes.bool.isRequired,
  reset: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  updatePermitAmendment: PropTypes.func.isRequired,
  fetchDraftPermitByNOW: PropTypes.func.isRequired,
  formValues: CustomPropTypes.permitGenObj.isRequired,
  draftPermit: CustomPropTypes.permit.isRequired,
  draftPermitAmendment: CustomPropTypes.permitAmendment.isRequired,
  isAmendment: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  permitAmendmentTypeDropDownOptions: CustomPropTypes.options.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  onPermitDraftSave: PropTypes.func,
  formErrors: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.objectOf(PropTypes.string), PropTypes.string])
  ).isRequired,
  submit: PropTypes.func.isRequired,
  deletePermit: PropTypes.func.isRequired,
  deletePermitAmendment: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  progress: PropTypes.objectOf(PropTypes.string).isRequired,
  isNoticeOfWorkTypeDisabled: PropTypes.bool,
  storeEditingPreambleFlag: PropTypes.func.isRequired,
};

const defaultProps = {
  onPermitDraftSave: () => {},
  isNoticeOfWorkTypeDisabled: true,
};

const regionHash = {
  SE: "Cranbrook",
  SC: "Kamloops",
  NE: "Prince George",
  NW: "Smithers",
  SW: "Victoria",
};

const getDocumentsMetadataInitialValues = (documents, guid_name) => {
  const initialValues = {};
  // eslint-disable-next-line no-unused-expressions
  !isEmpty(documents) &&
    documents.forEach((doc) => {
      initialValues[`${doc[guid_name]}_preamble_title`] = doc.preamble_title;
      initialValues[`${doc[guid_name]}_preamble_author`] = doc.preamble_author;
      initialValues[`${doc[guid_name]}_preamble_date`] = doc.preamble_date;
    });
  return initialValues;
};

const getDocumentInfo = (doc) => {
  const title = doc.preamble_title || "<DOCUMENT TITLE MISSING!>";
  const author = doc.preamble_author;
  const date = doc.preamble_date;
  let info = `${title}, `;
  info += date ? `dated ${formatDate(date)}` : "not dated";
  info += author ? `, prepared by ${author}` : "";
  return info;
};

export class NOWPermitGeneration extends Component {
  state = {
    permitGenObj: {},
    isLoaded: false,
    permittee: {},
    permitAmendmentDropdown: [],
    isPermitAmendmentTypeDropDownDisabled: true,
  };

  componentDidMount() {
    this.fetchDraftPermit();

    const permittee = this.props.noticeOfWork.contacts.filter(
      (contact) => contact.mine_party_appt_type_code_description === "Permittee"
    )[0];
    this.setState({ permittee });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.noticeOfWork !== this.props.noticeOfWork) {
      this.fetchDraftPermit();
    }

    if (nextProps.noticeOfWork.contacts !== this.props.noticeOfWork.contacts) {
      const permittee = nextProps.noticeOfWork?.contacts?.filter(
        (contact) => contact.mine_party_appt_type_code_description === "Permittee"
      )[0];
      this.setState({ permittee });
    }
  }

  fetchDraftPermit = () => {
    this.props.fetchPermits(this.props.noticeOfWork.mine_guid);
    this.handleDraftPermit();
  };

  openDeleteDraftPermitModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: "Delete Draft Permit",
        handleDelete: this.props.isAmendment
          ? this.handleDeleteDraftPermitAmendment
          : this.handleDeleteDraftPermit,
      },
      content: modalConfig.DELETE_DRAFT_PERMIT_MODAL,
    });
  };

  handleDraftPermit = () => {
    this.setState({ permitGenObj: {} });
    return this.props
      .fetchDraftPermitByNOW(
        this.props.noticeOfWork.mine_guid,
        this.props.noticeOfWork.now_application_guid
      )
      .then(() => {
        if (!isEmpty(this.props.draftPermitAmendment)) {
          const permitGenObj = this.createPermitGenObject(
            this.props.noticeOfWork,
            this.props.draftPermit,
            this.props.draftPermitAmendment
          );
          this.setState({ permitGenObj });
        }
        this.setState({
          isLoaded: true,
        });
      });
  };

  handleDeleteDraftPermit = () =>
    this.props
      .deletePermit(this.props.noticeOfWork.mine_guid, this.props.draftPermit.permit_guid)
      .then(() => {
        this.props.closeModal();
        this.setState({
          isLoaded: false,
        });
        this.handleDraftPermit();
      });

  handleDeleteDraftPermitAmendment = () =>
    this.props
      .deletePermitAmendment(
        this.props.noticeOfWork.mine_guid,
        this.props.draftPermit.permit_guid,
        this.props.draftPermitAmendment.permit_amendment_guid
      )
      .then(() => {
        this.props.closeModal();
        this.setState({
          isLoaded: false,
        });
        this.handleDraftPermit();
      });

  createPermitGenObject = (noticeOfWork, draftPermit, amendment = {}) => {
    let OGPIssueDate = null;
    if (draftPermit.permit_status_code) {
      OGPIssueDate =
        draftPermit.permit_status_code === "D"
          ? formatDate(amendment.issue_date)
          : formatDate(
              draftPermit.permit_amendments
                .filter((amend) => amend.permit_amendment_type_code === "OGP")
                .map((a) => a.issue_date)[0]
            );
    }
    const permitGenObject = {
      permit_number: "",
      formatted_original_issue_date: OGPIssueDate,
      formatted_issue_date: formatDate(amendment.issue_date),
      issue_date: amendment.issue_date,
      formatted_auth_end_date: formatDate(amendment.authorization_end_date),
      auth_end_date: amendment.authorization_end_date,
      regional_office: regionHash[noticeOfWork.mine_region],
      current_date: moment().format("Do"),
      current_month: moment().format("MMMM"),
      current_year: moment().format("YYYY"),
      conditions: "",
      issuing_inspector_title: "Inspector of Mines",
      application_last_updated_date: noticeOfWork.last_updated_date
        ? formatDate(noticeOfWork.last_updated_date)
        : formatDate(noticeOfWork.submitted_date),
      proposed_start_date: noticeOfWork.proposed_start_date,
      proposed_end_date: noticeOfWork.proposed_end_date,
      proposed_term_of_authorization: getDurationText(
        noticeOfWork.proposed_start_date,
        noticeOfWork.proposed_end_date
      ),
      term_of_authorization:
        amendment.issue_date && amendment.authorization_end_date
          ? getDurationText(amendment.issue_date, amendment.authorization_end_date)
          : "N/A",
      preamble_text: amendment.preamble_text,
    };
    permitGenObject.mine_no = noticeOfWork.mine_no;
    const permittee = noticeOfWork.contacts.filter(
      (contact) => contact.mine_party_appt_type_code_description === "Permittee"
    )[0];

    const originalAmendment = draftPermit.permit_amendments.filter(
      (org) => org.permit_amendment_type_code === PERMIT_AMENDMENT_TYPES.original
    )[0];

    const addressLineOne =
      !isEmpty(permittee) &&
      !isEmpty(permittee.party.address[0]) &&
      permittee.party.address[0].address_line_1
        ? `${permittee.party.address[0].address_line_1}\n`
        : "";
    const addressLineTwo =
      !isEmpty(permittee) && !isEmpty(permittee.party.address[0])
        ? `${permittee.party.address[0].city || ""} ${permittee.party.address[0]
            .sub_division_code || ""} ${permittee.party.address[0].post_code || ""}`
        : "";
    const mailingAddress = `${addressLineOne}${addressLineTwo}`;
    permitGenObject.permittee = !isEmpty(permittee) ? permittee.party.name : "";
    permitGenObject.permittee_email = !isEmpty(permittee) ? permittee.party.email : "";
    permitGenObject.permittee_mailing_address = mailingAddress;
    permitGenObject.property = noticeOfWork.property_name;
    permitGenObject.mine_location = `Latitude: ${noticeOfWork.latitude}, Longitude: ${noticeOfWork.longitude}`;
    permitGenObject.application_date = noticeOfWork.submitted_date;
    permitGenObject.permit_number = draftPermit.permit_no;
    permitGenObject.original_permit_issue_date = isEmpty(originalAmendment)
      ? ""
      : originalAmendment.issue_date;
    permitGenObject.application_type = this.props.appOptions?.filter(
      (option) => option.notice_of_work_type_code === noticeOfWork.notice_of_work_type_code
    )[0].description;
    permitGenObject.lead_inspector = noticeOfWork.lead_inspector.name;
    permitGenObject.regional_office = !amendment.regional_office
      ? regionHash[noticeOfWork.mine_region]
      : amendment.regional_office;
    permitGenObject.now_tracking_number = noticeOfWork.now_tracking_number;
    permitGenObject.now_number = noticeOfWork.now_number;

    permitGenObject.site_property = this.props.noticeOfWork.site_property
      ? this.props.noticeOfWork.site_property
      : {
          mine_tenure_type_code: "",
          mine_commodity_code: [],
          mine_disturbance_code: [],
        };
    let isPermitAmendmentTypeDropDownDisabled = true;
    let permitAmendmentDropdown = this.props.permitAmendmentTypeDropDownOptions;
    if (amendment && !isEmpty(amendment)) {
      permitGenObject.permit_amendment_type_code = amendment.permit_amendment_type_code;

      let amendmentType = PERMIT_AMENDMENT_TYPES.original;
      const amendments = draftPermit.permit_amendments.filter(
        (a) => a.permit_amendment_status_code !== "DFT"
      );

      if (amendments.length > 0) {
        amendmentType =
          amendments.filter(
            (a) => a.permit_amendment_type_code === PERMIT_AMENDMENT_TYPES.amalgamated
          ).length > 0
            ? PERMIT_AMENDMENT_TYPES.amalgamated
            : PERMIT_AMENDMENT_TYPES.amendment;
      }

      if (amendmentType === PERMIT_AMENDMENT_TYPES.amendment) {
        permitAmendmentDropdown = this.props.permitAmendmentTypeDropDownOptions.filter(
          (a) => a.value !== PERMIT_AMENDMENT_TYPES.original
        );
        isPermitAmendmentTypeDropDownDisabled = false;
      }

      this.setState({ permitAmendmentDropdown, isPermitAmendmentTypeDropDownDisabled });
    }
    return permitGenObject;
  };

  createPreviousAmendmentGenObject = (permit) => {
    // gets and sorts in descending order amendments for selected permit
    const amendments =
      permit &&
      permit.permit_amendments
        .filter((a) => a.permit_amendment_status_code !== "DFT")
        // eslint-disable-next-line no-nested-ternary
        .sort((a, b) => (a.issue_date < b.issue_date ? 1 : b.issue_date < a.issue_date ? -1 : 0));
    const previousAmendment = amendments && amendments.length > 0 ? amendments[0] : {};
    if (!isEmpty(previousAmendment)) {
      previousAmendment.related_documents = previousAmendment.related_documents.map((doc) => ({
        document_info: getDocumentInfo(doc),
        ...doc,
      }));
    }
    const previousAmendmentGenObject = {
      ...previousAmendment,
      issue_date: formatDate(previousAmendment.issue_date),
      authorization_end_date: formatDate(previousAmendment.authorization_end_date),
    };
    return previousAmendmentGenObject;
  };

  getFinalApplicationPackage = (noticeOfWork) => {
    let documents = [];
    let filteredSubmissionDocuments = noticeOfWork?.filtered_submission_documents;
    let requestedDocuments = noticeOfWork?.documents;
    if (!isEmpty(filteredSubmissionDocuments)) {
      filteredSubmissionDocuments = filteredSubmissionDocuments
        ?.filter(({ is_final_package }) => is_final_package)
        .map((doc) => ({
          document_info: getDocumentInfo(doc),
          final_package_order: doc.final_package_order,
        }));
      documents = filteredSubmissionDocuments;
    }
    if (!isEmpty(requestedDocuments)) {
      requestedDocuments = requestedDocuments
        ?.filter(({ is_final_package }) => is_final_package)
        .map((doc) => ({
          document_info: getDocumentInfo(doc),
          final_package_order: doc.final_package_order,
        }));
      documents = [...documents, ...requestedDocuments];
    }
    documents.sort((a, b) => a.final_package_order - b.final_package_order);
    return documents;
  };

  handlePermitGenSubmit = () => {
    const newValues = this.props.formValues;

    if (this.props.isAmendment) {
      newValues.original_permit_issue_date = formatDate(
        this.props.formValues.original_permit_issue_date
      );

      if (newValues.permit_amendment_type_code === PERMIT_AMENDMENT_TYPES.amalgamated) {
        const permit = this.props.permits.find((p) => p.permit_no === newValues.permit_number);
        newValues.previous_amendment = this.createPreviousAmendmentGenObject(permit);
      }
    }

    this.setState({ downloadingDraft: true });
    return this.props
      .handleGenerateDocumentFormSubmit(this.props.documentType, {
        ...newValues,
        auth_end_date: formatDate(this.props.formValues.auth_end_date),
        application_dated: formatDate(newValues.application_date),
        final_application_package: this.getFinalApplicationPackage(this.props.noticeOfWork),
      })
      .finally(() => this.setState({ downloadingDraft: false }));
  };

  focusErrorInput = () => {
    this.props.submit(FORM.GENERATE_PERMIT);
    const errors = Object.keys(flattenObject(this.props.formErrors));
    const errorElement = document.querySelector(`[name="${errors[0]}"]`);
    if (errorElement && errorElement.focus) {
      errorElement.focus();
    }
  };

  handleCancelDraftEdit = () => {
    this.props.reset(FORM.GENERATE_PERMIT);
    this.props.toggleEditMode();
  };

  handleSaveDraftEdit = () => {
    const errors = Object.keys(flattenObject(this.props.formErrors));
    if (errors.length > 0) {
      this.focusErrorInput();
      return;
    }

    const transformDocumentsMetadata = (documentsMetadata) => {
      const allFileMetadata = {};
      if (isEmpty(documentsMetadata)) {
        return allFileMetadata;
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(documentsMetadata)) {
        // Extract required information from the field ID (e.g., 1c943015-29ed-433c-bfb1-d5ed14db103e_preamble_title).
        const fieldIdParts = key.split(/_(.+)/);
        const guid = fieldIdParts[0];
        const fieldName = fieldIdParts[1];
        if (guid && guid !== "null") {
          if (!(guid in allFileMetadata)) {
            allFileMetadata[guid] = {};
          }
          allFileMetadata[guid][fieldName] = value;
        }
      }
      return allFileMetadata;
    };

    this.setState({ isLoaded: false });
    const payload = {
      issuing_inspector_title: this.props.formValues.issuing_inspector_title,
      regional_office: this.props.formValues.regional_office,
      issue_date: this.props.formValues.issue_date,
      authorization_end_date: this.props.formValues.auth_end_date,
      permit_amendment_type_code: this.props.formValues.permit_amendment_type_code,
      final_original_documents_metadata: JSON.stringify(
        transformDocumentsMetadata(this.props.formValues.final_original_documents_metadata)
      ),
      final_requested_documents_metadata: JSON.stringify(
        transformDocumentsMetadata(this.props.formValues.final_requested_documents_metadata)
      ),
      previous_amendment_documents_metadata: JSON.stringify(
        transformDocumentsMetadata(this.props.formValues.previous_amendment_documents_metadata)
      ),
      site_properties: this.props.formValues.site_property,
      preamble_text: this.props.formValues.preamble_text,
    };

    // eslint-disable-next-line consistent-return
    return this.props
      .updatePermitAmendment(
        this.props.noticeOfWork.mine_guid,
        this.props.draftPermit.permit_guid,
        this.props.draftPermitAmendment.permit_amendment_guid,
        payload
      )
      .then(() => this.props.onPermitDraftSave())
      .then(() => {
        this.handleDraftPermit();
        this.props.toggleEditMode();
      });
  };

  handleSavePreamble = () => {
    this.setState({ isLoaded: false });
    const payload = {
      preamble_text: this.props.formValues.preamble_text,
    };

    // eslint-disable-next-line consistent-return
    return this.props
      .updatePermitAmendment(
        this.props.noticeOfWork.mine_guid,
        this.props.draftPermit.permit_guid,
        this.props.draftPermitAmendment.permit_amendment_guid,
        payload
      )
      .then(() => this.props.onPermitDraftSave())
      .then(() => {
        this.handleDraftPermit();
        this.props.storeEditingPreambleFlag(false);
      });
  };

  handleCancelPreambleTextEdit = () => {
    this.props.reset(FORM.GENERATE_PERMIT);
    this.props.storeEditingPreambleFlag(false);
    // this.props.toggleEditMode();
  };

  render() {
    // If applicable, get the previous amendment documents and their form's initial values.
    let previousAmendmentDocuments;
    let previousAmendmentDocumentsMetadataInitialValues;
    if (
      this.props.isAmendment &&
      this.props.formValues?.permit_amendment_type_code === PERMIT_AMENDMENT_TYPES.amalgamated
    ) {
      const permit = this.props.permits.find(
        (p) => p.permit_no === this.props.formValues?.permit_number
      );
      const previousAmendment = this.createPreviousAmendmentGenObject(permit);
      previousAmendmentDocuments = previousAmendment.related_documents;
      previousAmendmentDocumentsMetadataInitialValues = getDocumentsMetadataInitialValues(
        previousAmendmentDocuments,
        "permit_amendment_document_guid"
      );
    }

    const nowType = this.props.noticeOfWork.type_of_application
      ? `${this.props.noticeOfWork.type_of_application}`
      : "";
    const isProcessed =
      this.props.noticeOfWork.now_application_status_code === "AIA" ||
      this.props.noticeOfWork.now_application_status_code === "WDN" ||
      this.props.noticeOfWork.now_application_status_code === "REJ" ||
      this.props.noticeOfWork.now_application_status_code === "NPR";
    const draftInProgress =
      this.props.progress.DFT &&
      this.props.progress.DFT.start_date &&
      !this.props.progress.DFT.end_date;
    const hasDraftBeenDeleted = isEmpty(this.props.draftPermitAmendment) && draftInProgress;
    const isDraft = !isEmpty(this.props.draftPermitAmendment);
    return (
      <div>
        <NOWTabHeader
          tab="DFT"
          tabActions={
            isDraft && (
              <>
                {" "}
                <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT" ignoreDelay>
                  <Button type="danger" onClick={(event) => this.openDeleteDraftPermitModal(event)}>
                    Delete Draft
                  </Button>
                </NOWActionWrapper>
                <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT" ignoreDelay>
                  <Button type="secondary" onClick={this.props.toggleEditMode}>
                    <img alt="EDIT_OUTLINE" className="padding-small--right" src={EDIT_OUTLINE} />
                    Edit
                  </Button>
                </NOWActionWrapper>
                {this.props.draftPermitAmendment.has_permit_conditions && (
                  <Button
                    className="full-mobile"
                    type="secondary"
                    onClick={this.handlePermitGenSubmit}
                    loading={this.state.downloadingDraft}
                    disabled={
                      isEmpty(this.state.permittee) ||
                      !this.props.noticeOfWork?.issuing_inspector?.signature
                    }
                    title={
                      isEmpty(this.state.permittee) ||
                      !this.props.noticeOfWork?.issuing_inspector?.signature
                        ? "The application must have a permittee assigned, and the issuing inspector must have a signature before viewing the draft."
                        : ""
                    }
                  >
                    <DownloadOutlined className="padding-small--right icon-sm" />
                    Download Draft
                  </Button>
                )}
              </>
            )
          }
          tabName={`Draft ${nowType}`}
          handleDraftPermit={this.handleDraftPermit}
          fixedTop={this.props.fixedTop}
          noticeOfWork={this.props.noticeOfWork}
          tabEditActions={
            <>
              <Popconfirm
                placement="bottomRight"
                title="You have unsaved changes. Are you sure you want to cancel?"
                onConfirm={() => {
                  this.handleCancelDraftEdit();
                }}
                okText="Yes"
                cancelText="No"
                disabled={this.props.submitting}
              >
                <Button type="secondary" className="full-mobile" disabled={this.props.submitting}>
                  Cancel
                </Button>
              </Popconfirm>
              <Button
                type="primary"
                className="full-mobile"
                onClick={() => {
                  this.handleSaveDraftEdit();
                }}
                loading={this.props.submitting}
              >
                Save
              </Button>
            </>
          }
          isEditMode={!this.props.isViewMode}
          isNoticeOfWorkTypeDisabled={this.props.isNoticeOfWorkTypeDisabled}
        />
        <div className={this.props.fixedTop ? "side-menu--fixed" : "side-menu"}>
          {isDraft && <NOWSideMenu tabSection="draft-permit" />}
        </div>
        <div
          className={
            this.props.fixedTop ? "side-menu--content with-fixed-top" : "side-menu--content"
          }
        >
          <>
            {isProcessed ? (
              <LoadingWrapper condition={this.state.isLoaded}>
                <h3 style={{ textAlign: "center", paddingTop: "20px" }}>
                  This application has been processed.
                </h3>
              </LoadingWrapper>
            ) : (
              <>
                {!isDraft ? (
                  <LoadingWrapper condition={this.state.isLoaded}>
                    <NullScreen
                      type="draft-permit"
                      message={
                        !hasDraftBeenDeleted ? (
                          <>Click &quot;Start Draft Permit&quot; to start the drafting process.</>
                        ) : (
                          <>
                            Click &quot;Create Draft Permit&quot; to continue the drafting process.
                          </>
                        )
                      }
                    />
                  </LoadingWrapper>
                ) : (
                  <GeneratePermitForm
                    initialValues={{
                      ...this.state.permitGenObj,
                      final_requested_documents_metadata: getDocumentsMetadataInitialValues(
                        this.props.noticeOfWork?.documents,
                        "now_application_document_xref_guid"
                      ),
                      final_original_documents_metadata: getDocumentsMetadataInitialValues(
                        this.props.noticeOfWork?.filtered_submission_documents,
                        "now_application_document_xref_guid"
                      ),
                      previous_amendment_documents_metadata: previousAmendmentDocumentsMetadataInitialValues,
                    }}
                    isAmendment={this.props.isAmendment}
                    previousAmendmentDocuments={previousAmendmentDocuments}
                    noticeOfWork={this.props.noticeOfWork}
                    isViewMode={this.props.isViewMode}
                    isLoaded={this.state.isLoaded}
                    permitAmendmentDropdown={this.state.permitAmendmentDropdown}
                    isPermitAmendmentTypeDropDownDisabled={
                      this.state.isPermitAmendmentTypeDropDownDisabled
                    }
                    draftPermit={this.props.draftPermit}
                    draftPermitAmendment={this.props.draftPermitAmendment}
                    storeEditingPreambleFlag={this.props.storeEditingPreambleFlag}
                    handleSaveDraftEdit={this.handleSaveDraftEdit}
                    handleSavePreamble={this.handleSavePreamble}
                    handleCancelDraftEdit={this.handleCancelDraftEdit}
                    handleCancelPreambleTextEdit={this.handleCancelPreambleTextEdit}
                  />
                )}
              </>
            )}
          </>
        </div>
      </div>
    );
  }
}

NOWPermitGeneration.propTypes = propTypes;
NOWPermitGeneration.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  appOptions: getNoticeOfWorkApplicationTypeOptions(state),
  formValues: getFormValues(FORM.GENERATE_PERMIT)(state),
  submitting: isSubmitting(FORM.GENERATE_PERMIT)(state),
  draftPermit: getDraftPermitForNOW(state),
  formErrors: getFormSyncErrors(FORM.GENERATE_PERMIT)(state),
  draftPermitAmendment: getDraftPermitAmendmentForNOW(state),
  permitAmendmentTypeDropDownOptions: getDropdownPermitAmendmentTypeOptions(state),
  permits: getPermits(state),
  progress: getNOWProgress(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      reset,
      submit,
      fetchPermits,
      updatePermitAmendment,
      fetchDraftPermitByNOW,
      deletePermit,
      deletePermitAmendment,
      openModal,
      closeModal,
      storeEditingPreambleFlag,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(NOWPermitGeneration);
