import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Col, Row, Popconfirm, Typography, Checkbox } from "antd";
import CoreTable from "@/components/common/CoreTable";
import { formatDate, dateSorter, nullableStringSorter } from "@common/utils/helpers";

const propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  projectGuid: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  optionalProps: PropTypes.shape({
    documents: PropTypes.arrayOf(PropTypes.any),
    status_code: PropTypes.string,
  }),
};

const defaultProps = {
  optionalProps: {
    documents: [],
    status_code: "",
  },
};

export const UpdateProjectDecisionPackageDocumentModal = (props) => {
  const decisionPackageEligibleDocuments = props?.optionalProps?.documents.filter(
    (doc) => doc.project_decision_package_document_type_code !== "INM"
  );
  const [files, setFiles] = useState(decisionPackageEligibleDocuments);
  const [selectAll, setSelectAll] = useState(false);
  const filesInDecisionPackage = files.filter(
    (file) => file.project_decision_package_document_type_code === "DCP"
  )?.length;

  const handleFileCheckboxChange = (event, record) => {
    const fileIndex = files.findIndex(
      (file) => file?.mine_document_guid === record?.mine_document_guid
    );
    if (fileIndex >= 0) {
      const newDocumentTypeCode = event.target?.checked ? "DCP" : "ADG";
      const updatedFiles = [...files];
      updatedFiles[fileIndex].project_decision_package_document_type_code = newDocumentTypeCode;
      setFiles(updatedFiles);
    }
  };

  const handleSelectAllCheckboxChange = (event) => {
    const newDocumentTypeCode = event.target?.checked ? "DCP" : "ADG";
    const updatedFiles = files.map((file) => {
      return {
        ...file,
        project_decision_package_document_type_code: newDocumentTypeCode,
      };
    });
    setSelectAll(event.target?.checked);
    setFiles(updatedFiles);
  };

  const columns = [
    {
      title: <Checkbox checked={selectAll} onChange={handleSelectAllCheckboxChange} />,
      dataIndex: "project_decision_package_document_type_code",
      render: (text, record) => (
        <Checkbox
          checked={text === "DCP"}
          onChange={(event) => handleFileCheckboxChange(event, record)}
        />
      ),
    },
    {
      title: "File Name",
      dataIndex: "document_name",
      sorter: nullableStringSorter("document_name"),
      render: (text) => <div title="File Name">{text}</div>,
    },
    {
      title: "Uploaded",
      dataIndex: "upload_date",
      sorter: dateSorter("upload_date"),
      render: (text) => <div title="Uploaded">{formatDate(text)}</div>,
    },
  ];

  return (
    <>
      <Row gutter={16}>
        <Col>
          <Typography.Title level={4}>Select Files for Decision Package</Typography.Title>
          <Typography.Text>
            Select documents that will be displayed to proponents as a part of this application’s
            decision package. You can choose proponent upload documents as well as ministry uploaded
            documents.
          </Typography.Text>
          <br />
          <br />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <CoreTable columns={columns} dataSource={files} condition />
        </Col>
      </Row>
      <Row>
        <Col xs={24} md={12}>
          <br />
          <Typography.Text
            strong
          >{`${filesInDecisionPackage} files selected for decision package.`}</Typography.Text>
        </Col>
        <Col xs={24} md={12}>
          <br />
          <div className="right center-mobile">
            <Popconfirm
              placement="topRight"
              title="Are you sure you want to cancel?"
              onConfirm={props.closeModal}
              okText="Yes"
              cancelText="No"
              disabled={props.submitting}
            >
              <Button className="full-mobile" type="secondary" disabled={props.submitting}>
                Cancel
              </Button>
            </Popconfirm>
            <Button
              className="full-mobile"
              type="primary"
              onClick={(event) => {
                const submitPayload = {
                  status_code: props?.optionalProps?.status_code,
                  documents: files,
                };
                props.handleSubmit(event, submitPayload);
                return props.closeModal();
              }}
              loading={props.submitting}
            >
              Update
            </Button>
          </div>
        </Col>
      </Row>
    </>
  );
};

UpdateProjectDecisionPackageDocumentModal.propTypes = propTypes;
UpdateProjectDecisionPackageDocumentModal.defaultProps = defaultProps;

export default UpdateProjectDecisionPackageDocumentModal;
