import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Col, Row, Popconfirm } from "antd";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import { getDropdownNoticeOfWorkApplicationStatusOptions } from "@common/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import UpdateNOWStatusForm from "@/components/Forms/noticeOfWork/UpdateNOWStatusForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  title: PropTypes.string.isRequired,
  now_application_status_code: PropTypes.string.isRequired,
  updateStatusFormValues: PropTypes.objectOf(PropTypes.any),
  dropdownNoticeOfWorkApplicationStatusOptions: CustomPropTypes.options.isRequired,
  setStatus: PropTypes.func.isRequired,
  handleUpdateStatus: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
  updateStatusFormValues: {},
};

export class UpdateNOWStatusModal extends Component {
  state = {
    disableButton: false,
  };

  invalidUpdateStatusPayload = (values) =>
    !values.now_application_status_code || this.state.disableButton;

  handleUpdateStatus = () => {
    this.setState({ disableButton: true });
    this.props.handleUpdateStatus();
  };

  render() {
    return (
      <div>
        <Row gutter={16}>
          <Col>
            <UpdateNOWStatusForm
              initialValues={{
                now_application_status_code: this.props.now_application_status_code,
              }}
              dropdownNoticeOfWorkApplicationStatusOptions={
                this.props.dropdownNoticeOfWorkApplicationStatusOptions
              }
              setStatus={this.props.setStatus}
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
            onClick={this.handleUpdateStatus}
            disabled={this.invalidUpdateStatusPayload(this.props.updateStatusFormValues)}
          >
            {this.props.title}
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  updateStatusFormValues: getFormValues(FORM.UPDATE_NOW_STATUS)(state) || {},
  dropdownNoticeOfWorkApplicationStatusOptions: getDropdownNoticeOfWorkApplicationStatusOptions(
    state
  ),
});

UpdateNOWStatusModal.propTypes = propTypes;
UpdateNOWStatusModal.defaultProps = defaultProps;

export default connect(mapStateToProps)(UpdateNOWStatusModal);
