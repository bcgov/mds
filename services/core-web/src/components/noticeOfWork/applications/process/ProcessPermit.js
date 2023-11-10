import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import moment from "moment";
import { isEmpty } from "lodash";
import { Button, Menu, Dropdown, Timeline, Result, Row, Col, notification } from "antd";
import {
  DownOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  LinkOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  patchPermitNumber,
  fetchDraftPermitByNOW,
} from "@mds/common/redux/actionCreators/permitActionCreator";
import { getNoticeOfWork, getNOWProgress } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { connect } from "react-redux";
import {
  formatDate,
  isPlacerAdjustmentFeeValid,
  isPitsQuarriesAdjustmentFeeValid,
  determineExemptionFeeStatus,
} from "@common/utils/helpers";
import { bindActionCreators } from "redux";
import {
  getDropdownNoticeOfWorkApplicationStatusCodes,
  getNoticeOfWorkApplicationStatusOptionsHash,
  getNoticeOfWorkApplicationTypeOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import {
  updateNoticeOfWorkStatus,
  fetchApplicationDelay,
  fetchImportedNoticeOfWorkApplication,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  getDraftPermitForNOW,
  getDraftPermitAmendmentForNOW,
} from "@mds/common/redux/selectors/permitSelectors";
import { PERMIT_AMENDMENT_TYPES } from "@common/constants/strings";
import { getDocumentContextTemplate } from "@/reducers/documentReducer";
import {
  generateNoticeOfWorkApplicationDocument,
  fetchNoticeOfWorkApplicationContextTemplate,
} from "@/actionCreators/documentActionCreator";
import CustomPropTypes from "@/customPropTypes";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import * as route from "@/constants/routes";
import NOWTabHeader from "@/components/noticeOfWork/applications/NOWTabHeader";
import LinkButton from "@/components/common/buttons/LinkButton";
import { APPLICATION_PROGRESS_TRACKING } from "@/constants/NOWConditions";

/**
 * @class ProcessPermit - Process the permit. We've got to process this permit. Process this permit, proactively!
 */
const approvedCode = "AIA";
const approvedLetterCode = "NPE";
const rejectedCode = "REJ";
const rejectedLetterCode = "RJL";
const withdrawnCode = "WDN";
const withdrawnLetterCode = "WDL";
const noPermitRequiredCode = "NPR";
const noPermitRequiredLetterCode = "NPR";
const noPermitRequiredIPLetterCode = "NPI";
const originalPermit = "OGP";
const regionHash = {
  SE: "Cranbrook",
  SC: "Kamloops",
  NE: "Prince George",
  NW: "Smithers",
  SW: "Victoria",
};

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchApplicationDelay: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  updateNoticeOfWorkStatus: PropTypes.func.isRequired,
  appOptions: PropTypes.arrayOf(CustomPropTypes.options).isRequired,
  progress: PropTypes.objectOf(PropTypes.any).isRequired,
  progressStatusCodes: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  draftPermit: CustomPropTypes.permit.isRequired,
  draftAmendment: CustomPropTypes.permit.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  fixedTop: PropTypes.bool.isRequired,
  generateNoticeOfWorkApplicationDocument: PropTypes.func.isRequired,
  fetchNoticeOfWorkApplicationContextTemplate: PropTypes.func.isRequired,
  noticeOfWorkApplicationStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  documentContextTemplate: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  patchPermitNumber: PropTypes.func.isRequired,
  fetchDraftPermitByNOW: PropTypes.func.isRequired,
};

const TimelineItem = (progress, progressStatus) => {
  if (!progress[progressStatus.application_progress_status_code])
    return (
      <Timeline.Item dot={<StopOutlined className="icon-lg--lightgrey" />}>
        <span className="field-title">{progressStatus.description}</span>
        <br />
        Not Started
      </Timeline.Item>
    );
  if (progress[progressStatus.application_progress_status_code].end_date)
    return (
      <Timeline.Item dot={<CheckCircleOutlined className="icon-lg--green" />}>
        <span className="field-title">{progressStatus.description}</span>
        <br />
        Complete
      </Timeline.Item>
    );
  return (
    <Timeline.Item dot={<ClockCircleOutlined className="icon-lg" />}>
      <span className="field-title">{progressStatus.description}</span>
      <br />
      In Progress
    </Timeline.Item>
  );
};

const ProgressRouteFor = (code, now_application_guid, application_type_code) => {
  const applicationRoute =
    application_type_code === "NOW"
      ? route.NOTICE_OF_WORK_APPLICATION
      : route.ADMIN_AMENDMENT_APPLICATION;
  return {
    REV: applicationRoute.dynamicRoute(now_application_guid, "application"),
    REF: applicationRoute.dynamicRoute(now_application_guid, "referral"),
    CON: applicationRoute.dynamicRoute(now_application_guid, "consultation"),
    PUB: applicationRoute.dynamicRoute(now_application_guid, "public-comment"),
    DFT: applicationRoute.dynamicRoute(now_application_guid, "draft-permit"),
    MND: applicationRoute.dynamicRoute(now_application_guid, "manage-documents"),
  }[code];
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

export class ProcessPermit extends Component {
  state = {};

  componentDidMount = () => {
    this.props.fetchApplicationDelay(this.props.noticeOfWork.now_application_guid);
  };

  openStatusModal = () => {
    this.props.openModal({
      props: {
        title: "Revert to Previous Status",
        onSubmit: this.updateApplicationStatus,
        initialValues: {
          now_application_status_code: this.props.noticeOfWork.previous_application_status_code,
        },
        closeModal: this.props.closeModal,
      },
      width: "50vw",
      content: modalConfig.UPDATE_NOW_STATUS,
    });
  };

  openUpdateStatusGenerateLetterModal = (type) => {
    const content = {
      REJ: {
        title: "Reject Application",
        statusCode: rejectedCode,
        letterCode: rejectedLetterCode,
      },
      AIA: {
        title: "Issue Permit",
        statusCode: approvedCode,
        letterCode: approvedLetterCode,
      },
      WDN: {
        title: "Withdraw Application",
        statusCode: withdrawnCode,
        letterCode: withdrawnLetterCode,
      },
      NPR: {
        title: "No Permit Required",
        statusCode: noPermitRequiredCode,
        letterCode: noPermitRequiredLetterCode,
      },
      NPI: {
        title: "No Permit Required IP",
        statusCode: noPermitRequiredCode,
        letterCode: noPermitRequiredIPLetterCode,
      },
    };
    const signature = this.props.noticeOfWork?.issuing_inspector?.signature;

    return this.props
      .fetchNoticeOfWorkApplicationContextTemplate(
        content[type].letterCode,
        this.props.noticeOfWork.now_application_guid
      )
      .then(() =>
        this.props.fetchDraftPermitByNOW(
          this.props.noticeOfWork.mine_guid,
          this.props.noticeOfWork.now_application_guid
        )
      )
      .then(() => {
        const initialValues = {};
        let statusCode = "";

        if (type === "AIA") {
          const isExploration = this.props.draftPermit.permit_no.charAt(1) === "X";
          statusCode = determineExemptionFeeStatus(
            this.props.draftPermit.permit_status_code,
            this.props.draftPermit.permit_prefix,
            this.props.noticeOfWork?.site_property?.mine_tenure_type_code,
            isExploration,
            this.props.noticeOfWork?.site_property?.mine_disturbance_code
          );
        }

        this.props.documentContextTemplate.document_template.form_spec.map(
          // eslint-disable-next-line
          (item) => (initialValues[item.id] = item["context-value"])
        );
        this.props.openModal({
          props: {
            initialValues,
            title: content[type].title,
            documentType: this.props.documentContextTemplate,
            onSubmit: (values) => this.handleApplication(values, content[type].statusCode),
            type,
            generateDocument: this.handleGenerateDocumentFormSubmit,
            preview: this.handleDocumentPreview,
            noticeOfWork: this.props.noticeOfWork,
            draftAmendment: this.props.draftAmendment,
            signature,
            issuingInspectorGuid: this.props.noticeOfWork?.issuing_inspector?.party_guid,
            exemptionFeeStatusCode: statusCode,
          },
          width: "50vw",
          content: modalConfig.NOW_STATUS_LETTER_MODAL,
        });
      });
  };

  openGeneratePermitNumberModal = () => {
    this.props
      .fetchDraftPermitByNOW(
        this.props.noticeOfWork.mine_guid,
        this.props.noticeOfWork.now_application_guid
      )
      .then(() => {
        if (this.props.draftPermit.permit_no.includes("DRAFT")) {
          return this.props.openModal({
            props: {
              title: "Generate Permit Number",
              onSubmit: this.generatePermitNumber,
              signature: this.props.noticeOfWork?.issuing_inspector?.signature,
            },
            width: "50vw",
            content: modalConfig.GENERATE_PERMIT_NUMBER_MODAL,
          });
        }
        return this.openUpdateStatusGenerateLetterModal(approvedCode);
      });
  };

  openNoPermitRequiredSelectionModal = () => {
    return this.props.openModal({
      props: {
        title: "No Permit Required Letter Selection",
        nextStep: this.openUpdateStatusGenerateLetterModal,
        signature: this.props.noticeOfWork?.issuing_inspector?.signature,
      },
      width: "50vw",
      content: modalConfig.NO_PERMIT_REQUIRED_SELECTION_MODAL,
    });
  };

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
      preamble_text: amendment.preamble_text,
    };
    permitGenObject.mine_no = noticeOfWork.mine_no;
    permitGenObject.is_draft = false;
    const permittee = noticeOfWork.contacts.filter(
      (contact) => contact.mine_party_appt_type_code_description === "Permittee"
    )[0];
    const originalAmendment = draftPermit.permit_amendments?.filter(
      (org) => org.permit_amendment_type_code === originalPermit
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

    if (amendment && !isEmpty(amendment)) {
      permitGenObject.permit_amendment_type_code = amendment.permit_amendment_type_code;
      if (permitGenObject.permit_amendment_type_code === PERMIT_AMENDMENT_TYPES.amalgamated) {
        permitGenObject.previous_amendment = this.createPreviousAmendmentGenObject(draftPermit);
      }
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

  afterSuccess = (values, message, code) => {
    return this.props
      .updateNoticeOfWorkStatus(this.props.noticeOfWork.now_application_guid, {
        ...values,
        now_application_status_code: code,
      })
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
        this.props.closeModal();
        notification.success({
          message,
          duration: 10,
        });
      });
  };

  handleApplication = (values, code) => {
    if (
      code === approvedCode &&
      this.props.draftAmendment &&
      this.props.draftAmendment.has_permit_conditions
    ) {
      return this.handleApprovedApplication(values);
    }
    const codeMap = {
      WDN: "withdrawn",
      REJ: "rejected",
      AIA: "approved",
    };
    return this.afterSuccess(
      values,
      `This application has been successfully ${codeMap[code]}.`,
      code
    );
  };

  generatePermitNumber = () => {
    return this.props
      .patchPermitNumber(this.props.draftPermit.permit_guid, this.props.noticeOfWork.mine_guid, {
        now_application_guid: this.props.noticeOfWork.now_application_guid,
      })
      .then(() => this.props.closeModal())
      .then(() => this.openUpdateStatusGenerateLetterModal(approvedCode));
  };

  handleApprovedApplication = (values) => {
    const docType = this.props.noticeOfWork.type_of_application === "New Permit" ? "PMT" : "PMA";
    return this.props
      .fetchNoticeOfWorkApplicationContextTemplate(
        docType,
        this.props.noticeOfWork.now_application_guid
      )
      .then(() => {
        const permitObj = this.createPermitGenObject(
          this.props.noticeOfWork,
          this.props.draftPermit,
          this.props.draftAmendment
        );
        return this.handleGenerateDocumentFormSubmit(
          this.props.documentContextTemplate,
          {
            ...permitObj,
            formatted_auth_end_date: formatDate(values.auth_end_date),
            formatted_issue_date: formatDate(values.issue_date),
            application_dated: formatDate(permitObj.application_date),
            final_application_package: this.getFinalApplicationPackage(this.props.noticeOfWork),
          },
          values,
          this.afterSuccess
        );
      });
  };

  updateApplicationStatus = (values) => {
    const statusLabel = this.props.noticeOfWorkApplicationStatusOptionsHash[
      values.now_application_status_code
    ];
    return this.props
      .updateNoticeOfWorkStatus(this.props.noticeOfWork.now_application_guid, {
        ...values,
        status_reason: null,
      })
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
        this.props.closeModal();
        notification.success({
          message: `The status has been updated to ${statusLabel}.`,
          duration: 10,
        });
      });
  };

  handleGenerateDocumentFormSubmit = (
    documentType,
    permitGenObj,
    values = null,
    afterSuccess = null
  ) => {
    const documentTypeCode = documentType.now_application_document_type_code;
    const newValues = permitGenObj;
    documentType.document_template.form_spec
      .filter((field) => field.type === "DATE")
      .forEach((field) => {
        newValues[field.id] = formatDate(newValues[field.id]);
      });
    const payload = {
      now_application_guid: this.props.noticeOfWork.now_application_guid,
      template_data: newValues,
    };
    return this.props.generateNoticeOfWorkApplicationDocument(
      documentTypeCode,
      payload,
      "Successfully created document and attached it to Notice of Work",
      false,
      () => {
        if (
          documentType.now_application_document_type_code === "PMA" ||
          documentType.now_application_document_type_code === "PMT"
        ) {
          afterSuccess(
            values,
            "Permit has been successfully issued for this application.",
            approvedCode
          );
        }
      }
    );
  };

  handleDocumentPreview = (documentType, permitGenObj) => {
    const documentTypeCode = documentType.now_application_document_type_code;
    const newValues = permitGenObj;
    documentType.document_template.form_spec
      .filter((field) => field.type === "DATE")
      .forEach((field) => {
        newValues[field.id] = formatDate(newValues[field.id]);
      });
    const payload = {
      now_application_guid: this.props.noticeOfWork.now_application_guid,
      template_data: newValues,
    };
    return this.props.generateNoticeOfWorkApplicationDocument(
      documentTypeCode,
      payload,
      "Successfully created the preview document",
      true,
      () => {}
    );
  };

  getValidationErrors = () => {
    const validationMessages = [];

    // Fees
    const placerAdjustedFeeInvalid =
      this.props.noticeOfWork?.notice_of_work_type_code === "PLA" &&
      !isPlacerAdjustmentFeeValid(
        this.props.noticeOfWork?.proposed_annual_maximum_tonnage,
        this.props.noticeOfWork?.adjusted_annual_maximum_tonnage,
        this.props.noticeOfWork?.proposed_start_date,
        this.props.noticeOfWork?.proposed_end_date
      );
    const pitsQuarriesFeeInvalid =
      (this.props.noticeOfWork?.notice_of_work_type_code === "SAG" ||
        this.props.noticeOfWork?.notice_of_work_type_code === "QCA" ||
        this.props.noticeOfWork?.notice_of_work_type_code === "QIM") &&
      !isPitsQuarriesAdjustmentFeeValid(
        this.props.noticeOfWork?.proposed_annual_maximum_tonnage,
        this.props.noticeOfWork?.adjusted_annual_maximum_tonnage
      );

    if (placerAdjustedFeeInvalid || pitsQuarriesFeeInvalid) {
      validationMessages.push({
        message:
          "The Adjusted Annual Maximum Tonnage exceeds the limit allowed for permit fees paid. You must reject the application and ask the proponent to re-apply, or reduce the tonnage entered.",
        route: route.NOTICE_OF_WORK_APPLICATION.dynamicRoute(
          this.props.noticeOfWork.now_application_guid,
          "application"
        ),
      });
    }

    // Tenures, Disturbances, Commodities
    if (
      this.props.noticeOfWork &&
      !(
        this.props.noticeOfWork.site_property &&
        this.props.noticeOfWork.site_property.mine_tenure_type_code
      )
    ) {
      validationMessages.push({
        message: "The Site Property fields must be specified.",
        route: route.NOTICE_OF_WORK_APPLICATION.dynamicRoute(
          this.props.noticeOfWork.now_application_guid,
          "draft-permit/#site-properties"
        ),
      });
    }

    // Final Application Package document titles
    const requestedDocuments = this.props.noticeOfWork?.documents?.filter(
      ({ is_final_package }) => is_final_package
    );
    const originalDocuments = this.props.noticeOfWork?.filtered_submission_documents?.filter(
      ({ is_final_package }) => is_final_package
    );
    const finalApplicationDocuments = [...requestedDocuments, ...originalDocuments];
    let titlesMissing = finalApplicationDocuments?.filter(({ preamble_title }) => !preamble_title)
      .length;
    if (titlesMissing !== 0 && this.props.draftAmendment?.has_permit_conditions) {
      validationMessages.push({
        message: `The Final Application Package has ${titlesMissing} documents that require a title.`,
        route: route.NOTICE_OF_WORK_APPLICATION.dynamicRoute(
          this.props.noticeOfWork.now_application_guid,
          "draft-permit/#preamble"
        ),
      });
    }

    // Previous permit amendment document titles
    const previousAmendment = this.createPermitGenObject(
      this.props.noticeOfWork,
      this.props.draftPermit,
      this.props.draftAmendment
    ).previous_amendment;
    if (!isEmpty(previousAmendment)) {
      titlesMissing = previousAmendment.related_documents?.filter(
        ({ preamble_title }) => !preamble_title
      ).length;
      if (titlesMissing !== 0) {
        validationMessages.push({
          message: `The previous amendment has ${titlesMissing} documents that require a title.`,
          route: route.NOTICE_OF_WORK_APPLICATION.dynamicRoute(
            this.props.noticeOfWork.now_application_guid,
            "draft-permit/#preamble"
          ),
        });
      }
    }

    // Inspector signature
    const signature = this.props.noticeOfWork?.issuing_inspector?.signature;
    if (!signature) {
      validationMessages.push({
        message:
          "The issuing inspector must have a signature on file before the permit can be issued. Contact an administrator to update the inspector with a signature.",
        route:
          this.props.noticeOfWork?.issuing_inspector &&
          route.PARTY_PROFILE.dynamicRoute(this.props.noticeOfWork?.issuing_inspector?.party_guid),
      });
    }

    // Permittee
    if (
      this.props.noticeOfWork.contacts &&
      this.props.noticeOfWork.contacts.some(
        (contact) => contact.mine_party_appt_type_code === "PMT"
      )
    ) {
      const permittees = this.props.noticeOfWork.contacts.filter(
        (contact) => contact.mine_party_appt_type_code === "PMT"
      );
      if (permittees.length > 1) {
        validationMessages.push({
          message:
            "The application can not have more than one permittee. Verify the correct permittee and remove any others in Contacts under Application.",
          route: route.NOTICE_OF_WORK_APPLICATION.dynamicRoute(
            this.props.noticeOfWork.now_application_guid,
            "application#contacts"
          ),
        });
      }
      if (isEmpty(permittees[0].party.address[0])) {
        validationMessages.push({
          message: "The permittee must have an address. Update the contact to add an address.",
          route:
            permittees[0].party_guid && route.PARTY_PROFILE.dynamicRoute(permittees[0].party_guid),
        });
      }
    } else {
      validationMessages.push({
        message:
          "The application must have a permittee. Add a permittee in Contacts under Application.",
        route: route.NOTICE_OF_WORK_APPLICATION.dynamicRoute(
          this.props.noticeOfWork.now_application_guid,
          "application#contacts"
        ),
      });
    }

    // Securities
    if (
      !(
        this.props.noticeOfWork.security_received_date ||
        this.props.noticeOfWork.security_not_required
      )
    ) {
      validationMessages.push({
        message: `The reclamation securities must be recorded. Edit the Reclamation Securities under Administrative.`,
        route: route.NOTICE_OF_WORK_APPLICATION.dynamicRoute(
          this.props.noticeOfWork.now_application_guid,
          "administrative"
        ),
      });
    }

    // no permit document uploaded
    if (
      this.props.draftAmendment &&
      this.props.draftAmendment?.related_documents?.length === 0 &&
      !this.props.draftAmendment?.has_permit_conditions
    ) {
      validationMessages.push({
        message: `The Draft Permit must have a Permit PDF uploaded.`,
        route: route.NOTICE_OF_WORK_APPLICATION.dynamicRoute(
          this.props.noticeOfWork.now_application_guid,
          "draft-permit"
        ),
      });
    }

    // Progress
    this.props.progressStatusCodes
      .filter(
        (progressStatus) =>
          progressStatus.application_progress_status_code !== "CON" &&
          progressStatus.application_progress_status_code !== "REF" &&
          progressStatus.application_progress_status_code !== "PUB" &&
          (!this.props.progress[progressStatus.application_progress_status_code] ||
            !this.props.progress[progressStatus.application_progress_status_code].end_date) &&
          APPLICATION_PROGRESS_TRACKING[this.props.noticeOfWork.application_type_code].includes(
            progressStatus.application_progress_status_code
          )
      )
      .forEach((progressStatus) =>
        validationMessages.push({
          message: `${progressStatus.description} must be completed.`,
          route: ProgressRouteFor(
            progressStatus.application_progress_status_code,
            this.props.noticeOfWork?.now_application_guid,
            this.props.noticeOfWork.application_type_code
          ),
        })
      );

    this.props.progressStatusCodes
      .filter(
        (progressStatus) =>
          (progressStatus.application_progress_status_code === "CON" ||
            progressStatus.application_progress_status_code === "REF" ||
            progressStatus.application_progress_status_code === "PUB") &&
          this.props.progress[progressStatus.application_progress_status_code]?.start_date &&
          !this.props.progress[progressStatus.application_progress_status_code]?.end_date &&
          APPLICATION_PROGRESS_TRACKING[this.props.noticeOfWork.application_type_code].includes(
            progressStatus.application_progress_status_code
          )
      )
      .forEach((progressStatus) =>
        validationMessages.push({
          message: `${progressStatus.description} must be completed.`,
          route: ProgressRouteFor(
            progressStatus.application_progress_status_code,
            this.props.noticeOfWork?.now_application_guid,
            this.props.noticeOfWork.application_type_code
          ),
        })
      );

    return validationMessages;
  };

  getValidationWarnings = () => {
    const validationMessages = [];

    // Mine Emergency Resposne Plan
    if (
      !this.props.noticeOfWork.documents ||
      !this.props.noticeOfWork.documents.some(
        (doc) => doc.now_application_document_type_code === "MRP" && doc.is_final_package
      )
    ) {
      validationMessages.push({
        message: `The final application package is missing a Mine Emergency Response Plan. You can Edit the Final Application Package under Administrative.`,
        route: route.NOTICE_OF_WORK_APPLICATION.dynamicRoute(
          this.props.noticeOfWork.now_application_guid,
          "administrative"
        ),
      });
    }

    // Archeological Chance Find Procedure
    if (
      !this.props.noticeOfWork.documents ||
      !this.props.noticeOfWork.documents.some(
        (doc) => doc.now_application_document_type_code === "ACP" && doc.is_final_package
      )
    ) {
      validationMessages.push({
        message: `The final application package is missing an Archaeological Chance Find Procedure. You can Edit the Final Application Package under Administrative.`,
        route: route.NOTICE_OF_WORK_APPLICATION.dynamicRoute(
          this.props.noticeOfWork.now_application_guid,
          "administrative"
        ),
      });
    }

    if (
      this.props.noticeOfWork.blasting_operation.has_storage_explosive_on_site &&
      !this.props.noticeOfWork.blasting_operation.explosive_permit_issued
    ) {
      validationMessages.push({
        message: `An Explosives Storage & Use Permit is required as indicated by the information provided.`,
        route: route.MINE_NOW_APPLICATIONS.dynamicRoute(this.props.noticeOfWork.mine_guid),
      });
    }
    // TO DO: re-add logic when the OrgBook functionality is in prod.
    // Permittee
    // if (
    //   this.props.noticeOfWork.contacts &&
    //   this.props.noticeOfWork.contacts.some(
    //     (contact) => contact.mine_party_appt_type_code === "PMT"
    //   )
    // ) {
    //   const permittee = this.props.noticeOfWork.contacts.filter(
    //     (contact) => contact.mine_party_appt_type_code === "PMT"
    //   )[0];
    //   if (isEmpty(permittee.party.party_orgbook_entity)) {
    //     validationMessages.push({
    //       message:
    //         "Permittee has not been verified with OrgBook. Update the contact to associate them with an entity on OrgBook.",
    //       route:
    //         !isEmpty(permittee.party) &&
    //         route.PARTY_PROFILE.dynamicRoute(
    //           permittee.party.party_guid
    //         ),
    //     });
    //   }
    // }

    // Progress
    this.props.progressStatusCodes
      .filter(
        (progressStatus) =>
          (progressStatus.application_progress_status_code === "CON" ||
            progressStatus.application_progress_status_code === "REF" ||
            progressStatus.application_progress_status_code === "PUB") &&
          !this.props.progress[progressStatus.application_progress_status_code]?.start_date &&
          APPLICATION_PROGRESS_TRACKING[this.props.noticeOfWork.application_type_code].includes(
            progressStatus.application_progress_status_code
          )
      )
      .forEach((progressStatus) =>
        validationMessages.push({
          message: `${progressStatus.description} has not been started.`,
          route: ProgressRouteFor(
            progressStatus.application_progress_status_code,
            this.props.noticeOfWork?.now_application_guid,
            this.props.noticeOfWork.application_type_code
          ),
        })
      );

    return validationMessages;
  };

  menu = (validationErrors, isNoWApplication) => (
    <Menu>
      <Menu.Item
        key="issue-permit"
        onClick={this.openGeneratePermitNumberModal}
        disabled={validationErrors}
      >
        Issue permit
      </Menu.Item>
      <Menu.Item
        key="reject-application"
        onClick={() => this.openUpdateStatusGenerateLetterModal(rejectedCode)}
      >
        Reject application
      </Menu.Item>
      <Menu.Item
        key="withdraw-application"
        onClick={() => this.openUpdateStatusGenerateLetterModal(withdrawnCode)}
      >
        Withdraw application
      </Menu.Item>
      {isNoWApplication && (
        <Menu.Item
          key="no-permit-required custom-menu-item"
          onClick={this.openNoPermitRequiredSelectionModal}
        >
          No Permit Required
        </Menu.Item>
      )}
    </Menu>
  );

  render = () => {
    const validationErrors = this.getValidationErrors();
    const validationWarnings = this.getValidationWarnings();
    const hasValidationErrors = validationErrors.length > 0;
    const hasValidationWarnings = validationWarnings.length > 0;
    const isAmendment = this.props.noticeOfWork.type_of_application !== "New Permit";
    const isProcessed =
      this.props.noticeOfWork.now_application_status_code === approvedCode ||
      this.props.noticeOfWork.now_application_status_code === rejectedCode ||
      this.props.noticeOfWork.now_application_status_code === noPermitRequiredCode ||
      this.props.noticeOfWork.now_application_status_code === withdrawnCode;
    const isApproved = this.props.noticeOfWork.now_application_status_code === approvedCode;
    const isNoWApplication = this.props.noticeOfWork.application_type_code === "NOW";
    return (
      <>
        <NOWTabHeader
          tab="PRO"
          tabName="Process Permit"
          fixedTop={this.props.fixedTop}
          noticeOfWork={this.props.noticeOfWork}
          tabActions={
            <>
              {!isProcessed && (
                <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                  <Dropdown
                    overlay={this.menu(hasValidationErrors, isNoWApplication)}
                    placement="bottomLeft"
                  >
                    <Button type="primary" className="full-mobile">
                      Process <DownOutlined />
                    </Button>
                  </Dropdown>
                </AuthorizationWrapper>
              )}
              {isProcessed && !isApproved && (
                <AuthorizationWrapper permission={Permission.ADMIN}>
                  <Button type="secondary" className="full-mobile" onClick={this.openStatusModal}>
                    Revert Status
                  </Button>
                </AuthorizationWrapper>
              )}
            </>
          }
        />
        <div
          className={
            this.props.fixedTop ? "side-menu--timeline with-fixed-top" : "side-menu--timeline"
          }
        >
          <Timeline>
            {this.props.progressStatusCodes
              .sort((a, b) => (a.display_order > b.display_order ? 1 : -1))
              .filter(({ application_progress_status_code }) =>
                APPLICATION_PROGRESS_TRACKING[
                  this.props.noticeOfWork.application_type_code
                ].includes(application_progress_status_code)
              )
              .map((progressStatus) => TimelineItem(this.props.progress, progressStatus))}
          </Timeline>
        </div>
        <div className="view--content side-menu--content">
          {// Permit is issued
          isApproved && (
            <Result
              style={{ paddingTop: "0px" }}
              status="success"
              title={`This ${isAmendment ? "amendment" : "permit"} has been successfully issued.`}
              extra={[
                <Row>
                  <Col
                    lg={{ span: 12, offset: 6 }}
                    md={{ span: 16, offset: 4 }}
                    sm={{ span: 20, offset: 2 }}
                    style={{ textAlign: "center" }}
                  >
                    <Button
                      onClick={() =>
                        this.props.history.push(
                          route.MINE_PERMITS.dynamicRoute(this.props.mineGuid)
                        )
                      }
                    >
                      <LinkOutlined /> View permit on the mine record
                    </Button>
                  </Col>
                </Row>,
              ]}
            />
          )}
          {// Permit is ready to be issued
          !isApproved && !hasValidationErrors && (
            <Result
              style={{ paddingTop: "0px" }}
              status="success"
              extra={
                <div style={{ textAlign: "left", width: "100%" }}>
                  <Row className="padding-md--bottom" justify="center">
                    <Col>
                      <h3>{`This ${
                        isAmendment ? "amendment" : "permit"
                      } is ready to be processed and issued.`}</h3>
                    </Col>
                  </Row>
                </div>
              }
            />
          )}
          {// Validation Errors
          !isApproved && (hasValidationErrors || hasValidationWarnings) && (
            <Result
              style={{ paddingTop: "0px" }}
              status="warning"
              extra={
                <div style={{ textAlign: "left", width: "100%" }}>
                  {hasValidationErrors && (
                    <>
                      <Row className="padding-md--bottom" justify="center">
                        <Col>
                          <h3>{`The following issues shall be resolved before you can issue this ${
                            isAmendment ? "amendment" : "permit"
                          }.`}</h3>
                        </Col>
                      </Row>
                      {validationErrors.map((message) => (
                        <Row className="padding-md--bottom">
                          <Col offset={2} span={2}>
                            <StopOutlined className="icon-sm padding-sm--top" />
                          </Col>
                          <Col span={16}>
                            {`${message.message}  `}
                            {message.route && (
                              <LinkButton onClick={() => this.props.history.push(message.route)}>
                                <LinkOutlined /> Resolve
                              </LinkButton>
                            )}
                          </Col>
                        </Row>
                      ))}
                      <div className="padding-lg--bottom" />
                    </>
                  )}
                  {hasValidationWarnings && (
                    <>
                      <Row className="padding-md--bottom" justify="center">
                        <Col>
                          <h3>{`Review the following warnings before issuing the  ${
                            isAmendment ? "amendment" : "permit"
                          }.`}</h3>
                        </Col>
                      </Row>
                      {validationWarnings.map((message) => (
                        <Row className="padding-md--bottom">
                          <Col offset={2} span={2}>
                            <WarningOutlined className="icon-sm padding-sm--top" />
                          </Col>
                          <Col span={16}>
                            {`${message.message}  `}
                            {message.route && (
                              <LinkButton onClick={() => this.props.history.push(message.route)}>
                                <LinkOutlined /> Resolve
                              </LinkButton>
                            )}
                          </Col>
                        </Row>
                      ))}
                    </>
                  )}
                </div>
              }
            />
          )}
        </div>
      </>
    );
  };
}

ProcessPermit.propTypes = propTypes;

const mapStateToProps = (state) => ({
  progress: getNOWProgress(state),
  progressStatusCodes: getDropdownNoticeOfWorkApplicationStatusCodes(state),
  appOptions: getNoticeOfWorkApplicationTypeOptions(state),
  draftPermit: getDraftPermitForNOW(state),
  draftAmendment: getDraftPermitAmendmentForNOW(state),
  documentContextTemplate: getDocumentContextTemplate(state),
  noticeOfWorkApplicationStatusOptionsHash: getNoticeOfWorkApplicationStatusOptionsHash(state),
  noticeOfWork: getNoticeOfWork(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      updateNoticeOfWorkStatus,
      fetchApplicationDelay,
      fetchImportedNoticeOfWorkApplication,
      generateNoticeOfWorkApplicationDocument,
      fetchNoticeOfWorkApplicationContextTemplate,
      patchPermitNumber,
      fetchDraftPermitByNOW,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ProcessPermit));
