/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Button, Menu, Popconfirm, Dropdown, Icon } from "antd";
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
} from "@common/actionCreators/permitActionCreator";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import GeneratePermitForm from "@/components/Forms/GeneratePermitForm";
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
  state = { isDraft: false, isViewMode: true, permittee: {} };

  componentDidMount() {
    // get permittee, save to state
    const permittee = this.props.noticeOfWork.contacts.filter(
      (contact) => contact.mine_party_appt_type_code_description === "Permittee"
    )[0];
    this.setState({ permittee });

    // fetch draft permit
    // set state isDraft
  }

  createPermit = () => {
    // generate permit number based on NoW application type
    let permitNo;
    const permitType = this.props.noticeOfWork.notice_of_work_type_code[0];
    console.log(permitType);
    const payload = {
      permittee_party_guid: this.state.permittee.party.party_guid,
      permit_status_code: "DFT",
      permit_is_exploration: false,
      permit_number: permitNo,
      permit_type: permitType,
    };
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
        <h2>Draft Permit</h2>
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
    console.log(this.props.formValues);
    // const { id } = this.props.match.params;
    // this.props
    //   .updateDraftPermit(this.props.formValues, this.props.noticeOfWork.now_application_guid)
    //   .then(() => {
    //     this.props.fetchDraftPermitFromNOW(id).then(() => {
    //       this.setState((prevState) => ({
    //         isViewMode: !prevState.isViewMode,
    //       }));
    //     });
    //   });
  };

  startDraftPermit = () => {
    this.setState({ isDraft: true });
    // create amendment object
    // if (isAmendment) {
    // createPermitAmendment
    // }
  };

  render() {
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
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      reset,
      createPermit,
      fetchPermits,
      createPermitAmendment,
      updatePermitAmendment,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(NOWPermitGeneration);
