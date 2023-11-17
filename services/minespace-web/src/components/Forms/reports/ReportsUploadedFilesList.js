import React from "react";
import PropTypes from "prop-types";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import { Col, Row, Popconfirm, Button } from "antd";

const propTypes = {
  files: PropTypes.arrayOf(PropTypes.any).isRequired,
  onRemoveFile: PropTypes.func.isRequired,
};

export const ReportsUploadedFilesList = (props) =>
  (props.files &&
    props.files.length > 0 &&
    props.files.map((file) => (
      <div key={file.mine_document_guid} className="padding-sm margin-small background-bg">
        <Row className="padding-sm">
          <Col span={21}>
            <p className="uploaded-file left">{file.document_name}</p>
          </Col>
          <Col span={3} className="right">
            <Popconfirm
              placement="top"
              title={<h3>Are you sure you want to remove this file?</h3>}
              okText="Yes"
              cancelText="No"
              onConfirm={() => props.onRemoveFile(file)}
            >
              <Button>
                <CloseOutlined />
              </Button>
            </Popconfirm>
          </Col>
        </Row>
      </div>
    ))) || <div>You haven&apos;t added any new documents to this submission yet.</div>;

ReportsUploadedFilesList.propTypes = propTypes;

export default ReportsUploadedFilesList;
