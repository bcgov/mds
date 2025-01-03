import React from "react";
import { Field } from "redux-form";
import PropTypes from "prop-types";
import { Button, Col, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
};

// this should be stateful once fully implemented
export const NoticeOfWorkSearchForm = (props) => {
  return (
    <FormWrapper
      initialValues={props.initialValues}
      name={FORM.NOTICE_OF_WORK_SEARCH}
      reduxFormConfig={{
        touchOnBlur: false,
        enableReinitialize: true,
      }}
      onSubmit={props.onSubmit}>
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
    </FormWrapper>
  );
};

NoticeOfWorkSearchForm.propTypes = propTypes;

export default NoticeOfWorkSearchForm;
