import React from "react";
import { Field, reduxForm } from "redux-form";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  // initialValues is used by reduxForm magic
  // eslint-disable-next-line react/no-unused-prop-types
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
};

// this should be stateful once fully implemented
export const NoticeOfWorkSearchForm = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={6}>
        <Col md={24} xs={24}>
          <Field
            id="mine_search"
            name="mine_search"
            component={renderConfig.FIELD}
            placeholder="Search by mine name or number"
          />
        </Col>
      </Row>
      <div className="right center-mobile">
        <Button className="full-mobile" type="primary" htmlType="submit">
          <SearchOutlined />
        </Button>
      </div>
    </Form>
  );
};

NoticeOfWorkSearchForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.NOTICE_OF_WORK_SEARCH,
  touchOnBlur: false,
  enableReinitialize: true,
})(NoticeOfWorkSearchForm);
