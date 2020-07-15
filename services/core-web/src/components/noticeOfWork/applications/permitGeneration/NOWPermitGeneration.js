/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
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
import { getDraftPermits, getPermits } from "@common/selectors/permitSelectors";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import GeneratePermitForm from "@/components/Forms/permits/GeneratePermitForm";
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
  state = { isDraft: false, isViewMode: true, permittee: {}, permit: {}, isExploration: {} };

  componentDidMount() {
    // get permittee, save to state
    const permittee = this.props.noticeOfWork.contacts.filter(
      (contact) => contact.mine_party_appt_type_code_description === "Permittee"
    )[0];
    this.setState({ permittee });
    this.props.fetchPermits(this.props.noticeOfWork.mine_guid).then(() => {
      console.log("WE GETTING PERMITS");
    });
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
        if (this.props.draftPermits.length >= 1) {
          const draft = this.props.draftPermits[0].permit_amendments.filter(
            (amendment) =>
              amendment.now_application_guid === this.props.noticeOfWork.now_application_guid
          );
          this.setState({ isDraft: true, draft: draft[0] });
        }
      });
  };
  createPermit = () => {
    // generate permit number based on NoW application type
    // GENERATE A RANDOM NUMBER BASED OFF TYPE
    let permitNo = "P-146734634";
    const permitType = this.props.noticeOfWork.notice_of_work_type_code[0];
    const permitObj = this.createPermitGenObject(this.props.noticeOfWork);
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

  createPermitGenObject = (noticeOfWork) => {
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
    permitGenObject.permit_no =
      this.props.draftPermits.length >= 1 ? this.props.draftPermits[0].permit_no : "";
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
    const payload = {
      ...this.props.formValues,
      now_application_guid: this.state.draft.now_application_guid,
    };
    this.props
      .updatePermitAmendment(
        this.props.noticeOfWork.mine_guid,
        this.props.draftPermits[0].permit_guid,
        this.state.draft.permit_amendment_guid,
        this.props.formValues
      )
      .then(() => {
        this.handleDraftPermit();
        this.setState({ isViewMode: true });
      });
  };

  startDraftPermit = () => {
    // this.setState({ isDraft: true });
    // create amendment object
    if (this.state.isAmendment) {
      // createPermitAmendment
    } else {
      this.createPermit();
    }
  };

  render() {
    console.log(this.state.draft);
    console.log(this.props.permits);
    const isAmendment = this.props.noticeOfWork.type_of_application !== "New Permit";
    const permittee =
      this.props.noticeOfWork.contacts &&
      this.props.noticeOfWork.contacts.filter(
        (contact) => contact.mine_party_appt_type_code_description === "Permittee"
      )[0];
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
                  <NullScreen type="draft-permit" />
                  <Button onClick={this.startDraftPermit}>Start Draft Permit</Button>
                  <Result
                    status="success"
                    title={`${this.props.noticeOfWork.type_of_application}`}
                    subTitle={
                      isAmendment
                        ? `Creating an ${this.props.noticeOfWork.type_of_application}, please select the related permit`
                        : `Creating a ${this.props.noticeOfWork.type_of_application}, please let us know if this is an exploration permit`
                    }
                    extra={[
                      <Row>
                        <Col
                          lg={{ span: 8, offset: 8 }}
                          md={{ span: 10, offset: 7 }}
                          sm={{ span: 12, offset: 6 }}
                        >
                          <p>select permit</p>
                        </Col>
                      </Row>,
                    ]}
                  />
                </div>
              ) : (
                <GeneratePermitForm
                  initialValues={this.createPermitGenObject(this.props.noticeOfWork)}
                  cancelGeneration={this.props.returnToPrevStep}
                  documentList={this.createDocList(this.props.noticeOfWork)}
                  onSubmit={this.handlePremitGenSubmit}
                  isAmendment={isAmendment}
                  noticeOfWork={this.props.noticeOfWork}
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
  formValues: getFormValues(FORM.PRE_DRAFT_PERMIT)(state),
  draftPermits: getDraftPermits(state),
  permits: getPermits(state),
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
