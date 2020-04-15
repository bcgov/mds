import React from "react";
import PropTypes from "prop-types";
import { Col, Row, Popconfirm, Icon } from "antd";

import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  relatedDocuments: PropTypes.arrayOf(CustomPropTypes.mineDocument).isRequired,
  handleRemovePermitAmendmentDocument: PropTypes.func.isRequired,
};

export const PermitAmendmentUploadedFilesList = (props) => (
  <div>
    {props.relatedDocuments.map((file) => (
      <div
        className="padding-small margin-small lightest-grey-bg"
        key={file.permit_amendment_document_guid}
      >
        <Row className="padding-small">
          <Col span={21}>
            <p className="uploaded-file left">{file.document_name}</p>
          </Col>
          <Col span={3} className="right">
            <Popconfirm
              placement="top"
              title={[
                <h3>Are you sure you want to remove this file?</h3>,
                <p>This cannot be undone.</p>,
              ]}
              okText="Yes"
              cancelText="No"
              onConfirm={() => {
                props.handleRemovePermitAmendmentDocument(
                  props.relatedDocuments,
                  file.permit_amendment_document_guid
                );
              }}
            >
              <button type="button">
                <Icon type="close" />
              </button>
            </Popconfirm>
          </Col>
        </Row>
      </div>
    ))}
  </div>
);

PermitAmendmentUploadedFilesList.propTypes = propTypes;

export default PermitAmendmentUploadedFilesList;
