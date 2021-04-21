import React from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Typography, Divider, Row, Col } from "antd";

/**
 * @constant RenderLabel
 */

const propTypes = {
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  indentText: PropTypes.string,
  className: PropTypes.string,
};

const defaultProps = {
  className: "",
  indentText: undefined,
};

const RenderLabel = (props) => {
  return (
    <Form.Item>
      <Row className={props.className}>
        {props.indentText && (
          <>
            <Col span={2}>
              <Typography.Paragraph disabled>{props.indentText}</Typography.Paragraph>
            </Col>
            <Col span={1}>
              <Divider type="vertical" plain />
            </Col>
          </>
        )}
        <Col span={props.indentText ? 21 : 24}>
          <Typography.Paragraph
            ellipsis={{
              expandable: true,
              rows: 3,
            }}
          >
            {props.input.value}
          </Typography.Paragraph>
        </Col>
      </Row>
    </Form.Item>
  );
};

RenderLabel.propTypes = propTypes;
RenderLabel.defaultProps = defaultProps;

export default RenderLabel;
