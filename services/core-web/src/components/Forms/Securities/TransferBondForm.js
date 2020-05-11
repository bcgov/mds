/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import { required } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import * as FORM from "@/constants/forms";
import RenderSelect from "@/components/common/RenderSelect";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  bond: CustomPropTypes.bond.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

export class TransferBondForm extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row>
          <Col>
            <Form.Item>
              <Field
                id="permit_guid"
                name="permit_guid"
                label="Select a Permit *"
                component={RenderSelect}
                data={this.props.permits.map((p) => {
                  return { value: p.permit_guid, label: p.permit_no };
                })}
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md={24}>
            <Form.Item>
              <Field id="note" name="note" label="Notes" component={RenderAutoSizeField} />
            </Form.Item>
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

TransferBondForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.TRANSFER_BOND,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.TRANSFER_BOND),
})(TransferBondForm);
