import React, { Component } from "react";
import PropTypes from "prop-types";
import { Col, Row } from "antd";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import { getDropdownNoticeOfWorkApplicationStatusOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import UpdateNOWStatusForm from "@/components/Forms/noticeOfWork/UpdateNOWStatusForm";
import NOWStatusReason from "@/components/noticeOfWork/applications/NOWStatusReason";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  title: PropTypes.string.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
  closeModal: PropTypes.func.isRequired,
  updateStatusFormValues: PropTypes.objectOf(PropTypes.any),
  dropdownNoticeOfWorkApplicationStatusOptions: CustomPropTypes.options.isRequired,
  onSubmit: PropTypes.func.isRequired,
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

  render() {
    return (
      <div>
        <NOWStatusReason />
        <br />
        <Row gutter={16}>
          <Col span={24}>
            <UpdateNOWStatusForm
              initialValues={this.props.initialValues}
              dropdownNoticeOfWorkApplicationStatusOptions={
                this.props.dropdownNoticeOfWorkApplicationStatusOptions
              }
              disabled={this.invalidUpdateStatusPayload(this.props.updateStatusFormValues)}
              onSubmit={this.props.onSubmit}
              closeModal={this.props.closeModal}
              title={this.props.title}
            />
          </Col>
        </Row>
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
