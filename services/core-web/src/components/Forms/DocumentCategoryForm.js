import React from "react";
import PropTypes from "prop-types";
import { Col, Row, Popconfirm } from "antd";
import { CloseOutlined } from "@ant-design/icons";

import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.mineDocument).isRequired,
};

export const DocumentCategoryForm = (props) => (
  <div>
    {props.documents.map((file) => (
      <div
        className="padding-sm margin-small lightest-grey-bg"
        key={file.permit_amendment_document_guid}
      >
        <Row className="padding-sm">
          <Col span={21}>
            <p className="uploaded-file left">{file.document_name}</p>
          </Col>
          <Col span={3} className="right">
            <Popconfirm
              placement="top"
              title={[
                <p>Are you sure you want to remove this file?</p>,
                <p>This cannot be undone.</p>,
              ]}
              okText="Yes"
              cancelText="No"
              onConfirm={() => {
                console.log("we're doing something here");
              }}
            >
              <button type="button">
                <CloseOutlined />
              </button>
            </Popconfirm>
          </Col>
        </Row>
      </div>
    ))}
  </div>
);

DocumentCategoryForm.propTypes = propTypes;

export default DocumentCategoryForm;
