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
  RightCircleOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { getNoticeOfWork, getNOWProgress } from "@common/selectors/noticeOfWorkSelectors";
import { getDocumentContextTemplate } from "@/reducers/documentReducer";
import {
  generateNoticeOfWorkApplicationDocument,
  fetchNoticeOfWorkApplicationContextTemplate,
} from "@/actionCreators/documentActionCreator";
import { connect } from "react-redux";
import { formatDate } from "@common/utils/helpers";
import { bindActionCreators } from "redux";
import {
  getDropdownNoticeOfWorkApplicationStatusCodes,
  getNoticeOfWorkApplicationStatusOptionsHash,
 getNoticeOfWorkApplicationTypeOptions } from "@common/selectors/staticContentSelectors";

import {
  updateNoticeOfWorkStatus,
  fetchApplicationDelay,
  fetchImportedNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import CustomPropTypes from "@/customPropTypes";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@common/actions/modalActions";
import NOWStatusIndicator from "@/components/noticeOfWork/NOWStatusIndicator";
import {
  getDraftPermitForNOW,
  getDraftPermitAmendmentForNOW,
} from "@common/selectors/permitSelectors";
import { fetchDraftPermitByNOW } from "@common/actionCreators/permitActionCreator";
import NOWProgressActions from "@/components/noticeOfWork/NOWProgressActions";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import * as route from "@/constants/routes";

/**
 * @class ProcessPermit - Process the permit. We've got to process this permit. Process this permit, proactively!
 */
const approvedCode = "AIA";
const approvedLetterCode = "NPE";
const rejectedCode = "REJ";
const rejectedLetterCode = "RJL";
const WithDrawnLetterCode = "WDL";
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
  fetchDraftPermitByNOW: PropTypes.func.isRequired,
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
      <Timeline.Item dot={<StopOutlined className="icon-lg--grey" />}>
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

export class ProcessPermit extends Component {
  state = {};

  componentDidMount = () => {
    this.props.fetchApplicationDelay(this.props.noticeOfWork.now_application_guid);
    this.props.fetchDraftPermitByNOW(
      this.props.mineGuid,
      this.props.noticeOfWork.now_application_guid
    );
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
        letterCode: WithDrawnLetterCode,
      },
    };
    const signature = this.props.noticeOfWork?.issuing_inspector?.signature;

    this.props
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
            onSubmit: (values) => this.handleApplication(values, type),
            type,
            generateDocument: this.handleGenerateDocumentFormSubmit,
            draftAmendment: this.props.draftAmendment,
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

    return permitGenObject;
  };

  createDocList = (noticeOfWork) => {
    return noticeOfWork.documents
      .filter((document) => document.is_final_package)
      .map((document) => ({
        document_name: document.mine_document.document_name,
        document_upload_date: formatDate(document.mine_document.upload_date),
      }));
  };

  afterSuccess = (values, message, code) => {
    this.props
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
      this.handleApprovedApplication(values, code);
    } else {
      this.afterSuccess(values, "This application has been successfully rejected.", code);
    }
  };

  handleApprovedApplication = (values, code) => {
    const docType = this.props.noticeOfWork.type_of_application === "New Permit" ? "PMT" : "PMA";
    this.props
      .fetchNoticeOfWorkApplicationContextTemplate(
        docType,
        this.props.noticeOfWork.now_application_guid
      )
      .then(() => {
        // this.props.documentContextTemplate.document_template.form_spec.map(
        //   // eslint-disable-next-line
        //   (item) => (initialValues[item.id] = item["context-value"])
        // );
        const permitObj = this.createPermitGenObject(
          this.props.noticeOfWork,
          this.props.draftPermit,
          this.props.draftAmendment
        );
        permitObj.auth_end_date = formatDate(values.auth_end_date);
        permitObj.issue_date = formatDate(values.issue_date);

        this.handleGenerateDocumentFormSubmit(
          this.props.documentContextTemplate,
          {
            ...permitObj,
            document_list: this.createDocList(this.props.noticeOfWork),
          },
          this.afterSuccess(
            values,
            "Permit has been successfully issued for this application.",
            code
          )
        );
      });
  };

  updateApplicationStatus = (values) => {
    const statusLabel = this.props.noticeOfWorkApplicationStatusOptionsHash[
      values.now_application_status_code
    ];
    this.props
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

  handleGenerateDocumentFormSubmit = (documentType, values, afterSuccess = null) => {
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
        "Successfully created document and attached it to Notice of Work"
      )
      .then(() => afterSuccess && afterSuccess());
  };

  getValidationMessages = () => {
    const validationMessages = [];
    if (
      !(
        this.props.noticeOfWork.contacts &&
        this.props.noticeOfWork.contacts.some(
          (contact) => contact.mine_party_appt_type_code === "PMT"
        )
      )
    )
      validationMessages.push({ message: "Application must have a permittee." });
    if (
      !(
        this.props.draftAmendment &&
        (this.props.draftAmendment.security_received_date ||
          this.props.draftAmendment.security_not_required)
      )
    ) {
      validationMessages.push({ message: `The reclamation securities must be recorded.` });
    }
    if (
      !this.props.noticeOfWork.documents ||
      !this.props.noticeOfWork.documents.some(
        (doc) => doc.now_application_document_type_code === "MRP" && doc.is_final_package
      )
    ) {
      validationMessages.push({
        message: `The final application package requires a Mine Emergency Response Plan.`,
      });
    }
    this.props.progressStatusCodes
      .filter(
        (progressStatus) =>
          !this.props.progress[progressStatus.application_progress_status_code] ||
          !this.props.progress[progressStatus.application_progress_status_code].end_date
      )
      .forEach((progressStatus) =>
        validationMessages.push({ message: `${progressStatus.description} must be completed.` })
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
        onClick={() => this.openUpdateStatusGenerateLetterModal(WithDrawnLetterCode)}
      >
        Withdraw application
      </Menu.Item>
    </Menu>
  );

  render = () => {
    const validationMessages = this.getValidationMessages();
    const validationErrors = validationMessages.length > 0;
    const isAmendment = this.props.noticeOfWork.type_of_application !== "New Permit";
    const isProcessed =
      this.props.noticeOfWork.now_application_status_code === approvedCode ||
      this.props.noticeOfWork.now_application_status_code === rejectedCode;
    const isApproved = this.props.noticeOfWork.now_application_status_code === approvedCode;
    return (
      <div>
        <div className={this.props.fixedTop ? "view--header fixed-scroll" : "view--header"}>
          <div className="inline-flex block-mobile padding-md">
            <h2>
              Process Permit
              <CoreTooltip title="This page allows you to review the progress of the Notice of work and record decisions. You can also generate any decisions letters once a decision is made." />
            </h2>
            <NOWProgressActions tab="PRO" />
            {!isProcessed && (
              <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                <Dropdown overlay={this.menu(validationErrors)} placement="bottomLeft">
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
          </div>
          <NOWStatusIndicator type="banner" />
        </div>
        <>
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
            <Result
              status={(isApproved && "success") || (validationErrors && "warning") || "info"}
              title={
                (isApproved &&
                  `This ${isAmendment ? "amendment" : "permit"} has been successfully issued.`) ||
                (validationErrors &&
                  `The following issues must be resolved before you can issue this ${
                    isAmendment ? "amendment" : "permit"
                  }.`) ||
                `This ${isAmendment ? "amendment" : "permit"} is ready to be issued.`
              }
              extra={[
                <Row>
                  <Col
                    lg={{ span: 12, offset: 6 }}
                    md={{ span: 16, offset: 4 }}
                    sm={{ span: 20, offset: 2 }}
                    style={{ textAlign: isApproved ? "center" : "left" }}
                  >
                    {isApproved ? (
                      <Button
                        onClick={() =>
                          this.props.history.push(
                            route.MINE_PERMITS.dynamicRoute(this.props.mineGuid)
                          )
                        }
                      >
                        <LinkOutlined /> View permit on the mine record
                      </Button>
                    ) : (
                      validationMessages.map((message) => (
                        <Row style={{ paddingBottom: "8px" }}>
                          <Col span={2}>
                            <RightCircleOutlined />
                          </Col>
                          <Col span={22}>{message.message}</Col>
                        </Row>
                      ))
                    )}
                  </Col>
                </Row>,
              ]}
            />
          </div>
        </>
      </div>
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
      fetchDraftPermitByNOW,
      fetchImportedNoticeOfWorkApplication,
      generateNoticeOfWorkApplicationDocument,
      fetchNoticeOfWorkApplicationContextTemplate,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ProcessPermit));
