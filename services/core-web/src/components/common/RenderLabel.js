import React from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Typography, Divider, Row, Col } from "antd";

const { Paragraph } = Typography;

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
              <Paragraph disabled>{props.indentText}</Paragraph>
            </Col>
            <Col span={1}>
              <Divider type="vertical" plain />
            </Col>
          </>
        )}
        <Col span={props.indentText ? 21 : 24}>
          <Paragraph
            ellipsis={{
              expandable: true,
              rows: 3,
            }}
          >
            {props.input.value}
          </Paragraph>
        </Col>
      </Row>
    </Form.Item>
  );
};

RenderLabel.propTypes = propTypes;
RenderLabel.defaultProps = defaultProps;

export default RenderLabel;
