import React, { Component } from "react";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import { Button, Popconfirm } from "antd";
import PropTypes from "prop-types";
import * as FORM from "@/constants/forms";
import AddNoticeOfDepartureForm from "@/components/Forms/noticeOfDeparture/AddNoticeOfDepartureForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  afterClose: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  addNoticeOfDepartureFormValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  addNoticeOfDepartureFormValues: {},
};

export class AddNODModal extends Component {
  state = { submitting: false };

  handleNoticeOfDepartureSubmit = () => {
    this.setState({ submitting: true });
    const { permitNumber } = this.props.addNoticeOfDepartureFormValues;
    this.props
      .onSubmit(permitNumber, this.props.addNoticeOfDepartureFormValues)
      .then(() => this.close())
      .finally(() => this.setState({ submitting: false }));
  };

  close = () => {
    this.props.closeModal();
    this.props.afterClose();
  };

  render = () => {
    return (
      <div>
        <AddNoticeOfDepartureForm
          initialValues={this.props.initialValues}
          permits={this.props.permits}
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
          <Button
            disabled={this.state.submitting}
            onClick={(event) => this.handleNoticeOfDepartureSubmit(event)}
          >
            Submit
          </Button>
        </div>
      </div>
    );
  };
}

const mapStateToProps = (state) => ({
  addNoticeOfDepartureFormValues: getFormValues(FORM.ADD_NOTICE_OF_DEPARTURE)(state) || {},
});

AddNODModal.propTypes = propTypes;
AddNODModal.defaultProps = defaultProps;

export default connect(mapStateToProps)(AddNODModal);
