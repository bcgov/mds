import React, { Component } from "react";
import { isEmpty } from "lodash";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
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
} from "@common/selectors/staticContentSelectors";
import {
  updateNoticeOfWorkStatus,
  fetchApplicationDelay,
  fetchImportedNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import CustomPropTypes from "@/customPropTypes";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@common/actions/modalActions";
import NOWStatusIndicator from "@/components/noticeOfWork/NOWStatusIndicator";
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
const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchApplicationDelay: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  updateNoticeOfWorkStatus: PropTypes.func.isRequired,
  progress: PropTypes.objectOf(PropTypes.any).isRequired,
  progressStatusCodes: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
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
            onSubmit: (values) => this.rejectApplication(values, type),
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

  rejectApplication = (values, code) => {
    const message =
      code === approvedCode
        ? "Permit has been successfully issued for this application."
        : "This application has been successfully rejected.";
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
    this.props.generateNoticeOfWorkApplicationDocument(
      documentTypeCode,
      payload,
      "Successfully created document and attached it to Notice of Work"
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
          "The issuing inspector must have added a signature before the permit can be issued. Contact an administrator to update the inspector with a signature.",
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
            "application##contacts"
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
          "application##contacts"
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
          progressStatus.application_progress_status_code !== "" &&
          progressStatus.application_progress_status_code !== "CON" &&
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

    if (this.props.progress.CON?.start_date && !this.props.progress.CON?.end_date) {
      validationMessages.push({
        message: "Consultation must be completed.",
        route: ProgressRouteFor("CON", this.props.noticeOfWork?.now_application_guid),
      });
    }

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
    if (!this.props.progress.CON?.start_date) {
      validationMessages.push({
        message: "Consultation has not been started.",
        route: ProgressRouteFor("CON", this.props.noticeOfWork?.now_application_guid),
      });
    }

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
    const validationErrors = this.getValidationErrors();
    const validationWarnings = this.getValidationWarnings();
    const isValidationErrors = validationErrors.length > 0;
    const isValidationWarnings = validationWarnings.length > 0;
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
              {`Process ${isAmendment ? "Amendment" : "Permit"}`}
              <CoreTooltip title="This page allows you to review the progress of the Notice of work and record decisions. You can also generate any decisions letters once a decision is made." />
            </h2>
            <NOWProgressActions tab="PRO" />
            {!isProcessed && (
              <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                <Dropdown overlay={this.menu(isValidationErrors)} placement="bottomLeft">
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
          <div
            className="view--content side-menu--content"
            style={{ paddingTop: "0px", marginTop: "-15px" }}
          >
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
            !isApproved && !isValidationErrors && (
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
            !isApproved && (isValidationErrors || isValidationWarnings) && (
              <Result
                style={{ paddingTop: "0px" }}
                status="warning"
                extra={
                  <div style={{ textAlign: "left", width: "100%" }}>
                    {isValidationErrors && (
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
                    {isValidationWarnings && (
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
      </div>
    );
  };
}

ProcessPermit.propTypes = propTypes;

const mapStateToProps = (state) => ({
  progress: getNOWProgress(state),
  progressStatusCodes: getDropdownNoticeOfWorkApplicationStatusCodes(state),
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
