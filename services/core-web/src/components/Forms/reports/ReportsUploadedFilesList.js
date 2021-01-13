import React from "react";
import PropTypes from "prop-types";
import { Col, Row, Popconfirm } from "antd";
import { CloseOutlined } from "@ant-design/icons";

const propTypes = {
  files: PropTypes.arrayOf(PropTypes.any).isRequired,
  onRemoveFile: PropTypes.func.isRequired,
};

export const ReportsUploadedFilesList = (props) => (
  <div>
    {props.files.map((file) => (
      <div className="padding-sm margin-small lightest-grey-bg" key={file.mine_document_guid}>
        <Row className="padding-sm">
          <Col span={21}>
            <p className="uploaded-file left">{file.document_name}</p>
          </Col>
          <Col span={3} className="right">
            <Popconfirm
              placement="top"
              title={[<h3>Are you sure you want to remove this file?</h3>]}
              okText="Yes"
              cancelText="No"
              onConfirm={() => props.onRemoveFile(file)}
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

ReportsUploadedFilesList.propTypes = propTypes;

export default ReportsUploadedFilesList;
