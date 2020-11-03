/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Col, Row } from "antd";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import * as FORM from "@/constants/forms";
import UpdateNOWLeadInspectorForm from "@/components/Forms/noticeOfWork/UpdateNOWLeadInspectorForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  title: PropTypes.string.isRequired,
  lead_inspector_party_guid: PropTypes.string.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  updateLeadInspectorFormValues: PropTypes.objectOf(PropTypes.any),
  setLeadInspectorPartyGuid: PropTypes.func.isRequired,
  handleUpdateLeadInspector: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
  updateLeadInspectorFormValues: {},
};

export class UpdateNOWLeadInspectorModal extends Component {
  state = {
    disableButton: false,
  };

  invalidUpdateLeadInspectorPayload = (values) =>
    !values.lead_inspector_party_guid || this.state.disableButton;

  handleUpdateLeadInspector = () => {
    this.setState({ disableButton: true });
    this.props.handleUpdateLeadInspector();
  };

  render() {
    return (
      <div>
        <Row gutter={16}>
          <Col span={24}>
            <UpdateNOWLeadInspectorForm
              initialValues={{
                lead_inspector_party_guid: this.props.lead_inspector_party_guid,
              }}
              inspectors={this.props.inspectors}
              setLeadInspectorPartyGuid={this.props.setLeadInspectorPartyGuid}
              onSubmit={this.props.handleUpdateLeadInspector}
              closeModal={this.props.closeModal}
              isModal
              title="Update Lead Inspector"
            />
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  updateLeadInspectorFormValues: getFormValues(FORM.UPDATE_NOW_LEAD_INSPECTOR)(state) || {},
});

UpdateNOWLeadInspectorModal.propTypes = propTypes;
UpdateNOWLeadInspectorModal.defaultProps = defaultProps;

export default connect(mapStateToProps)(UpdateNOWLeadInspectorModal);
