import React, { Component } from "react";
import PropTypes from "prop-types";
import { Col, Row, Alert } from "antd";
import Highlight from "react-highlighter";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import { getDropdownNoticeOfWorkApplicationStatusOptions } from "@common/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import UpdateNOWStatusForm from "@/components/Forms/noticeOfWork/UpdateNOWStatusForm";
import NOWRejectionReason from "@/components/noticeOfWork/applications/NOWRejectionReason";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  title: PropTypes.string.isRequired,
  now_application_status_code: PropTypes.string.isRequired,
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
        <p>
          The Notice of Work application was <Highlight search="Rejected">Rejected</Highlight> for
          the following reason:
        </p>
        <br />
        <NOWRejectionReason />
        <Alert
          message="This action is final"
          description="No changes or additions can be made to this application after the permit has been issued. Ensure the issues above are resolved after reverting rejection."
          type="warning"
          showIcon
          style={{ textAlign: "left" }}
        />
        <br />
        <Row gutter={16}>
          <Col span={24}>
            <UpdateNOWStatusForm
              initialValues={{
                now_application_status_code: this.props.now_application_status_code,
              }}
              dropdownNoticeOfWorkApplicationStatusOptions={
                this.props.dropdownNoticeOfWorkApplicationStatusOptions
              }
              disabled={this.invalidUpdateStatusPayload(this.props.updateStatusFormValues)}
              onSubmit={this.props.onSubmit}
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
