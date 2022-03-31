import React, { Component } from "react";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import { Button, Popconfirm } from "antd";
import PropTypes from "prop-types";
import * as FORM from "@/constants/forms";
import AddNODForm from "@/components/Forms/nods/AddNODForm";

const propTypes = {
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  afterClose: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
};

export class AddNODModal extends Component {
  state = { submitting: false };

  close = () => {
    this.props.closeModal();
    this.props.afterClose();
  };

  render = () => {
    return (
      <div>
        {/* TODO: Add permit options and manager options */}
        <AddNODForm
          initialValues={this.props.initialValues}
          permitNumberOptions={[]}
          mineManagerOptions={[]}
          mineGuid={this.props.mineGuid}
        />
        <div className="ant-modal-footer">
          <Popconfirm
            placement="top"
            title="Are you sure you want to cancel?"
            okText="Yes"
            cancelText="No"
            onConfirm={this.close}
            disabled={this.state.submitting}
          >
            <Button disabled={this.state.submitting}>Cancel</Button>
          </Popconfirm>
          <Button disabled={this.state.submitting}>Submit</Button>
        </div>
      </div>
    );
  };
}

const mapStateToProps = (state) => ({
  addIncidentFormValues: getFormValues(FORM.ADD_INCIDENT)(state) || {},
});

AddNODModal.propTypes = propTypes;

export default connect(mapStateToProps)(AddNODModal);
