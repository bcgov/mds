/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { isEmpty } from "lodash";
import { Button, Menu, Popconfirm, Dropdown, Icon, Result, Alert, Row, Col } from "antd";
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
  getDraftPermits,
  getPermits,
  getDraftPermitForNOW,
} from "@common/selectors/permitSelectors";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import GeneratePermitForm from "@/components/Forms/permits/GeneratePermitForm";
import PreDraftPermitForm from "@/components/Forms/permits/PreDraftPermitForm";
import NullScreen from "@/components/common/NullScreen";
import * as routes from "@/constants/routes";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";

/**
 * @class NOWPermitGeneration - contains the form and information to generate a permit document form a Notice of Work
 */

const propTypes = {
  returnToPrevStep: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  appOptions: PropTypes.arrayOf(CustomPropTypes.options).isRequired,
  handleGenerateDocumentFormSubmit: PropTypes.func.isRequired,
  documentType: PropTypes.objectOf(PropTypes.any).isRequired,
  isAmendment: PropTypes.bool.isRequired,
};

const defaultProps = {};

const amalgamatedPermit = "ALG";
const originalPermit = "OGP";

export class NOWPermitGeneration extends Component {
  state = { isPreDraft: false, isDraft: false, isViewMode: true, permittee: {}, permitObj: {} };

  componentDidMount() {
    // get permittee, save to state
    const permittee = this.props.noticeOfWork.contacts.filter(
      (contact) => contact.mine_party_appt_type_code_description === "Permittee"
    )[0];
    this.setState({ permittee });
    this.props.fetchPermits(this.props.noticeOfWork.mine_guid);
    this.handleDraftPermit();
    // fetch draft permit
    // set state isDraft
  }
  handleDraftPermit = () => {
    this.props
      .fetchDraftPermitByNOW(
        this.props.noticeOfWork.mine_guid,
        this.props.noticeOfWork.now_application_guid
      )
      .then((data) => {
        if (!isEmpty(this.props.draftPermitForNOW)) {
          const draft = this.props.draftPermitForNOW.permit_amendments.filter(
            (amendment) =>
              amendment.now_application_guid === this.props.noticeOfWork.now_application_guid
          );
          const permitObj = this.createPermitGenObject(
            this.props.noticeOfWork,
            this.props.draftPermitForNOW
          );
          this.setState({ isDraft: true, draftAmendment: draft[0], permitObj });
        }
      });
  };
  createPermit = (isExploration) => {
    // generate permit number based on NoW application type
    // GENERATE A RANDOM NUMBER BASED OFF TYPE
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const permitType = this.props.noticeOfWork.notice_of_work_type_code[0];
    const correctPermitType =
      this.props.noticeOfWork.notice_of_work_type_code[0] === "S"
        ? "G"
        : this.props.noticeOfWork.notice_of_work_type_code[0];
    let permitNo = isExploration
      ? `${correctPermitType}X-${randomNumber}`
      : `${correctPermitType}-${randomNumber}`;
    const payload = {
      permittee_party_guid: this.state.permittee.party.party_guid,
      permit_status_code: "D",
      permit_is_exploration: false,
      permit_no: permitNo,
      permit_type: permitType,
      now_application_guid: this.props.noticeOfWork.now_application_guid,
    };
    this.props.createPermit(this.props.noticeOfWork.mine_guid, payload).then(() => {
      this.setState({ isDraft: true });
    });
  };

  createPermitGenObject = (noticeOfWork, draftPermit) => {
    const permitGenObject = {
      permit_number: "",
      issue_date: moment().format("MMM DD YYYY"),
      auth_end_date: "",
      regional_office: "",
      current_date: moment().format("Do"),
      current_month: moment().format("MMMM"),
      current_year: moment().format("YYYY"),
      conditions: "",
    };
    permitGenObject.mine_no = noticeOfWork.mine_no;

    const permittee = noticeOfWork.contacts.filter(
      (contact) => contact.mine_party_appt_type_code_description === "Permittee"
    )[0];

    permitGenObject.permittee = permittee.party.name;
    permitGenObject.permittee_email = permittee.party.email;
    permitGenObject.permittee_mailing_address = `${permittee.party.address[0].address_line_1}\n${permittee.party.address[0].city} ${permittee.party.address[0].sub_division_code} ${permittee.party.address[0].post_code}`;
    permitGenObject.property = noticeOfWork.property_name;
    permitGenObject.mine_location = `Latitude: ${noticeOfWork.latitude}, Longitude: ${noticeOfWork.longitude}`;
    permitGenObject.application_date = noticeOfWork.submitted_date;
    permitGenObject.permit_number = draftPermit.permit_no;
    permitGenObject.auth_end_date = noticeOfWork.proposed_end_date;
    permitGenObject.application_type = this.props.appOptions.filter(
      (option) => option.notice_of_work_type_code === noticeOfWork.notice_of_work_type_code
    )[0].description;
    permitGenObject.lead_inspector = noticeOfWork.lead_inspector.name;
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

  handlePremitGenSubmit = (values) => {
    const newValues = values;
    if (this.props.isAmendment) {
      newValues.original_permit_issue_date = formatDate(values.original_permit_issue_date);
    }
    newValues.auth_end_date = formatDate(values.auth_end_date);
    this.props.handleGenerateDocumentFormSubmit(this.props.documentType, {
      ...newValues,
      document_list: this.createDocList(this.props.noticeOfWork),
    });
  };

  toggleEditMode = () => {
    this.setState((prevState) => ({ isViewMode: !prevState.isViewMode }));
  };

  menu = () => {
    return (
      <Menu>
        <Menu.Item key="edit" onClick={this.toggleEditMode}>
          Edit
        </Menu.Item>
      </Menu>
    );
  };

  renderEditModeNav = () => {
    return this.state.isViewMode ? (
      <div className="inline-flex block-mobile padding-md between">
        <h2>{`Draft Permit (${this.props.noticeOfWork.type_of_application})`}</h2>
        {this.state.isDraft && (
          <Dropdown overlay={this.menu()} placement="bottomLeft">
            <Button type="secondary" className="full-mobile">
              Actions
              <Icon type="down" />
            </Button>
          </Dropdown>
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
          <Button type="primary" className="full-mobile" onClick={this.handleSaveDraftEdit}>
            Save
          </Button>
        </div>
      </div>
    );
  };

  handleCancelDraftEdit = () => {
    this.props.reset(FORM.GENERATE_PERMIT);
    this.setState((prevState) => ({
      isViewMode: !prevState.isViewMode,
    }));
  };

  handleSaveDraftEdit = () => {
    // console.log(this.props.formValues);
    const payload = {
      // ...this.state.draft,
      issue_date: null,
      authorization_end_date: this.props.formValues.authorization_end_date,
      permit_amendment_status_code: "DFT",
      lead_inspector_title: this.props.formValues.lead_inspector_title,
      regional_office: this.props.formValues.regional_office,
      now_application_guid: this.props.noticeOfWork.now_application_guid,
    };
    // delete payload.permit_amendment_guid;
    // delete payload.permit_amendment_id;
    this.props
      .updatePermitAmendment(
        this.props.noticeOfWork.mine_guid,
        this.props.draftPermitForNOW.permit_guid,
        this.state.draftAmendment.permit_amendment_guid,
        payload
      )
      .then(() => {
        this.handleDraftPermit();
        this.setState({ isViewMode: true });
      });
  };

  startDraftPermit = () => {
    // console.log(this.state.permittee)
    if (this.props.preDraftFormValues.permit_guid) {
      const payload = {
        issue_date: moment().format("YYYY-MM-DD"),
        permittee_party_guid: this.state.permittee.party.party_guid,
        // authorization_end_date: this.props.formValues.authorization_end_date,
        permit_amendment_status_code: "DFT",
        now_application_guid: this.props.noticeOfWork.now_application_guid,
        // lead_inspector_title: this.props.formValues.lead_inspector_title,
        // regional_office: this.props.formValues.regional_office,
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
      // createPermitAmendment
    } else {
      this.createPermit(this.props.preDraftFormValues.isExploration);
    }
  };

  startPreDraft = () => {
    const isAmendment = this.props.noticeOfWork.type_of_application !== "New Permit";
    const isCoalorMineral =
      this.props.noticeOfWork.notice_of_work_type_code === "MIN" ||
      this.props.noticeOfWork.notice_of_work_type_code === "COL";
    if (!isAmendment && isCoalorMineral) {
      this.createPermit(false);
    } else {
      this.setState({ isPreDraft: true });
    }
  };

  render() {
    console.log(this.props.draftPermitForNOW);
    console.log(this.state.draftAmendment);
    const isAmendment = this.props.noticeOfWork.type_of_application !== "New Permit";
    const permittee =
      this.props.noticeOfWork.contacts &&
      this.props.noticeOfWork.contacts.filter(
        (contact) => contact.mine_party_appt_type_code_description === "Permittee"
      )[0];
    const isCoalorMineral =
      this.props.noticeOfWork.notice_of_work_type_code === "MIN" ||
      this.props.noticeOfWork.notice_of_work_type_code === "COL";
    return (
      <div>
        <div className={this.props.fixedTop ? "view--header fixed-scroll" : "view--header"}>
          {this.renderEditModeNav()}
        </div>
        {permittee ? (
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
              {!this.state.isDraft ? (
                <div className="null-screen">
                  {this.state.isPreDraft ? (
                    <Result
                      status="success"
                      title={`${this.props.noticeOfWork.type_of_application}`}
                      subTitle={
                        isAmendment
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
                              permits={this.props.permits}
                              isAmendment={isAmendment}
                              onSubmit={this.startDraftPermit}
                            />
                          </Col>
                        </Row>,
                      ]}
                    />
                  ) : (
                    <>
                      <NullScreen type="draft-permit" />
                      <Button onClick={this.startPreDraft}>Start Draft Permit</Button>
                    </>
                  )}
                </div>
              ) : (
                <GeneratePermitForm
                  initialValues={this.state.permitObj}
                  cancelGeneration={this.props.returnToPrevStep}
                  documentList={this.createDocList(this.props.noticeOfWork)}
                  onSubmit={this.handlePremitGenSubmit}
                  isAmendment={isAmendment}
                  noticeOfWork={this.props.noticeOfWork}
                  isViewMode={this.state.isViewMode}
                />
              )}
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
  draftPermits: getDraftPermits(state),
  permits: getPermits(state),
  draftPermitForNOW: getDraftPermitForNOW(state),
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
