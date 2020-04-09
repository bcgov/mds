import React, { Component } from "react";
import { Divider, Icon } from "antd";
import PropTypes from "prop-types";
import moment from "moment";
import { connect } from "react-redux";

import * as Strings from "@common/constants/strings";
import { formatDate } from "@common/utils/helpers";
import { getNoticeOfWorkApplicationTypeOptions } from "@common/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";
import GeneratePermitForm from "@/components/Forms/GeneratePermitForm";

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

export class NOWPermitGeneration extends Component {
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
    this.props.returnToPrevStep();
  };

  render() {
    return (
      <div>
        <LinkButton className="padding-large" onClick={this.props.returnToPrevStep}>
          <Icon type="arrow-left" style={{ paddingRight: "5px" }} />
          Back to Notice of Work: {this.props.noticeOfWork.now_number || Strings.EMPTY_FIELD}
        </LinkButton>
        <div className="page__content">
          <h1>Draft Permit</h1>
          <Divider />

          <GeneratePermitForm
            initialValues={this.createPermitGenObject(this.props.noticeOfWork)}
            cancelGeneration={this.props.returnToPrevStep}
            documentList={this.createDocList(this.props.noticeOfWork)}
            onSubmit={this.handlePremitGenSubmit}
            isAmendment={this.props.isAmendment}
          />
        </div>
      </div>
    );
  }
}

NOWPermitGeneration.propTypes = propTypes;
NOWPermitGeneration.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  appOptions: getNoticeOfWorkApplicationTypeOptions(state),
});

export default connect(mapStateToProps)(NOWPermitGeneration);
