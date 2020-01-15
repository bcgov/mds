import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Col, Row, Popconfirm } from "antd";
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
          <Col>
            <UpdateNOWLeadInspectorForm
              initialValues={{
                lead_inspector_party_guid: this.props.lead_inspector_party_guid,
              }}
              inspectors={this.props.inspectors}
              setLeadInspectorPartyGuid={this.props.setLeadInspectorPartyGuid}
            />
          </Col>
        </Row>
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
            onClick={this.handleUpdateLeadInspector}
            disabled={this.invalidUpdateLeadInspectorPayload(
              this.props.updateLeadInspectorFormValues
            )}
          >
            {this.props.title}
          </Button>
        </div>
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
