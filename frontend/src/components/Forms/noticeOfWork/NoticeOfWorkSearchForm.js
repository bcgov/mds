import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import PropTypes from "prop-types";
import { Form, Button, Col, Row, Icon } from "antd";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
};

// this should be stateful once fully implemented
// eslint-disable-next-line react/prefer-stateless-function
export class NoticeOfWorkSearchForm extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={6}>
          <Col md={24} xs={24}>
            <Field
              id="search"
              name="search"
              component={renderConfig.FIELD}
              placeholder="Search by Notice of Work, mine name, or mine number"
            />
          </Col>
        </Row>
        <div className="right center-mobile">
          <Button className="full-mobile" type="primary" htmlType="submit">
            <Icon type="search" />
          </Button>
        </div>
      </Form>
    );
  }
}

NoticeOfWorkSearchForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.NOTICE_OF_WORK_SEARCH,
  touchOnBlur: false,
})(NoticeOfWorkSearchForm);
