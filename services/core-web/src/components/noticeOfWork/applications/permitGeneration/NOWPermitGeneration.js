import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { isEmpty } from "lodash";
import { Button, Menu, Popconfirm, Dropdown, Result, Row, Col } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { formatDate } from "@common/utils/helpers";
import { getFormValues, reset } from "redux-form";
import { getNoticeOfWorkApplicationTypeOptions } from "@common/selectors/staticContentSelectors";
import {
  createPermit,
  fetchPermits,
  createPermitAmendment,
  updatePermitAmendment,
  fetchDraftPermitByNOW,
} from "@common/actionCreators/permitActionCreator";
import {
  getPermits,
  getDraftPermitForNOW,
  getDraftPermitAmendmentForNOW,
} from "@common/selectors/permitSelectors";
import * as FORM from "@/constants/forms";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import GeneratePermitForm from "@/components/Forms/permits/GeneratePermitForm";
import PreDraftPermitForm from "@/components/Forms/permits/PreDraftPermitForm";
import NullScreen from "@/components/common/NullScreen";
import * as routes from "@/constants/routes";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

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
  createPermit: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  createPermitAmendment: PropTypes.func.isRequired,
  updatePermitAmendment: PropTypes.func.isRequired,
  fetchDraftPermitByNOW: PropTypes.func.isRequired,
  formValues: CustomPropTypes.permitGenObj.isRequired,
  preDraftFormValues: CustomPropTypes.preDraftForm.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  draftPermit: CustomPropTypes.permit.isRequired,
  draftPermitAmendment: CustomPropTypes.permitAmendment.isRequired,
  isAmendment: PropTypes.bool.isRequired,
};

const defaultProps = {};

const originalPermit = "OGP";

const regionHash = {
  SE: "Cranbrook",
  SC: "Kamloops",
  NE: "Prince George",
  NW: "Smithers",
  SW: "Victoria",
};

export class NOWPermitGeneration extends Component {
  state = {
    isPreDraft: false,
    isDraft: false,
    permittee: {},
    permitGenObj: {},
    isLoaded: false,
  };

  componentDidMount() {
    const permittee = this.props.noticeOfWork.contacts.filter(
      (contact) => contact.mine_party_appt_type_code_description === "Permittee"
    )[0];
    this.setState({ permittee });
    this.props.fetchPermits(this.props.noticeOfWork.mine_guid);
    this.handleDraftPermit();
  }

  handleDraftPermit = () => {
    this.props
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
          this.setState({ isDraft: !isEmpty(this.props.draftPermitAmendment), permitGenObj });
        }
        this.setState({ isLoaded: true });
      });
  };

  createPermit = (isExploration) => {
    this.setState({ isLoaded: false });
    // this logic will be moved to the BE when we generate Permit #
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const correctPermitType =
      this.props.noticeOfWork.notice_of_work_type_code[0] === "S"
        ? "G"
        : this.props.noticeOfWork.notice_of_work_type_code[0];
    const permitNo = isExploration
      ? `${correctPermitType}X-${randomNumber}`
      : `${correctPermitType}-${randomNumber}`;
    const payload = {
      permit_status_code: "D",
      permit_is_exploration: isExploration,
      permit_no: permitNo,
      now_application_guid: this.props.noticeOfWork.now_application_guid,
    };
    this.props.createPermit(this.props.noticeOfWork.mine_guid, payload).then(() => {
      this.handleDraftPermit();
    });
  };

  createPermitGenObject = (noticeOfWork, draftPermit, amendment = {}) => {
    const permitGenObject = {
      permit_number: "",
      issue_date: moment().format("MMM DD YYYY"),
      auth_end_date: "",
      regional_office: regionHash[noticeOfWork.mine_region],
      current_date: moment().format("Do"),
      current_month: moment().format("MMMM"),
      current_year: moment().format("YYYY"),
      conditions: "",
      lead_inspector_title: "Inspector of Mines",
    };
    permitGenObject.mine_no = noticeOfWork.mine_no;

    const permittee = noticeOfWork.contacts.filter(
      (contact) => contact.mine_party_appt_type_code_description === "Permittee"
    )[0];

    const originalAmendment = draftPermit.permit_amendments.filter(
      (org) => org.permit_amendment_type_code === originalPermit
    )[0];

    permitGenObject.permittee = permittee.party.name;
    permitGenObject.permittee_email = permittee.party.email;
    permitGenObject.permittee_mailing_address = `${permittee.party.address[0].address_line_1}\n${permittee.party.address[0].city} ${permittee.party.address[0].sub_division_code} ${permittee.party.address[0].post_code}`;
    permitGenObject.property = noticeOfWork.property_name;
    permitGenObject.mine_location = `Latitude: ${noticeOfWork.latitude}, Longitude: ${noticeOfWork.longitude}`;
    permitGenObject.application_date = noticeOfWork.submitted_date;
    permitGenObject.permit_number = draftPermit.permit_no;
    permitGenObject.auth_end_date = noticeOfWork.proposed_end_date;
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

  handlePermitGenSubmit = () => {
    const newValues = this.props.formValues;
    if (this.props.isAmendment) {
      newValues.original_permit_issue_date = formatDate(
        this.props.formValues.original_permit_issue_date
      );
    }
    newValues.auth_end_date = formatDate(this.props.formValues.auth_end_date);
    this.props.handleGenerateDocumentFormSubmit(this.props.documentType, {
      ...newValues,
      document_list: this.createDocList(this.props.noticeOfWork),
    });
  };

  handleCancelDraftEdit = () => {
    this.props.reset(FORM.GENERATE_PERMIT);
    this.props.toggleEditMode();
  };

  handleSaveDraftEdit = () => {
    this.setState({ isLoaded: false });
    const payload = {
      lead_inspector_title: this.props.formValues.lead_inspector_title,
      regional_office: this.props.formValues.regional_office,
    };
    this.props
      .updatePermitAmendment(
        this.props.noticeOfWork.mine_guid,
        this.props.draftPermit.permit_guid,
        this.props.draftPermitAmendment.permit_amendment_guid,
        payload
      )
      .then(() => {
        this.handleDraftPermit();
        this.props.toggleEditMode();
      });
  };

  startDraftPermit = () => {
    this.setState({ isLoaded: false });
    if (this.props.preDraftFormValues.permit_guid) {
      const payload = {
        permit_amendment_status_code: "DFT",
        now_application_guid: this.props.noticeOfWork.now_application_guid,
      };
      this.props
        .createPermitAmendment(
          this.props.noticeOfWork.mine_guid,
          this.props.preDraftFormValues.permit_guid,
          payload
        )
        .then(() => {
          this.handleDraftPermit();
        });
    } else {
      this.createPermit(this.props.preDraftFormValues.is_exploration);
    }
  };

  startPreDraft = () => {
    const isNewPermit = this.props.noticeOfWork.type_of_application === "New Permit";
    const isCoalOrMineral =
      this.props.noticeOfWork.notice_of_work_type_code === "MIN" ||
      this.props.noticeOfWork.notice_of_work_type_code === "COL";
    if (isNewPermit && !isCoalOrMineral) {
      this.createPermit(false);
    } else {
      this.setState({ isPreDraft: true });
    }
  };

  cancelPreDraft = () => {
    this.setState({ isPreDraft: false });
  };

  menu = () => {
    return (
      <Menu>
        <Menu.Item key="edit" onClick={this.props.toggleEditMode}>
          Edit
        </Menu.Item>
      </Menu>
    );
  };

  renderEditModeNav = () => {
    const nowType = this.props.noticeOfWork.type_of_application
      ? `(${this.props.noticeOfWork.type_of_application})`
      : "";
    return this.props.isViewMode ? (
      <div className="inline-flex block-mobile padding-md between">
        <h2>{`Draft Permit ${nowType}`}</h2>
        {this.state.isDraft && (
          <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
            <Dropdown overlay={this.menu()} placement="bottomLeft">
              <Button type="secondary" className="full-mobile">
                Actions
                <DownOutlined />
              </Button>
            </Dropdown>
          </AuthorizationWrapper>
        )}
      </div>
    ) : (
      <div className="center padding-md">
        <div className="inline-flex flex-center block-mobile">
          <Popconfirm
            placement="bottomRight"
            title="You have unsaved changes, Are you sure you want to cancel?"
            onConfirm={this.handleCancelDraftEdit}
            okText="Yes"
            cancelText="No"
          >
            <Button type="secondary" className="full-mobile">
              Cancel
            </Button>
          </Popconfirm>
          <Button className="full-mobile" type="tertiary" onClick={this.handlePermitGenSubmit}>
            Preview
          </Button>
          <Button type="primary" className="full-mobile" onClick={this.handleSaveDraftEdit}>
            Save
          </Button>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div>
        <div className={this.props.fixedTop ? "view--header fixed-scroll" : "view--header"}>
          {this.renderEditModeNav()}
        </div>
        {!isEmpty(this.state.permittee) ? (
          <>
            <div className={this.props.fixedTop ? "side-menu--fixed" : "side-menu"}>
              <NOWSideMenu
                route={routes.NOTICE_OF_WORK_APPLICATION}
                noticeOfWorkType={this.props.noticeOfWork.notice_of_work_type_code}
                tabSection="draft-permit"
              />
            </div>
            <div
              className={
                this.props.fixedTop
                  ? "view--content with-fixed-top side-menu--content"
                  : "view--content side-menu--content"
              }
            >
              <LoadingWrapper condition={this.state.isLoaded}>
                {!this.state.isDraft ? (
                  <div className="null-screen">
                    {this.state.isPreDraft ? (
                      <Result
                        status="success"
                        title={`${this.props.noticeOfWork.type_of_application}`}
                        subTitle={
                          this.props.isAmendment
                            ? `You are now creating an amendment for a permit. Please select the permit that this amendment is for.`
                            : `You are now creating a new permit. Please check the box below if this is an exploratory permit.`
                        }
                        extra={[
                          <Row>
                            <Col
                              lg={{ span: 8, offset: 8 }}
                              md={{ span: 10, offset: 7 }}
                              sm={{ span: 12, offset: 6 }}
                            >
                              <PreDraftPermitForm
                                cancelPreDraft={this.cancelPreDraft}
                                permits={this.props.permits}
                                isAmendment={this.props.isAmendment}
                                onSubmit={this.startDraftPermit}
                              />
                            </Col>
                          </Row>,
                        ]}
                      />
                    ) : (
                      <>
                        <NullScreen type="draft-permit" />
                        <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                          <Button onClick={this.startPreDraft}>Start Draft Permit</Button>
                        </AuthorizationWrapper>
                      </>
                    )}
                  </div>
                ) : (
                  <GeneratePermitForm
                    initialValues={this.state.permitGenObj}
                    isAmendment={this.props.isAmendment}
                    noticeOfWork={this.props.noticeOfWork}
                    isViewMode={this.props.isViewMode}
                  />
                )}
              </LoadingWrapper>
            </div>
          </>
        ) : (
          <NullScreen type="no-permittee" />
        )}
      </div>
    );
  }
}

NOWPermitGeneration.propTypes = propTypes;
NOWPermitGeneration.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  appOptions: getNoticeOfWorkApplicationTypeOptions(state),
  formValues: getFormValues(FORM.GENERATE_PERMIT)(state),
  preDraftFormValues: getFormValues(FORM.PRE_DRAFT_PERMIT)(state),
  permits: getPermits(state),
  draftPermit: getDraftPermitForNOW(state),
  draftPermitAmendment: getDraftPermitAmendmentForNOW(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      reset,
      createPermit,
      fetchPermits,
      createPermitAmendment,
      updatePermitAmendment,
      fetchDraftPermitByNOW,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(NOWPermitGeneration);
