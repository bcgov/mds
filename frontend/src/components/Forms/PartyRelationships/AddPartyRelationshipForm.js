import React, { Component } from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import { renderConfig } from "@/components/common/config";
import PartySelectField from "@/components/common/PartySelectField";
import * as FORM from "@/constants/forms";
import { required, validateDateRanges } from "@/utils/Validate";
import { EngineerOfRecordOptions } from "@/components/Forms/PartyRelationships/EngineerOfRecordOptions";
import { PermitteeOptions } from "@/components/Forms/PartyRelationships/PermitteeOptions";
import CustomPropTypes from "@/customPropTypes";
import PartyRelationshipFileUpload from "./PartyRelationshipFileUpload";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  // Prop is used indirectly. Linting is unable to detect it
  // eslint-disable-next-line react/no-unused-prop-types
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship).isRequired,
  partyRelationshipType: CustomPropTypes.partyRelationshipType.isRequired,
  mine: CustomPropTypes.mine,
  submitting: PropTypes.bool.isRequired,
};

const defaultProps = {
  mine: {},
};

const checkDatesForOverlap = (values, props) => {
  const existingAppointments = props.partyRelationships.filter(
    ({ mine_party_appt_type_code }) =>
      mine_party_appt_type_code === props.partyRelationshipType.mine_party_appt_type_code
  );
  const newAppt = { start_date: null, end_date: null, ...values };

  return validateDateRanges(existingAppointments, newAppt, props.partyRelationshipType.description);
};

const validate = (values, props) => {
  const errors = {};
  if (values.start_date && values.end_date) {
    if (Date.parse(values.start_date) > Date.parse(values.end_date)) {
      errors.end_date = "Must be after start date.";
    }
  }

  if (isEmpty(errors)) {
    const { start_date, end_date } = checkDatesForOverlap(values, props);
    errors.start_date = start_date;
    errors.end_date = end_date;
  }

  return errors;
};

export class AddPartyRelationshipForm extends Component {
  state = {
    uploadedFiles: [],
  };

  onFileLoad = (documentName, document_manager_guid) => {
    this.setState((prevState) => ({
      uploadedFiles: [[document_manager_guid, documentName], ...prevState.uploadedFiles],
    }));
  };

  onRemoveFile = (fileItem) => {
    this.setState((prevState) => ({
      uploadedFiles: prevState.uploadedFiles.filter((fileArr) => fileArr[0] !== fileItem.serverId),
    }));
  };

  render() {
    let options;

    switch (this.props.partyRelationshipType.mine_party_appt_type_code) {
      case "EOR":
        options = <EngineerOfRecordOptions mine={this.props.mine} />;
        break;
      case "PMT":
        options = <PermitteeOptions mine={this.props.mine} />;
        break;
      default:
        options = <div />;
        break;
    }

    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={16}>
          <Col md={24} xs={24}>
            <Form.Item>
              <PartySelectField
                id="party_guid"
                name="party_guid"
                validate={[required]}
                allowAddingParties
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="start_date"
                name="start_date"
                label="Start Date"
                placeholder="yyyy-mm-dd"
                component={renderConfig.DATE}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="end_date"
                name="end_date"
                label="End Date"
                placeholder="yyyy-mm-dd"
                component={renderConfig.DATE}
              />
            </Form.Item>
          </Col>
        </Row>
        {options}

        {this.props.partyRelationshipType.mine_party_appt_type_code === "MMG" && (
          <div>
            <h4>Mine Manager Appointment Letter</h4>
            <Form.Item>
              <Field
                id="PartyRelationshipFileUpload"
                name="PartyRelationshipFileUpload"
                onFileLoad={this.onFileLoad}
                onRemoveFile={this.onRemoveFile}
                mineGuid={this.props.mine.mine_guid}
                component={PartyRelationshipFileUpload}
              />
            </Form.Item>
          </div>
        )}

        <div className="right center-mobile">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={this.props.closeModal}
            okText="Yes"
            cancelText="No"
          >
            <Button className="full-mobile" type="secondary">
              Cancel
            </Button>
          </Popconfirm>
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            disabled={this.props.submitting}
          >
            {this.props.title}
          </Button>
        </div>
      </Form>
    );
  }
}

AddPartyRelationshipForm.propTypes = propTypes;
AddPartyRelationshipForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.ADD_PARTY_RELATIONSHIP,
  validate,
  touchOnBlur: false,
})(AddPartyRelationshipForm);
