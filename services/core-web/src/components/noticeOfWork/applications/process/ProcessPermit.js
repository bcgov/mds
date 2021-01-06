import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import moment from "moment";
import { isEmpty } from "lodash";
import { Button, Menu, Dropdown, Timeline, Result, Row, Col, notification } from "antd";
import LinkButton from "@/components/common/LinkButton";
import {
  DownOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  LinkOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { getNoticeOfWork, getNOWProgress } from "@common/selectors/noticeOfWorkSelectors";
import { getDocumentContextTemplate } from "@/reducers/documentReducer";
import {
  generateNoticeOfWorkApplicationDocument,
  fetchNoticeOfWorkApplicationContextTemplate,
} from "@/actionCreators/documentActionCreator";
import { connect } from "react-redux";
import {
  formatDate,
  isPlacerAdjustmentFeeValid,
  isPitsQuarriesAdjustmentFeeValid,
} from "@common/utils/helpers";
import { bindActionCreators } from "redux";
import {
  getDropdownNoticeOfWorkApplicationStatusCodes,
  getNoticeOfWorkApplicationStatusOptionsHash,
  getNoticeOfWorkApplicationTypeOptions,
} from "@common/selectors/staticContentSelectors";
import {
  updateNoticeOfWorkStatus,
  fetchApplicationDelay,
  fetchImportedNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import CustomPropTypes from "@/customPropTypes";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  getDraftPermitForNOW,
  getDraftPermitAmendmentForNOW,
} from "@common/selectors/permitSelectors";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import * as route from "@/constants/routes";
import NOWTabHeader from "@/components/noticeOfWork/applications/NOWTabHeader";

/**
 * @class ProcessPermit - Process the permit. We've got to process this permit. Process this permit, proactively!
 */
const approvedCode = "AIA";
const approvedLetterCode = "NPE";
const rejectedCode = "REJ";
const rejectedLetterCode = "RJL";
const withdrawnLetterCode = "WDL";
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

const ProgressRouteFor = (code, now_application_guid) =>
  ({
    REV: route.NOTICE_OF_WORK_APPLICATION.dynamicRoute(now_application_guid, "application"),
    REF: route.NOTICE_OF_WORK_APPLICATION.dynamicRoute(now_application_guid, "referral"),
    CON: route.NOTICE_OF_WORK_APPLICATION.dynamicRoute(now_application_guid, "consultation"),
    PUB: route.NOTICE_OF_WORK_APPLICATION.dynamicRoute(now_application_guid, "public-comment"),
    DFT: route.NOTICE_OF_WORK_APPLICATION.dynamicRoute(now_application_guid, "draft-permit"),
  }[code]);

export class ProcessPermit extends Component {
  state = {};

  componentDidMount = () => {
    this.props.fetchApplicationDelay(this.props.noticeOfWork.now_application_guid);
  };

  openStatusModal = () => {
    this.props.openModal({
      props: {
        title: "Undo-Reject Application",
        onSubmit: this.updateApplicationStatus,
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
      WDL: {
        title: "Withdraw Application",
        statusCode: rejectedCode,
        letterCode: withdrawnLetterCode,
      },
    };
    const signature = this.props.noticeOfWork?.issuing_inspector?.signature;

    return this.props
      .fetchNoticeOfWorkApplicationContextTemplate(
        content[type].letterCode,
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
            title: content[type].title,
            documentType: this.props.documentContextTemplate,
            onSubmit: (values) => this.handleApplication(values, content[type].statusCode),
            type,
            generateDocument: this.handleGenerateDocumentFormSubmit,
            noticeOfWork: this.props.noticeOfWork,
            signature,
            issuingInspectorGuid: this.props.noticeOfWork?.issuing_inspector?.party_guid,
          },
          width: "50vw",
          content: modalConfig.NOW_STATUS_LETTER_MODAL,
        });
      });
  };

  createPermitGenObject = (noticeOfWork, draftPermit, amendment = {}) => {
    const permitGenObject = {
      permit_number: "",
      auth_end_date: "",
      regional_office: regionHash[noticeOfWork.mine_region],
      current_date: moment().format("Do"),
      current_month: moment().format("MMMM"),
      current_year: moment().format("YYYY"),
      conditions: "",
      issuing_inspector_title: "Inspector of Mines",
    };
    permitGenObject.mine_no = noticeOfWork.mine_no;
    permitGenObject.is_draft = false;
    const permittee = noticeOfWork.contacts.filter(
      (contact) => contact.mine_party_appt_type_code_description === "Permittee"
    )[0];
    const originalAmendment = draftPermit.permit_amendments.filter(
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
    permitGenObject.application_type = this.props.appOptions.filter(
      (option) => option.notice_of_work_type_code === noticeOfWork.notice_of_work_type_code
    )[0].description;
    permitGenObject.lead_inspector = noticeOfWork.lead_inspector.name;
    permitGenObject.regional_office = !amendment.regional_office
      ? regionHash[noticeOfWork.mine_region]
      : amendment.regional_office;

    debugger;
    console.log(draftPermit);
    if (amendment && !_.isEmpty(amendment)) {
      debugger;
      permitGenObject.permit_amendment_type_code = amendment.permit_amendment_type_code;
      if (permitGenObject.permit_amendment_type_code === "ALG") {
        permitGenObject.previous_amendment = this.createPreviousAmendmentGenObject(draftPermit);
      }
    }

    return permitGenObject;
  };

  createPreviousAmendmentGenObject = (permit) => {
    // gets and sorts in descending order amendments for selected permit
    debugger;
    const amendments =
      permit &&
      permit.permit_amendments
        .filter((a) => a.permit_amendment_status_code !== "DFT")
        .sort((a, b) => (a.issue_date < b.issue_date ? 1 : b.issue_date < a.issue_date ? -1 : 0));
    const previousAmendment = amendments[0];
    previousAmendment.issue_date = formatDate(previousAmendment.issue_date);
    previousAmendment.authorization_end_date = formatDate(previousAmendment.authorization_end_date);
    return previousAmendment;
  };

  createDocList = (noticeOfWork) => {
    const documents = noticeOfWork.filtered_submission_documents
      .filter((document) => document.is_final_package)
      .map((document) => ({
        document_name: document.filename,
        document_upload_date: "",
      }));
    return documents.concat(
      noticeOfWork.documents
        .filter((document) => document.is_final_package)
        .map((document) => ({
          document_name: document.mine_document.document_name,
          document_upload_date: formatDate(document.mine_document.upload_date),
        }))
    );
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
    if (code === approvedCode) {
      return this.handleApprovedApplication(values);
    }
    return this.afterSuccess(values, "This application has been successfully rejected.", code);
  };

  handleApprovedApplication = (values) => {
    const docType = this.props.noticeOfWork.type_of_application === "New Permit" ? "PMT" : "PMA";
    return this.props
      .fetchNoticeOfWorkApplicationContextTemplate(
        docType,
        this.props.noticeOfWork.now_application_guid
      )
      .then(() => {
        debugger;
        const permitObj = this.createPermitGenObject(
          this.props.noticeOfWork,
          this.props.draftPermit,
          this.props.draftAmendment
        );
        permitObj.auth_end_date = formatDate(values.auth_end_date);
        permitObj.issue_date = formatDate(values.issue_date);

        return this.handleGenerateDocumentFormSubmit(
          this.props.documentContextTemplate,
          {
            ...permitObj,
            document_list: this.createDocList(this.props.noticeOfWork),
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
            this.props.noticeOfWork?.issuing_inspector &&
            route.PARTY_PROFILE.dynamicRoute(
              this.props.noticeOfWork?.issuing_inspector?.party_guid
            ),
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

    // Progress
    this.props.progressStatusCodes
      .filter(
        (progressStatus) =>
          progressStatus.application_progress_status_code !== "CON" &&
          progressStatus.application_progress_status_code !== "REF" &&
          progressStatus.application_progress_status_code !== "PUB" &&
          (!this.props.progress[progressStatus.application_progress_status_code] ||
            !this.props.progress[progressStatus.application_progress_status_code].end_date)
      )
      .forEach((progressStatus) =>
        validationMessages.push({
          message: `${progressStatus.description} must be completed.`,
          route: ProgressRouteFor(
            progressStatus.application_progress_status_code,
            this.props.noticeOfWork?.now_application_guid
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
          !this.props.progress[progressStatus.application_progress_status_code]?.end_date
      )
      .forEach((progressStatus) =>
        validationMessages.push({
          message: `${progressStatus.description} must be completed.`,
          route: ProgressRouteFor(
            progressStatus.application_progress_status_code,
            this.props.noticeOfWork?.now_application_guid
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

    // Permittee
    if (
      this.props.noticeOfWork.contacts &&
      this.props.noticeOfWork.contacts.some(
        (contact) => contact.mine_party_appt_type_code === "PMT"
      )
    ) {
      const permittee = this.props.noticeOfWork.contacts.filter(
        (contact) => contact.mine_party_appt_type_code === "PMT"
      )[0];
      if (isEmpty(permittee.party.party_orgbook_entity)) {
        validationMessages.push({
          message:
            "Permittee has not been verified with OrgBook. Update the contact to associate them with an entity on OrgBook.",
          route:
            this.props.noticeOfWork?.issuing_inspector &&
            route.PARTY_PROFILE.dynamicRoute(
              this.props.noticeOfWork?.issuing_inspector?.party_guid
            ),
        });
      }
    }

    // Progress
    this.props.progressStatusCodes
      .filter(
        (progressStatus) =>
          (progressStatus.application_progress_status_code === "CON" ||
            progressStatus.application_progress_status_code === "REF" ||
            progressStatus.application_progress_status_code === "PUB") &&
          !this.props.progress[progressStatus.application_progress_status_code]?.start_date
      )
      .forEach((progressStatus) =>
        validationMessages.push({
          message: `${progressStatus.description} has not been started.`,
          route: ProgressRouteFor(
            progressStatus.application_progress_status_code,
            this.props.noticeOfWork?.now_application_guid
          ),
        })
      );

    return validationMessages;
  };

  menu = (validationErrors) => (
    <Menu>
      <Menu.Item
        key="issue-permit"
        onClick={() => this.openUpdateStatusGenerateLetterModal(approvedCode)}
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
        onClick={() => this.openUpdateStatusGenerateLetterModal(withdrawnLetterCode)}
      >
        Withdraw application
      </Menu.Item>
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
      this.props.noticeOfWork.now_application_status_code === rejectedCode;
    const isApproved = this.props.noticeOfWork.now_application_status_code === approvedCode;
    return (
      <>
        <NOWTabHeader
          tab="PRO"
          tabName="Process Permit"
          fixedTop={this.props.fixedTop}
          tabActions={
            <>
              {!isProcessed && (
                <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                  <Dropdown overlay={this.menu(hasValidationErrors)} placement="bottomLeft">
                    <Button type="primary" className="full-mobile">
                      Process <DownOutlined />
                    </Button>
                  </Dropdown>
                </AuthorizationWrapper>
              )}
              {isProcessed && !isApproved && (
                <AuthorizationWrapper permission={Permission.ADMIN}>
                  <Button type="secondary" className="full-mobile" onClick={this.openStatusModal}>
                    Undo-Reject Application
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
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ProcessPermit));
