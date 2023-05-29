import React, { FC } from "react";
import { Col, Row, Popconfirm } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { IPermitAmendmentMineDocument } from "@mds/common";

interface PermitAmendmentUploadedFilesListProps {
  relatedDocuments: IPermitAmendmentMineDocument[];
  handleRemovePermitAmendmentDocument: (arg1: any[], arg2: string) => any;
}

export const PermitAmendmentUploadedFilesList: FC<PermitAmendmentUploadedFilesListProps> = (
  props
) => (
  <div>
    {props.relatedDocuments.map((file) => (
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
              /* eslint react/jsx-key: 0 */
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
                <CloseOutlined />
              </button>
            </Popconfirm>
          </Col>
        </Row>
      </div>
    ))}
  </div>
);

export default PermitAmendmentUploadedFilesList;
