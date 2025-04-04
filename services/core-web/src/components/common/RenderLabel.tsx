import React, { FC } from "react";
import { Typography, Divider, Row, Col, Form } from "antd";
import { BaseInputProps } from "@mds/common/components/forms/BaseInput";


interface RenderLabelProps extends BaseInputProps {
  indentText?: string;
  className?: string;
}
/**
 * 
 * @deprecated - only used in GenerateDocumentFormField, don't add to new cases
 */
const RenderLabel: FC<RenderLabelProps> = ({ className = "", ...props }) => {
  return (
    <Form.Item>
      <Row className={className}>
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

export default RenderLabel;
